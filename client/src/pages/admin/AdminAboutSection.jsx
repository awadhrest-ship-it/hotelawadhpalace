import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function AdminAboutSection() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get('/about-section')
      .then(({ data: res }) => setData(res.data))
      .catch((err) => setError(err.message));
  }, []);

  const updateField = (field, value) => {
    setData((d) => ({ ...d, [field]: value }));
  };

  const updateBox = (id, field, value) => {
    setData((d) => ({
      ...d,
      boxes: d.boxes.map((b) => (b._id === id ? { ...b, [field]: value } : b)),
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const { data: res } = await api.put('/about-section', {
        heading: data.heading,
        subheading: data.subheading,
        text: data.text,
        buttonText: data.buttonText,
        buttonLink: data.buttonLink,
        boxes: data.boxes,
      });
      setData(res.data);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <p>Loading&hellip;</p>;

  return (
    <div>
      <h1>About Section (Homepage)</h1>
      <p style={{ fontSize: 13, color: '#666', marginTop: -6 }}>
        This is the &ldquo;About Awadh Palace&rdquo; section on the homepage &mdash; the heading, text, the 4
        feature boxes (Restaurants / Wellness &amp; Spa / Free Wifi / Game Zone), and the button. The photo
        slider next to it is managed separately on the <strong>About Images</strong> page.
      </p>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}
      {saved && <p style={{ color: '#2e7d32' }}>Saved.</p>}

      <form onSubmit={submit}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Heading &amp; Text</h3>
          <label style={label}>Heading</label>
          <input style={input} value={data.heading} onChange={(e) => updateField('heading', e.target.value)} />
          <label style={label}>Subheading</label>
          <input style={input} value={data.subheading} onChange={(e) => updateField('subheading', e.target.value)} />
          <label style={label}>Paragraph text</label>
          <textarea
            style={{ ...input, minHeight: 90 }}
            value={data.text}
            onChange={(e) => updateField('text', e.target.value)}
          />
          <div style={grid2}>
            <div>
              <label style={label}>Button text</label>
              <input style={input} value={data.buttonText} onChange={(e) => updateField('buttonText', e.target.value)} />
            </div>
            <div>
              <label style={label}>Button link</label>
              <input style={input} value={data.buttonLink} onChange={(e) => updateField('buttonLink', e.target.value)} />
            </div>
          </div>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Feature Boxes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {data.boxes.map((b) => (
              <div key={b._id} style={{ border: '1px solid #eee', borderRadius: 6, padding: 12 }}>
                <label style={label}>Icon class</label>
                <input style={input} value={b.icon} onChange={(e) => updateBox(b._id, 'icon', e.target.value)} />
                <label style={label}>Title</label>
                <input style={input} value={b.title} onChange={(e) => updateBox(b._id, 'title', e.target.value)} />
                <label style={label}>Text</label>
                <textarea
                  style={{ ...input, minHeight: 60 }}
                  value={b.text}
                  onChange={(e) => updateBox(b._id, 'text', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" style={btnPrimary} disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

const card = { background: '#fff', padding: 20, borderRadius: 6, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };
const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 10 };
const label = { display: 'block', fontSize: 12, fontWeight: 600, margin: '10px 0 4px' };
const input = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' };
const btnPrimary = { background: '#c9a24b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 };