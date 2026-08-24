import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get('/settings')
      .then(({ data }) => setForm(data.data))
      .catch((err) => setError(err.message));
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const { data } = await api.put('/settings', form);
      setForm(data.data);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <p>Loading&hellip;</p>;

  return (
    <div>
      <h1>Site Settings</h1>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}
      {saved && <p style={{ color: '#2e7d32' }}>Saved.</p>}
      <form onSubmit={submit} style={card}>
        <div style={grid2}>
          <div>
            <label style={label}>Site name</label>
            <input name="siteName" value={form.siteName} onChange={onChange} style={input} />
          </div>
          <div>
            <label style={label}>Phone</label>
            <input name="phone" value={form.phone} onChange={onChange} style={input} />
          </div>
          <div>
            <label style={label}>Email</label>
            <input name="email" value={form.email} onChange={onChange} style={input} />
          </div>
          <div>
            <label style={label}>Address</label>
            <input name="address" value={form.address} onChange={onChange} style={input} />
          </div>
          <div>
            <label style={label}>Check-in time</label>
            <input name="checkInTime" value={form.checkInTime} onChange={onChange} style={input} />
          </div>
          <div>
            <label style={label}>Check-out time</label>
            <input name="checkOutTime" value={form.checkOutTime} onChange={onChange} style={input} />
          </div>
        </div>
        <button type="submit" style={btnPrimary} disabled={saving}>
          {saving ? 'Saving...' : 'Save settings'}
        </button>
      </form>
    </div>
  );
}

const card = { background: '#fff', padding: 20, borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };
const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 };
const label = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 };
const input = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' };
const btnPrimary = { background: '#c9a24b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 };
