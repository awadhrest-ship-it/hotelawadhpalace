import { useEffect, useState } from 'react';
import api from '../../api/client';

const emptyForm = { name: '', icon: '' };

export default function AdminAmenities() {
  const [amenities, setAmenities] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get('/amenities');
    setAmenities(data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const startEdit = (amenity) => {
    setEditingId(amenity._id);
    setForm({ name: amenity.name, icon: amenity.icon || '' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { name: form.name, ...(form.icon ? { icon: form.icon } : {}) };
      if (editingId) {
        await api.put(`/amenities/${editingId}`, payload);
      } else {
        await api.post('/amenities', payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this feature/amenity? Rooms using it will simply lose the tag.')) return;
    try {
      await api.delete(`/amenities/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Room Features &amp; Amenities</h1>
      <p style={{ color: '#666', fontSize: 13, marginTop: -6 }}>
        These are the tags you can attach to any room (e.g. Wi-Fi, Study Room, Smoking Room, Air Purifier,
        Living Room, Iron/Ironing Board, Mineral Water &ndash; additional charge). Manage them here, then pick
        which ones apply to each room from the <strong>Rooms</strong> page.
      </p>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <form onSubmit={submit} style={card}>
        <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit feature' : 'Add a feature'}</h3>
        <div style={grid2}>
          <div>
            <label style={label}>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              placeholder="e.g. Study Room"
              style={input}
            />
          </div>
          <div>
            <label style={label}>Icon class (optional)</label>
            <input
              name="icon"
              value={form.icon}
              onChange={onChange}
              placeholder="e.g. flaticon-wifi"
              style={input}
            />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <button type="submit" style={btnPrimary} disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update feature' : 'Add feature'}
          </button>
          {editingId && (
            <button type="button" style={btnSecondary} onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={{ ...card, padding: 0 }}>
        {amenities.length === 0 && <p style={{ padding: 20, margin: 0 }}>No features yet.</p>}
        {amenities.map((a, i) => (
          <div
            key={a._id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderTop: i === 0 ? 'none' : '1px solid #eee',
            }}
          >
            <div>
              <strong>{a.name}</strong>
              {a.icon && <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>{a.icon}</span>}
            </div>
            <div>
              <button type="button" style={btnSecondary} onClick={() => startEdit(a)}>Edit</button>
              <button type="button" style={btnDanger} onClick={() => remove(a._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const card = { background: '#fff', padding: 20, borderRadius: 6, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };
const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 };
const label = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 };
const input = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' };
const btnPrimary = { background: '#c9a24b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginRight: 8 };
const btnSecondary = { background: '#eee', color: '#333', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginRight: 8 };
const btnDanger = { background: '#c0392b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 };