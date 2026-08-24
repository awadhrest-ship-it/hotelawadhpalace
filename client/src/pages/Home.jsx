import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import BookingSearchForm from '../components/BookingSearchForm';
import RoomCard from '../components/RoomCard';
import TestimonialsSection from '../components/TestimonialsSection';
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

  if (!heroes || heroes.length === 0) {
    return (
      <HeroSlide imageUrl="/assets/images/main-slider/slider1/slide1.jpg" imageAlt="Sharan Resort & Hotel">
        <HeroText
          title="Welcome to Sharan Resort & Hotel"
          subtitle="A place where comfort meets elegance. Book your stay and experience genuine hospitality."
        />
      </HeroSlide>
    );
  }

  return (
    <div ref={ref} className="owl-carousel owl-hero-slider">
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
                title="Welcome to Sharan Resort & Hotel"
                subtitle="A place where comfort meets elegance. Book your stay and experience genuine hospitality."
              />
            )}
          </HeroSlide>
        </div>
      ))}
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
            <img src={`/assets/images/about/pic${n}.jpg`} alt={`About Sharan ${n}`} />
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

// "OUR PARTNERS"
function PartnersSection({ partners }) {
  if (!partners || partners.length === 0) return null;
  return (
    <div className="section-full p-tb90 bg-gray">
      <div className="container">
        <div className="section-head text-left">
          <h2 className="m-b5" data-title="Partners">Our Partners</h2>
          <div className="wt-separator-outer">
            <div className="wt-separator site-bg-primary" />
          </div>
        </div>
        <div className="section-content">
          <div className="client-grid grid-4 row">
            {partners.map((p) => (
              <div className="col-xs-12 col-sm-4" key={p._id}>
                {p.link ? (
                  <a href={p.link} className="wt-img-effect client-logo-media" title={p.name}>
                    <img src={p.image.url} alt={p.name} />
                  </a>
                ) : (
                  <span className="wt-img-effect client-logo-media">
                    <img src={p.image.url} alt={p.name} />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// "OUR TEAM"
function TeamSection({ team }) {
  if (!team || team.length === 0) return null;
  return (
    <div className="section-full p-t90 p-b60 bg-white">
      <div className="container">
        <div className="section-head text-left">
          <h2 className="m-b5" data-title="Team">Our Team</h2>
          <div className="wt-separator-outer">
            <div className="wt-separator site-bg-primary" />
          </div>
        </div>
        <div className="our-team-two">
          <div className="row d-flex justify-content-center">
            {team.map((member) => (
              <div className="col-lg-4 col-md-6 m-b30" key={member._id}>
                <div className="wt-team-arc2">
                  <div className="wt-media">
                    <img src={member.image.url} alt={member.name} />
                    <div className="team-social-center">
                      <ul className="team-social-icon">
                        {member.socialLinks?.facebook && (
                          <li><a href={member.socialLinks.facebook} className="fa-brands fa-facebook-f" /></li>
                        )}
                        {member.socialLinks?.twitter && (
                          <li><a href={member.socialLinks.twitter} className="fa-brands fa-x-twitter" /></li>
                        )}
                        {member.socialLinks?.instagram && (
                          <li><a href={member.socialLinks.instagram} className="fa-brands fa-instagram" /></li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="wt-info">
                    <div className="team-detail text-center">
                      <h3 className="m-t0">{member.name}</h3>
                      <p>{member.role}</p>
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

export default function Home() {
  const [heroes, setHeroes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingHeroes, setLoadingHeroes] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [blogPosts, setBlogPosts] = useState([]);
  const [specialization, setSpecialization] = useState(null);
  const [services, setServices] = useState([]);
  const [partners, setPartners] = useState([]);
  const [team, setTeam] = useState([]);

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
    api.get('/partners').then(({ data }) => active && setPartners(data.data)).catch(() => {});
    api.get('/team').then(({ data }) => active && setTeam(data.data)).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

 return (
  <>
    {/* HERO */}
    <HeroSlider heroes={heroes} />

    {/* BOOKING FORM - overlaps hero with negative margin */}
    {/* BOOKING FORM - overlaps hero with negative margin */}
<div style={{ position: 'relative', zIndex: 10, marginTop: '-100px', paddingBottom: '40px' }}>
  <BookingSearchForm />
</div>

    {/* ABOUT */}
    <div className="section-full p-tb90 bg-white overflow-hide">
      <div className="container">
        <div className="section-content">
          <div className="row d-flex align-items-center">
            <div className="col-lg-6 col-md-12 text-black">
              <div className="section-head text-left">
                <h2 className="m-b5" data-title="About">About Sharan</h2>
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

    {/* ROOMS */}
    <div className="section-full p-tb90 bg-gray">
      <div className="container">
        <div className="section-head text-center">
          <h2 className="m-b5" data-title="Suites">Our Rooms &amp; Suites</h2>
          <div className="wt-separator-outer">
            <div className="wt-separator site-bg-primary" />
          </div>
        </div>
      </div>
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
    </div>

    {/* BLOG */}
    <BlogSection posts={blogPosts} />

    {/* SPECIALIZATION */}
    <SpecializationSection data={specialization} />

    {/* SERVICES */}
    <ServicesSection services={services} />

    <TestimonialsSection />

    {/* PARTNERS */}
    <PartnersSection partners={partners} />

    {/* TEAM */}
    <TeamSection team={team} />
  </>
);
}