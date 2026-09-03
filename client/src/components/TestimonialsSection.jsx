import { useEffect, useState } from 'react';
import api from '../api/client';
import { useOwlCarousel } from '../hooks/useOwlCarousel';

export default function TestimonialsSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bgImage, setBgImage] = useState('/assets/images/background/bg-2.jpg');

  useEffect(() => {
    let active = true;
    api
      .get('/testimonials')
      .then(({ data }) => {
        if (active) setItems(data.data);
      })
      .finally(() => active && setLoading(false));
    api
      .get('/settings')
      .then(({ data }) => {
        if (active && data.data?.testimonialsBgImage?.url) {
          setBgImage(data.data.testimonialsBgImage.url);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const ref = useOwlCarousel(
    {
      loop: items.length > 1,
      autoplay: true,
      margin: 20,
      nav: true,
      dots: false,
      items: 1,
      navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
    },
    [items.length]
  );

  if (loading || items.length === 0) return null;

  return (
    <div
      className="section-full p-tb90 overlay-wraper"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="overlay-main opacity-05 bg-black" />
      <div className="container">
        <div className="section-content">
          <div className="section-head text-left">
            <h2 className="m-b5 text-white" data-title="Clients">Our Client Says</h2>
            <div className="wt-separator-outer">
              <div className="wt-separator site-bg-primary" />
            </div>
          </div>

          <div className="section-content">
            <div ref={ref} className="testimonial-home owl-carousel owl-btn-top-right">
              {items.map((t) => (
                <div className="item" key={t._id}>
                  <div className="testimonial-6">
                    <div className="testimonial-pic-block">
                      <div className="testimonial-pic">
                        <img
                          src={t.photo?.url || '/assets/images/testimonials/pic1.jpg'}
                          width="132"
                          height="132"
                          alt={t.name}
                        />
                      </div>
                    </div>
                    <div className="testimonial-text clearfix text-white">
                      <div className="testimonial-detail">
                        <h3 className="testimonial-name m-t0 m-b10">{t.name}</h3>
                      </div>
                      <div className="testimonial-paragraph text-black p-t5">
                        <p>&ldquo;{t.message}</p>
                      </div>
                      <div className="testimonial-detail">
                        <span className="testimonial-position">{t.designation}</span>
                      </div>
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