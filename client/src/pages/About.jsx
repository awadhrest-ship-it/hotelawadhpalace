import { useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import Counter from '../components/Counter';
import api from '../api/client';

export default function About() {
  // Same admin-managed "About Images" collection used on the homepage
  // slider (Admin > About Images). Falls back to the bundled static image
  // until an admin uploads one, so this photo never goes blank.
  const [aboutImage, setAboutImage] = useState(null);
  // Same admin-managed "About Section" content used on the homepage
  // (Admin > About Section) — heading, subheading, paragraph, and the
  // 4 feature boxes. Keeping this in one place means editing it once
  // in the admin panel updates both the homepage and this page.
  const [aboutSection, setAboutSection] = useState(null);
  // Powers the "By The Numbers" section background below (Admin >
  // Specialization > "By The Numbers" Background). Falls back to the
  // original bundled image until an admin uploads one.
  const [numbersBackground, setNumbersBackground] = useState(null);
  // Admin > Settings > Page Banner Images ("About Us"). Falls back to the
  // original bundled banner until an admin uploads one.
  const [pageBanner, setPageBanner] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get('/about-images')
      .then(({ data }) => active && data.data.length > 0 && setAboutImage(data.data[0]))
      .catch(() => {});
    api
      .get('/about-section')
      .then(({ data }) => active && setAboutSection(data.data))
      .catch(() => {});
    api
      .get('/specialization')
      .then(({ data }) => active && setNumbersBackground(data.data?.numbersBackground))
      .catch(() => {});
    api
      .get('/settings')
      .then(({ data }) => active && setPageBanner(data.data?.pageBanners?.about))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageBanner title="About Us" crumbs={[{ label: 'About Us' }]} image={pageBanner?.url || '/assets/images/banner/1.jpg'} />

      <div className="section-full p-tb90 bg-white overflow-hide">
        <div className="container">
          <div className="section-content">
            <div className="row d-flex align-items-center">
              <div className="col-lg-6 col-md-12 text-black">
                <div className="section-head text-left">
                  <h2 className="m-b5" data-title="About">{aboutSection?.heading || 'About Awadh Palace'}</h2>
                  <div className="wt-separator-outer">
                    <div className="wt-separator site-bg-primary" />
                  </div>
                </div>
                <h3 className="m-t0">{aboutSection?.subheading || 'We will be so proud to have you as our guest.'}</h3>
                <p>
                  {aboutSection?.text ||
                    'Hotel Awadh Palace was founded on a simple idea: hospitality should feel personal. Every room, every meal, and every interaction is designed around our guests\u2019 comfort and wellbeing.'}
                </p>
                <div className="row equal-wraper">
                  {(aboutSection?.boxes || []).map((box) => (
                    <div className="col-md-6 m-b30" key={box._id}>
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
              </div>

              <div className="col-lg-6 col-md-12">
                <img
                  src={aboutImage?.image?.url || '/assets/images/about/pic1.jpg'}
                  alt={aboutImage?.image?.alt || 'Hotel Awadh Palace'}
                  style={{ width: '100%', borderRadius: 4 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="section-full p-tb90 overlay-wraper"
        style={{ backgroundImage: `url(${numbersBackground?.url || '/assets/images/background/bg-2.jpg'})` }}
      >
        <div className="overlay-main opacity-08 bg-black" />
        <div className="container">
          <div className="section-head text-left">
            <h2 className="m-b5 text-white" data-title="Numbers">By The Numbers</h2>
            <div className="wt-separator-outer">
              <div className="wt-separator site-bg-primary" />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <h3 className="m-t0 text-white">Discover a hotel that defines a new dimension of luxury.</h3>
              <p className="text-white">
                From the ocean-view suites to the quiet garden courtyards, every corner of Awadh Palace is
                designed for rest, celebration, and connection.
              </p>
              <div className="section-content">
                <div className="row">
                  <div className="col-md-4 col-sm-4 col-xs-4 col-xs-100pc">
                    <Counter number={406} label="International Guests" />
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-4 col-xs-100pc">
                    <Counter number={132} label="Five Star Ratings" />
                  </div>
                  <div className="col-md-4 col-sm-4 col-xs-4 col-xs-100pc">
                    <Counter number={207} label="Served Breakfasts" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}