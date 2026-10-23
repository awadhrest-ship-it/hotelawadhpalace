import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageBanner from '../components/PageBanner';
import StarInput from '../components/StarRating';
import api from '../api/client';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

const CATEGORIES = [
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'service', label: 'Staff & Service' },
  { key: 'comfort', label: 'Room Comfort' },
  { key: 'food', label: 'Food & Dining' },
  { key: 'bar', label: '90\'s Bar' },
  { key: 'value', label: 'Value for Money' },
];

const initialForm = {
  name: '',
  email: '',
  phone: '',
  city: '',
  roomType: '',
  stayDate: '',
  message: '',
  wouldRecommend: '',
  allowDisplay: true,
  website: '', // honeypot - must stay empty
};

// The site template (style.css) sets opacity:0 on every radio/checkbox and
// expects its own fake-styled markup, which would make these invisible.
// Inline opacity:1 brings the native controls back for this form only.
const NATIVE_INPUT = { opacity: 1, marginRight: 8, verticalAlign: 'middle', cursor: 'pointer', accentColor: '#c9a24b' };

const initialRatings = { overall: 0, cleanliness: 0, service: 0, comfort: 0, food: 0, bar: 0, value: 0 };

export default function Feedback() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [ratings, setRatings] = useState(initialRatings);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get('/settings')
      .then(({ data }) => active && setSettings(data.data))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const setRating = (key) => (n) => setRatings((r) => ({ ...r, [key]: n }));

  const submit = async (e) => {
    e.preventDefault();
    if (!ratings.overall) {
      setStatus('error');
      setError('Please give an overall rating by tapping the stars.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const payload = { ...form, ratings };
      await api.post('/feedback', payload);
      setStatus('success');
      setForm(initialForm);
      setRatings(initialRatings);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setStatus('error');
      const first = err.response?.data?.errors?.[0]?.message;
      setError(first || err.message || 'Something went wrong. Please try again.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <PageBanner
        title="Share Your Feedback"
        crumbs={[{ label: 'Feedback' }]}
        image={settings?.pageBanners?.contact?.url || '/assets/images/banner/4.jpg'}
      />

      <div className="section-full p-tb80">
        <div className="container">
          {status === 'success' ? (
            <div className="text-center" style={{ maxWidth: 620, margin: '0 auto', padding: '30px 0' }}>
              <div style={{ fontSize: 64, color: '#c9a24b', lineHeight: 1 }}>&#9733;</div>
              <h2 className="m-t20 m-b10">Thank you for your feedback!</h2>
              <p>
                We truly appreciate you taking the time to tell us about your stay. Your words help us
                make every visit to Hotel Awadh Palace better.
              </p>
              <div className="m-t30">
                <Link to="/" className="btn-half site-button button-lg m-r10 m-b10">
                  <span>Back to Home</span><em />
                </Link>
                <button
                  type="button"
                  className="btn-half site-button button-lg m-b10"
                  onClick={() => setStatus('idle')}
                >
                  <span>Submit Another</span><em />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} style={{ maxWidth: 860, margin: '0 auto' }}>
              <div className="section-head text-center">
                <h2 className="m-b5">How was your stay?</h2>
                <p style={{ maxWidth: 560, margin: '10px auto 0' }}>
                  Your honest feedback helps us improve and helps future guests know what to expect.
                  It only takes a minute.
                </p>
              </div>

              {status === 'error' && <div className="alert alert-danger m-t20">{error}</div>}

              {/* Overall rating */}
              <div
                className="text-center m-b30 p-a20"
                style={{ background: '#faf7f0', border: '1px solid #eee3c8', borderRadius: 6 }}
              >
                <h4 className="m-t0 m-b10">Overall experience <span style={{ color: '#c0392b' }}>*</span></h4>
                <StarInput value={ratings.overall} onChange={setRating('overall')} size={44} label="Overall rating" />
                <div style={{ minHeight: 22, marginTop: 6, color: '#c9a24b', fontWeight: 600 }}>
                  {RATING_LABELS[ratings.overall]}
                </div>
              </div>

              {/* Category ratings */}
              <h4 className="m-b15">Rate the details <small style={{ fontWeight: 400, color: '#888' }}>(optional)</small></h4>
              <div className="row m-b20">
                {CATEGORIES.map((c) => (
                  <div className="col-md-6 m-b15" key={c.key}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 10,
                        flexWrap: 'wrap',
                        padding: '8px 14px',
                        border: '1px solid #eee',
                        borderRadius: 4,
                      }}
                    >
                      <span>{c.label}</span>
                      <StarInput value={ratings[c.key]} onChange={setRating(c.key)} size={24} label={c.label} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Written feedback */}
              <div className="form-group">
                <label htmlFor="fb-message" style={{ fontWeight: 600 }}>
                  Tell us about your stay <span style={{ color: '#c0392b' }}>*</span>
                </label>
                <textarea
                  id="fb-message"
                  name="message"
                  rows="5"
                  required
                  maxLength={2000}
                  className="form-control"
                  placeholder="What did you enjoy? What could we do better?"
                  value={form.message}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, display: 'block' }}>Would you recommend us to friends or family?</label>
                {[
                  { v: 'yes', t: 'Yes, definitely' },
                  { v: 'no', t: 'Not really' },
                ].map((o) => (
                  <label key={o.v} style={{ marginRight: 24, fontWeight: 400, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="wouldRecommend"
                      value={o.v}
                      checked={form.wouldRecommend === o.v}
                      onChange={onChange}
                      style={NATIVE_INPUT}
                    />
                    {o.t}
                  </label>
                ))}
              </div>

              {/* About the guest */}
              <h4 className="m-t30 m-b15">About you</h4>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <input name="name" type="text" required maxLength={100} className="form-control" placeholder="Your name *" value={form.name} onChange={onChange} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <input name="email" type="email" className="form-control" placeholder="Email (optional)" value={form.email} onChange={onChange} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <input name="phone" type="tel" required maxLength={30} className="form-control" placeholder="Phone *" value={form.phone} onChange={onChange} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <input name="city" type="text" maxLength={80} className="form-control" placeholder="City (optional)" value={form.city} onChange={onChange} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <input name="roomType" type="text" maxLength={80} className="form-control" placeholder="Room you stayed in (optional)" value={form.roomType} onChange={onChange} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <input name="stayDate" type="date" max={today} className="form-control" title="Stay date" value={form.stayDate} onChange={onChange} />
                  </div>
                </div>
              </div>

              {/* Honeypot - hidden from people, bots tend to fill it in */}
              <div style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }} aria-hidden="true">
                <label>
                  Website
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={onChange} />
                </label>
              </div>

              <div className="form-group m-t10">
                <label style={{ fontWeight: 400, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="allowDisplay"
                    checked={form.allowDisplay}
                    onChange={onChange}
                    style={NATIVE_INPUT}
                  />
                  You may show my feedback (with my name) on the Hotel Awadh Palace website.
                </label>
              </div>

              <div className="text-center m-t20">
                <button type="submit" className="btn-half site-button button-lg" disabled={status === 'loading'}>
                  <span>{status === 'loading' ? 'Submitting...' : 'Submit Feedback'}</span>
                  <em />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}