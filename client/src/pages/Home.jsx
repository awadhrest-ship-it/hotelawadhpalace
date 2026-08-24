import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import BookingSearchForm from '../components/BookingSearchForm';
import RoomCard from '../components/RoomCard';
import TestimonialsSection from '../components/TestimonialsSection';
import { useOwlCarousel } from '../hooks/useOwlCarousel';

const ICON_BOXES = [
  { icon: 'flaticon-room-service', title: 'Restaurants', text: 'Fine dining crafted by award-winning chefs.' },
  { icon: 'flaticon-stones', title: 'Wellness & Spa', text: 'Rejuvenate mind and body in our tranquil spa.' },
  { icon: 'flaticon-wifi', title: 'Free Wifi', text: 'Stay connected with complimentary high-speed Wi-Fi.' },
  { icon: 'flaticon-cards', title: 'Game Zone', text: 'Unwind with games for every member of the family.' },
];

const ABOUT_SLIDES = [1, 2, 3, 4, 5];

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
      <div
        className="wt-bnr-inr overlay-wraper bg-parallax bg-top-center"
        style={{
          backgroundImage: 'url(/assets/images/main-slider/1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          minHeight: '700px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <div className="overlay-main bg-black opacity-04" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="text-white font-weight-900" style={{ maxWidth: 700, fontSize: 56, lineHeight: 1.2, marginBottom: 20 }}>
            Welcome to Sharan Resort &amp; Hotel
          </h1>
          <p className="text-white" style={{ maxWidth: 560, fontSize: 18, marginBottom: 30 }}>
            A place where comfort meets elegance. Book your stay and experience genuine hospitality.
          </p>
          <Link to="/rooms" className="btn-half site-button button-lg">
            <span>Explore Rooms</span><em />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="owl-carousel owl-hero-slider" style={{ minHeight: '700px' }}>
      {heroes.map((hero) => (
        <div key={hero._id} className="item">
          <div
            className="wt-bnr-inr overlay-wraper"
            style={{
              backgroundImage: `url('${hero.image.url}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
              minHeight: '700px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <div className="overlay-main bg-black opacity-04" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} />
            <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
              {hero.title || hero.subtitle ? (
                <div>
                  {hero.title && (
                    <h1 className="text-white font-weight-900" style={{ maxWidth: 900, fontSize: 56, lineHeight: 1.2, marginBottom: 20 }}>
                      {hero.title}
                    </h1>
                  )}
                  {hero.subtitle && (
                    <p className="text-white" style={{ maxWidth: 700, fontSize: 18, marginBottom: 30 }}>
                      {hero.subtitle}
                    </p>
                  )}
                  <Link to="/rooms" className="btn-half site-button button-lg">
                    <span>Explore Rooms</span><em />
                  </Link>
                </div>
              ) : (
                <div>
                  <h1 className="text-white font-weight-900" style={{ maxWidth: 700, fontSize: 56, lineHeight: 1.2, marginBottom: 20 }}>
                    Welcome to Sharan Resort &amp; Hotel
                  </h1>
                  <p className="text-white" style={{ maxWidth: 560, fontSize: 18, marginBottom: 30 }}>
                    A place where comfort meets elegance. Book your stay and experience genuine hospitality.
                  </p>
                  <Link to="/rooms" className="btn-half site-button button-lg">
                    <span>Explore Rooms</span><em />
                  </Link>
                </div>
              )}
            </div>
          </div>
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

export default function Home() {
  const [heroes, setHeroes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingHeroes, setLoadingHeroes] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);

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

    <TestimonialsSection />
  </>
);
}