import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function AdminSpecialization() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    const { data: res } = await api.get('/specialization/admin');
    setData(res.data);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const saveMain = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const { data: res } = await api.put('/specialization', {
        heading: data.heading,
        text: data.text,
        counters: data.counters,
      });
      setData(res.data);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateCounter = (id, field, value) => {
    setData((d) => ({
      ...d,
      counters: d.counters.map((c) => (c._id === id ? { ...c, [field]: value } : c)),
    }));
  };

  const saveFeature = async (feature) => {
    try {
      const { data: res } = await api.put(`/specialization/features/${feature._id}`, {
        title: feature.title,
        icon: feature.icon,
      });
      setData(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateFeatureLocal = (id, field, value) => {
    setData((d) => ({
      ...d,
      features: d.features.map((f) => (f._id === id ? { ...f, [field]: value } : f)),
    }));
  };

  const uploadFeatureImage = async (id, file) => {
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data: res } = await api.post(`/specialization/features/${id}/image`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setData(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!data) return <p>Loading&hellip;</p>;

  return (
    <div>
      <h1>Our Specialization (Homepage)</h1>
      <p style={{ fontSize: 13, color: '#666' }}>
        This is the dark full-width section with the 3 stat counters and the 4 hover tiles (Rooms /
        Restaurant / Luxury Bars / Meeting Hall) that swap the background image on hover.
      </p>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}
      {saved && <p style={{ color: '#2e7d32' }}>Saved.</p>}

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Heading &amp; Text</h3>
        <label style={label}>Heading</label>
        <input style={input} value={data.heading} onChange={(e) => setData((d) => ({ ...d, heading: e.target.value }))} />
        <label style={label}>Paragraph text</label>
        <textarea style={{ ...input, minHeight: 90 }} value={data.text} onChange={(e) => setData((d) => ({ ...d, text: e.target.value }))} />

        <h3>Stat Counters</h3>
        {data.counters.map((c) => (
          <div key={c._id} style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
            <input
              style={{ ...input, width: 100 }}
              type="number"
              value={c.number}
              onChange={(e) => updateCounter(c._id, 'number', Number(e.target.value))}
            />
            <input
              style={input}
              value={c.label}
              onChange={(e) => updateCounter(c._id, 'label', e.target.value)}
              placeholder="Label (e.g. International Guests)"
            />
          </div>
        ))}

        <button type="button" style={btnPrimary} onClick={saveMain} disabled={saving}>
          {saving ? 'Saving...' : 'Save heading, text & counters'}
        </button>
      </div>

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Hover Feature Tiles &amp; Background Images</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {data.features.map((f) => (
            <div key={f._id} style={{ border: '1px solid #eee', borderRadius: 6, padding: 12 }}>
              <img src={f.image.url} alt={f.title} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 4, marginBottom: 10 }} />
              <label style={label}>Icon class</label>
              <input style={input} value={f.icon} onChange={(e) => updateFeatureLocal(f._id, 'icon', e.target.value)} />
              <label style={label}>Title</label>
              <input style={input} value={f.title} onChange={(e) => updateFeatureLocal(f._id, 'title', e.target.value)} />
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <button type="button" style={btnSecondary} onClick={() => saveFeature(f)}>Save text</button>
                <label style={{ ...btnSecondary, cursor: 'pointer' }}>
                  Change image
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => e.target.files[0] && uploadFeatureImage(f._id, e.target.files[0])}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const card = { background: '#fff', padding: 20, borderRadius: 6, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };
const label = { display: 'block', fontSize: 12, fontWeight: 600, margin: '10px 0 4px' };
const input = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' };
const btnPrimary = { background: '#c9a24b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginTop: 12 };
const btnSecondary = { background: '#eee', color: '#333', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 };