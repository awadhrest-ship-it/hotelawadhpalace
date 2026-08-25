import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import BookingSearchForm from '../components/BookingSearchForm';
import RoomCard from '../components/RoomCard';
import TestimonialsSection from '../components/TestimonialsSection';
import GalleryCategorySection from '../components/GalleryCategorySection';
import Counter from '../components/Counter';
import { useOwlCarousel } from '../hooks/useOwlCarousel';

const ICON_BOXES = [
  { icon: 'flaticon-room-service', title: 'Restaurants', text: 'Fine dining crafted by award-winning chefs.' },
  { icon: 'flaticon-stones', title: 'Wellness & Spa', text: 'Rejuvenate mind and body in our tranquil spa.' },
  { icon: 'flaticon-wifi', title: 'Free Wifi', text: 'Stay connected with complimentary high-speed Wi-Fi.' },
  { icon: 'flaticon-cards', title: 'Game Zone', text: 'Unwind with games for every member of the family.' },
];

const ABOUT_SLIDES = [1, 2, 3, 4, 5];

// Shared hero sizing/position — kept in one place so every hero (with or
// without CMS data) renders at the exact same size and position.
//
// The hero photo is a real <img> in normal flow (height:auto), not a CSS
// background — a CSS background always has to be cropped ('cover') or
// letterboxed ('contain') to fill a fixed box. Using an <img> means the
// box's height simply becomes whatever the image's own aspect ratio
// needs, so the entire uploaded photo is always visible, nothing is
// ever cropped top or bottom, and the text overlay (positioned
// absolutely, vertically centered via the theme's `.wt-bnr-inr-entry`
// table-cell trick — same mechanism PageBanner.jsx already uses) simply
// sizes itself to match.
const HERO_MIN_HEIGHT = 420;

const HERO_TITLE_STYLE = {
  maxWidth: 700,
  fontSize: 'clamp(30px, 4.4vw, 56px)',
  lineHeight: 1.25,
  marginBottom: 20,
  textShadow: '0 2px 12px rgba(0,0,0,0.35)',
};

const HERO_SUBTITLE_STYLE = {
  maxWidth: 560,
  fontSize: 'clamp(15px, 1.6vw, 18px)',
  marginBottom: 30,
  textShadow: '0 1px 6px rgba(0,0,0,0.3)',
};

function HeroText({ title, subtitle }) {
  return (
    <div>
      <h1 className="text-white font-weight-900" style={HERO_TITLE_STYLE}>
        {title}
      </h1>
      <p className="text-white" style={HERO_SUBTITLE_STYLE}>
        {subtitle}
      </p>
      <Link to="/rooms" className="btn-half site-button button-lg">
        <span>Explore Rooms</span><em />
      </Link>
    </div>
  );
}

function HeroSlide({ imageUrl, imageAlt, children }) {
  return (
    <div className="wt-bnr-inr overlay-wraper" style={{ position: 'relative' }}>
      <img
        src={imageUrl}
        alt={imageAlt || ''}
        style={{ display: 'block', width: '100%', height: 'auto', minHeight: HERO_MIN_HEIGHT, objectFit: 'cover' }}
      />
      <div className="overlay-main bg-black opacity-05" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} />
      <div className="container" style={{ position: 'absolute', top: 0, left: '50%', right: 'auto', bottom: 0, transform: 'translateX(-50%)', zIndex: 2, width: '100%' }}>
        <div className="wt-bnr-inr-entry" style={{ textAlign: 'left', height: '100%' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function HeroSlider({ heroes }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverDir, setHoverDir] = useState(null); // 'prev' | 'next' | null
  const [showLabel, setShowLabel] = useState(false);
  const hoverTimer = useRef(null);
  const labelTimer = useRef(null);

  const ref = useOwlCarousel(
    {
      loop: heroes.length > 1,
      autoplay: true,
      autoplayTimeout: 5000,
      items: 1,
      nav: true,
      dots: true,
      navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
    },
    [heroes.length]
  );

  // Track which slide is actually showing so the hover-preview thumbnail
  // can work out what the *next*/*previous* slide will be. relative()
  // converts owl's internal (clone-inclusive) index back to a plain
  // 0-based index into `heroes`.
  useEffect(() => {
    const $ = window.jQuery;
    if (!$ || !ref.current || heroes.length < 2) return undefined;
    const $el = $(ref.current);
    const onChanged = (e) => {
      if (typeof e.item?.index !== 'number' || !e.relatedTarget?.relative) return;
      setActiveIndex(e.relatedTarget.relative(e.item.index));
    };
    $el.on('changed.owl.carousel', onChanged);
    return () => $el.off('changed.owl.carousel', onChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroes.length]);

  const goTo = (dir) => {
    const $ = window.jQuery;
    if (!$ || !ref.current) return;
    $(ref.current).trigger(dir === 'next' ? 'next.owl.carousel' : 'prev.owl.carousel');
  };

  // Two-stage reveal to match the reference: the thumbnail image fades in
  // first, then the "Click" label fades in underneath it a beat later.
  const showPreview = (dir) => {
    clearTimeout(hoverTimer.current);
    clearTimeout(labelTimer.current);
    hoverTimer.current = setTimeout(() => {
      setHoverDir(dir);
      labelTimer.current = setTimeout(() => setShowLabel(true), 260);
    }, 120);
  };
  const hidePreview = () => {
    clearTimeout(hoverTimer.current);
    clearTimeout(labelTimer.current);
    setShowLabel(false);
    setHoverDir(null);
  };

  // Delegated hover detection: Owl Carousel injects the .owl-prev/.owl-next
  // buttons into the DOM itself (they're not React elements), so listening
  // on the carousel root and checking e.target lets React's normal event
  // bubbling pick up hovers over them without touching the plugin's markup.
  const handleMouseOver = (e) => {
    if (heroes.length < 2) return;
    if (e.target.closest('.owl-next')) showPreview('next');
    else if (e.target.closest('.owl-prev')) showPreview('prev');
  };
  const handleMouseOut = (e) => {
    if (e.target.closest('.owl-next') || e.target.closest('.owl-prev')) hidePreview();
  };

  if (!heroes || heroes.length === 0) {
    return (
      <HeroSlide imageUrl="/assets/images/main-slider/slider1/slide1.jpg" imageAlt="Hotel Awadh Palace">
        <HeroText
          title="Welcome to Hotel Awadh Palace"
          subtitle="A place where comfort meets elegance. Book your stay and experience genuine hospitality."
        />
      </HeroSlide>
    );
  }

  const previewIndex = hoverDir
    ? (activeIndex + (hoverDir === 'next' ? 1 : -1) + heroes.length) % heroes.length
    : null;
  const previewHero = previewIndex !== null ? heroes[previewIndex] : null;
  // Hugs the arrow button directly: the nav buttons are 35px wide, sat
  // flush against the container edge (left:0 / right:0), so 42px leaves
  // just a small gap instead of floating off in open space.
  const edgeOffset = 42;

  return (
    <div style={{ position: 'relative' }} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      <div ref={ref} className="owl-carousel owl-btn-vertical-center owl-dots-bottom-center">
        {heroes.map((hero) => (
          <div key={hero._id} className="item">
            <HeroSlide imageUrl={hero.image.url} imageAlt={hero.title}>
              {hero.title || hero.subtitle ? (
                <div>
                  {hero.title && (
                    <h1 className="text-white font-weight-900" style={HERO_TITLE_STYLE}>
                      {hero.title}
                    </h1>
                  )}
                  {hero.subtitle && (
                    <p className="text-white" style={HERO_SUBTITLE_STYLE}>
                      {hero.subtitle}
                    </p>
                  )}
                  <Link to="/rooms" className="btn-half site-button button-lg">
                    <span>Explore Rooms</span><em />
                  </Link>
                </div>
              ) : (
                <HeroText
                  title="Welcome to Hotel Awadh Palace"
                  subtitle="A place where comfort meets elegance. Book your stay and experience genuine hospitality."
                />
              )}
            </HeroSlide>
          </div>
        ))}
      </div>

      {heroes.length > 1 && (
        <div
          onClick={() => hoverDir && goTo(hoverDir)}
          style={{
            position: 'absolute',
            top: '50%',
            [hoverDir === 'prev' ? 'left' : 'right']: edgeOffset,
            transform: `translateY(-50%) scale(${hoverDir ? 1 : 0.85})`,
            opacity: hoverDir ? 1 : 0,
            pointerEvents: hoverDir ? 'auto' : 'none',
            transition: 'opacity 220ms ease, transform 220ms ease',
            zIndex: 5,
            width: 150,
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(0,0,0,0.45)',
          }}
        >
          {previewHero && (
            <img
              src={previewHero.image.url}
              alt={previewHero.title || ''}
              style={{ display: 'block', width: '100%', height: 100, objectFit: 'cover' }}
            />
          )}
          <div
            style={{
              textAlign: 'center',
              color: '#fff',
              background: 'rgba(0,0,0,0.75)',
              fontSize: 12,
              letterSpacing: 1,
              textTransform: 'uppercase',
              padding: '6px 0',
              opacity: showLabel ? 1 : 0,
              transform: showLabel ? 'translateY(0)' : 'translateY(-6px)',
              transition: 'opacity 200ms ease, transform 200ms ease',
            }}
          >
            Click
          </div>
        </div>
      )}
    </div>
  );
}

function AboutSlider() {
  const ref = useOwlCarousel({ loop: true, autoplay: true, items: 1, nav: true, dots: false });
  return (
    <div ref={ref} className="home-about-slider owl-carousel owl-btn-vertical-center">
      {ABOUT_SLIDES.map((n) => (
        <div className="item" key={n}>
          <div className="home-about-slider-pic">
            <img src={`/assets/images/about/pic${n}.jpg`} alt={`About Awadh Palace ${n}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RoomsCarousel({ rooms }) {
  const ref = useOwlCarousel(
    {
      loop: rooms.length > 3,
      autoplay: true,
      margin: 20,
      nav: true,
      dots: false,
      navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
      responsive: { 0: { items: 1 }, 480: { items: 1 }, 991: { items: 2 }, 1200: { items: 2 }, 1366: { items: 3 } },
    },
    [rooms.length]
  );
  if (rooms.length === 0) return null;
  return (
    <div ref={ref} className="owl-carousel owl-carousel-filter2 owl-btn-bottom-center">
      {rooms.map((room) => (
        <RoomCard key={room._id} room={room} />
      ))}
    </div>
  );
}

function formatBlogDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

// "OUR BLOG" — reuses the same BlogPost data/admin panel as the /news page,
// showing the two most recent posts, same markup as the reference's
// blog-post latest-blog-1 date-style-2 cards.
function BlogSection({ posts }) {
  if (!posts || posts.length === 0) return null;
  return (
    <div className="section-full p-t90 p-b60 bg-white">
      <div className="container">
        <div className="section-head text-left">
          <h2 className="m-b5" data-title="Blog">Our Latest Blog</h2>
          <div className="wt-separator-outer">
            <div className="wt-separator site-bg-primary" />
          </div>
        </div>
        <div className="section-content">
          <div className="row">
            {posts.slice(0, 2).map((post) => (
              <div className="col-lg-6 col-md-6" key={post._id}>
                <div className="blog-post latest-blog-1 date-style-2">
                  <div className="wt-post-media wt-img-effect zoom-slow">
                    <Link to={`/news/${post.slug}`}>
                      <img src={post.coverImage?.url || '/assets/images/blog/pic1.jpg'} alt={post.title} />
                    </Link>
                  </div>
                  <div className="wt-post-info">
                    <div className="post-date"><strong>{formatBlogDate(post.publishedAt || post.createdAt)}</strong></div>
                    <div className="wt-post-meta">
                      <ul className="clearfix">
                        <li className="post-author">
                          <div className="post-author-pic">
                            <span><strong> By</strong> <Link to={`/news/${post.slug}`}>{post.author}</Link></span>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="wt-post-title">
                      <h3 className="post-title"><Link to={`/news/${post.slug}`}>{post.title}</Link></h3>
                    </div>
                    <div className="wt-post-text">
                      <p>{post.excerpt}</p>
                    </div>
                    <div className="readmore-line">
                      <Link to={`/news/${post.slug}`} className="site-button-ink site-text-primary font-weight-900">Read More</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// "OUR SPECIALIZATION" — full-bleed background image swaps on hover of the
// four feature tiles, exactly like the reference's bg-changer + hover_tab()
// jQuery behaviour, reimplemented as local React state (same pattern the
// app already uses elsewhere instead of loading custom.js globally).
function SpecializationSection({ data }) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (!data) return null;
  const counters = [...data.counters].sort((a, b) => a.order - b.order);
  const features = [...data.features].sort((a, b) => a.order - b.order);

  return (
    <div className="section-full bg-change-section overlay-wraper p-tb90" data-toggle="tab-hover">
      <div className="overlay-main bg-black opacity-06" />
      <div className="bg-changer">
        {features.map((f, i) => (
          <div
            key={f._id}
            className={`section-bg${i === activeIndex ? ' active' : ''}`}
            style={{ backgroundImage: `url(${f.image.url})` }}
          />
        ))}
      </div>

      <div className="container">
        <div className="section-head text-left">
          <h2 className="m-b5 text-white" data-title="Specialization">Our Specialization</h2>
          <div className="wt-separator-outer">
            <div className="wt-separator site-bg-primary" />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="services-part-left">
              <div className="text-white">
                <h3 className="m-t0">{data.heading}</h3>
                <p>{data.text}</p>
              </div>
              <div className="section-content">
                <div className="row">
                  {counters.map((c) => (
                    <div className="col-md-4 col-sm-4 col-xs-4 col-xs-100pc" key={c._id}>
                      <Counter number={c.number} label={c.label} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="row no-col-gap twm-our-speci-box-wrap">
              {features.map((f, i) => (
                <div className="col-md-6 col-sm-6 col-xs-6 col-xs-100pc" key={f._id}>
                  <div
                    className="wt-icon-box-wraper p-tb20 center bdr-1 bdr-solid bdr-white bgcall-block hover-box-effect"
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <div className="icon-md site-text-primary">
                      <span className="icon-cell text-white"><i className={f.icon} /></span>
                    </div>
                    <div className="icon-content text-white">
                      <h3 className="wt-tilte m-b10">{f.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// "OUR SERVICES"
function ServicesSection({ services }) {
  if (!services || services.length === 0) return null;
  return (
    <div className="section-full p-tb90">
      <div className="container">
        <div className="section-head text-left">
          <h2 className="m-b5" data-title="Services">Our Services</h2>
          <div className="wt-separator-outer">
            <div className="wt-separator site-bg-primary" />
          </div>
        </div>
        <div className="row">
          {services.map((s) => (
            <div className="col-lg-4 col-md-6" key={s._id}>
              <div className="wt-icon-box-wraper center bdr-1 bdr-gray-light bdr-solid m-b30 p-a20 hover-box-effect v-icon-effect">
                <div className="icon-md m-b20">
                  <span className="icon-cell"><i className={`${s.icon} v-icon`} /></span>
                </div>
                <div className="icon-content">
                  <h3 className="wt-tilte">{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link to="/rooms" className="btn-half site-button button-lg m-t50"><span>View All</span><em /></Link>
        </div>
      </div>
    </div>
  );
}



// "OUR ROOMS & SUITES" section, now a tabbed view: a "Rooms" tab (backed by
// the existing Room data, unchanged carousel behaviour) plus one tab per
// Facility document (Restaurant, Bar, Rooftop, Garden, Dome, ...). Facility
// tabs, their order, and everything shown in them are fully editable from
// the admin panel (Admin > Rooms & Facilities) — nothing here is hardcoded
// beyond the "Rooms" tab's wiring to the room carousel.
function RoomsFacilitiesSection({ rooms, loadingRooms, facilities }) {
  const [activeKey, setActiveKey] = useState('rooms');

  const tabs = [
    { key: 'rooms', label: 'Rooms' },
    ...facilities.map((f) => ({ key: f.key, label: f.tabLabel })),
  ];

  const activeFacility = facilities.find((f) => f.key === activeKey) || null;

  return (
    <div className="section-full p-tb90 bg-gray">
      <div className="container">
        <div className="section-head text-center">
          <h2 className="m-b5" data-title="Suites">Our Rooms &amp; Suites</h2>
          <div className="wt-separator-outer">
            <div className="wt-separator site-bg-primary" />
          </div>
        </div>

        <ul
          style={{
            listStyle: 'none',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 14,
            margin: '0 0 40px',
            padding: 0,
          }}
        >
          {tabs.map((tab, idx) => (
            <li key={tab.key} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {idx > 0 && <span style={{ color: '#c7c2b8' }}>/</span>}
              <button
                type="button"
                onClick={() => setActiveKey(tab.key)}
                className={activeKey === tab.key ? 'site-text-primary' : ''}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  color: activeKey === tab.key ? undefined : '#1b1b1b',
                }}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {activeKey === 'rooms' ? (
        <div className="container-fluid">
          <div className="section-content">
            {loadingRooms ? (
              <p className="text-center">Loading rooms&hellip;</p>
            ) : rooms.length === 0 ? (
              <p className="text-center">Rooms will appear here shortly.</p>
            ) : (
              <RoomsCarousel rooms={rooms} />
            )}
          </div>
        </div>
      ) : (
        activeFacility && (
          <div className="container">
            <div className="row d-flex align-items-center">
              <div className="col-lg-6 col-md-12 m-b30">
                <div className="wt-img-effect zoom-slow">
                  <img
                    src={activeFacility.image?.url || '/assets/images/background/room.jpg'}
                    alt={activeFacility.name}
                    style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block', borderRadius: 4 }}
                  />
                </div>
              </div>
              <div className="col-lg-6 col-md-12 m-b30">
                {activeFacility.tagline && (
                  <h4 className="site-text-primary font-weight-700 m-b10" style={{ textTransform: 'uppercase', fontSize: 14, letterSpacing: '1px' }}>
                    {activeFacility.tagline}
                  </h4>
                )}
                <h3 className="m-b20">{activeFacility.name}</h3>
                <p>{activeFacility.description}</p>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default function Home() {
  const [heroes, setHeroes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingHeroes, setLoadingHeroes] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [blogPosts, setBlogPosts] = useState([]);
  const [specialization, setSpecialization] = useState(null);
  const [services, setServices] = useState([]);
  const [galleryCategories, setGalleryCategories] = useState([]);
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    let active = true;
    api
      .get('/hero')
      .then(({ data }) => active && setHeroes(data.data))
      .catch(() => {})
      .finally(() => active && setLoadingHeroes(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    api
      .get('/rooms', { params: { featured: 'true' } })
      .then(({ data }) => active && setRooms(data.data))
      .catch(() => {})
      .finally(() => active && setLoadingRooms(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    api.get('/blog').then(({ data }) => active && setBlogPosts(data.data)).catch(() => {});
    api.get('/specialization').then(({ data }) => active && setSpecialization(data.data)).catch(() => {});
    api.get('/services').then(({ data }) => active && setServices(data.data)).catch(() => {});
    api.get('/gallery-categories/featured').then(({ data }) => active && setGalleryCategories(data.data)).catch(() => {});
    api.get('/facilities').then(({ data }) => active && setFacilities(data.data)).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

 return (
  <>
    {/* HERO */}
    <div style={{ position: 'relative', zIndex: 1 }}>
      <HeroSlider heroes={heroes} />
    </div>

    {/* BOOKING FORM - the "booking-bar" class on BookingSearchForm's own
        root element already carries the theme's -87px overlap margin
        (see .booking-bar in style.css), so no extra margin is added here.
        It still needs an explicit stacking context above the hero: Owl
        Carousel applies a CSS transform to its internal slide track for
        the slide animation, and transformed elements create their own
        stacking context - combined with the hero's absolutely-positioned
        overlay/text layers (z-index 1/2), that was painting on top of
        this plain static sibling even though it comes later in the DOM. */}
    <div style={{ position: 'relative', zIndex: 2 }}>
      <BookingSearchForm />
    </div>

    {/* ABOUT */}
    <div className="section-full p-tb90 bg-white overflow-hide">
      <div className="container">
        <div className="section-content">
          <div className="row d-flex align-items-center">
            <div className="col-lg-6 col-md-12 text-black">
              <div className="section-head text-left">
                <h2 className="m-b5" data-title="About">About Awadh Palace</h2>
                <div className="wt-separator-outer">
                  <div className="wt-separator site-bg-primary" />
                </div>
              </div>
              <h3 className="m-t0">We will be so proud to have you as our guest.</h3>
              <p>
                From the moment you arrive, our team is dedicated to making your stay unforgettable —
                thoughtful service, comfortable rooms, and amenities designed around you.
              </p>
              <div className="row equal-wraper">
                {ICON_BOXES.map((box) => (
                  <div className="col-md-6 m-b30" key={box.title}>
                    <div className="wt-icon-box-wraper left bg-gray p-a20 hover-box-effect v-icon-effect equal-col">
                      <div className="icon-md m-b20">
                        <span className="icon-cell"><i className={`${box.icon} v-icon`} /></span>
                      </div>
                      <div className="icon-content">
                        <h3 className="wt-tilte">{box.title}</h3>
                        <p>{box.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/about" className="btn-half site-button button-lg m-b30">
                <span>More About</span><em />
              </Link>
            </div>

            <div className="col-lg-6 col-md-12">
              <div
                className="home-about-block-outer bg-repeat bg-white"
                style={{ backgroundImage: 'url(/assets/images/background/bg-dot.jpg)' }}
              >
                <div className="home-about-block-inner">
                  <AboutSlider />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ROOMS & FACILITIES */}
    <RoomsFacilitiesSection rooms={rooms} loadingRooms={loadingRooms} facilities={facilities} />

    {/* BLOG */}
    <BlogSection posts={blogPosts} />

    {/* SPECIALIZATION */}
    <SpecializationSection data={specialization} />

    {/* SERVICES */}
    <ServicesSection services={services} />

    <TestimonialsSection />

    {/* GALLERY CATEGORIES */}
    <GalleryCategorySection categories={galleryCategories} />
  </>
);
}