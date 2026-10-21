import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { StarDisplay } from './StarRating';

// "Guest Feedback" block for the home page.
// - Feedback the admin has marked "Featured" shows up here as cards.
// - The "Share Your Feedback" button is ALWAYS shown, even when nothing is
//   featured yet, so guests can always find the feedback page.
export default function FeaturedFeedbackSection() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    api
      .get('/feedback/featured')
      .then(({ data }) => active && setItems(data.data || []))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div id="guest-feedback" className="section-full p-tb90 bg-gray">
      <div className="container">
        <div className="section-head text-center">
          <h2 className="m-b5" data-title="Reviews">Guest Feedback</h2>
          <div className="wt-separator-outer">
            <div className="wt-separator site-bg-primary" />
          </div>
          <p style={{ maxWidth: 560, margin: '15px auto 0' }}>
            {items.length > 0
              ? 'Words from guests who stayed with us.'
              : 'Stayed with us? We would love to hear how it went.'}
          </p>
        </div>

        {items.length > 0 && (
          <div className="row equal-wraper m-t30">
            {items.map((f) => (
              <div className="col-lg-4 col-md-6 m-b30" key={f._id}>
                <div
                  className="bg-white p-a25 equal-col"
                  style={{ height: '100%', borderRadius: 6, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: '3px solid #c9a24b' }}
                >
                  <StarDisplay value={f.ratings?.overall || 0} />
                  <p style={{ margin: '14px 0 18px', fontStyle: 'italic' }}>&ldquo;{f.message}&rdquo;</p>
                  <div style={{ fontWeight: 700 }}>{f.name}</div>
                  <div style={{ fontSize: 13, color: '#888' }}>
                    {[f.city, f.roomType].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center m-t20">
          <Link to="/feedback" className="btn-half site-button button-lg">
            <span>Share Your Feedback</span><em />
          </Link>
        </div>
      </div>
    </div>
  );
}