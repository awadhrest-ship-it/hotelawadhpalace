import PageBanner from '../components/PageBanner';
import Counter from '../components/Counter';

const ICON_BOXES = [
  { icon: 'flaticon-room-service', title: 'Restaurants', text: 'Fine dining crafted by award-winning chefs.' },
  { icon: 'flaticon-stones', title: 'Wellness & Spa', text: 'Rejuvenate mind and body in our tranquil spa.' },
  { icon: 'flaticon-wifi', title: 'Free Wifi', text: 'Stay connected with complimentary high-speed Wi-Fi.' },
  { icon: 'flaticon-cards', title: 'Game Zone', text: 'Unwind with games for every member of the family.' },
];

export default function About() {
  return (
    <>
      <PageBanner title="About Us" crumbs={[{ label: 'About Us' }]} image="/assets/images/banner/1.jpg" />

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
                  Sharan Resort &amp; Hotel was founded on a simple idea: hospitality should feel personal.
                  Every room, every meal, and every interaction is designed around our guests&rsquo; comfort
                  and wellbeing.
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
              </div>

              <div className="col-lg-6 col-md-12">
                <img
                  src="/assets/images/about/pic1.jpg"
                  alt="Sharan Resort & Hotel"
                  style={{ width: '100%', borderRadius: 4 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="section-full p-tb90 overlay-wraper"
        style={{ backgroundImage: 'url(/assets/images/background/bg-2.jpg)' }}
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
                From the ocean-view suites to the quiet garden courtyards, every corner of Sharan is
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
