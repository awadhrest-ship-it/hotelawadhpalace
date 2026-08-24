import { useEffect, useState } from 'react';
import api from '../../api/client';

const emptyForm = { name: '', designation: '', message: '', rating: 5, published: true };

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  const load = async () => {
    const { data } = await api.get('/testimonials/admin/all');
    setItems(data.data);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      designation: item.designation || '',
      message: item.message,
      rating: item.rating,
      published: item.published,
    });
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
      const payload = { ...form, rating: Number(form.rating) };
      if (editingId) {
        await api.put(`/testimonials/${editingId}`, payload);
      } else {
        await api.post('/testimonials', payload);
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
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await api.delete(`/testimonials/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const uploadPhoto = async (id, file) => {
    setUploadingId(id);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await api.post(`/testimonials/${id}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div>
      <h1>Testimonials</h1>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <form onSubmit={submit} style={card}>
        <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit testimonial' : 'Add testimonial'}</h3>
        <div style={grid2}>
          <div>
            <label style={label}>Name</label>
            <input name="name" value={form.name} onChange={onChange} required style={input} />
          </div>
          <div>
            <label style={label}>Designation</label>
            <input name="designation" value={form.designation} onChange={onChange} style={input} />
          </div>
          <div>
            <label style={label}>Rating (1-5)</label>
            <input name="rating" type="number" min="1" max="5" value={form.rating} onChange={onChange} style={input} />
          </div>
        </div>
        <div style={{ margin: '10px 0' }}>
          <label style={label}>Message</label>
          <textarea name="message" rows="3" value={form.message} onChange={onChange} required style={input} />
        </div>
        <label style={{ ...label, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" name="published" checked={form.published} onChange={onChange} /> Published
        </label>
        <div style={{ marginTop: 14 }}>
          <button type="submit" style={btnPrimary} disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
          {editingId && <button type="button" style={btnSecondary} onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      {items.map((item) => (
        <div key={item._id} style={{ ...card, display: 'flex', gap: 20 }}>
          <div style={{ width: 100 }}>
            {item.photo?.url && <img src={item.photo.url} alt={item.name} style={{ width: '100%', borderRadius: '50%' }} />}
            <label style={{ ...btnSecondary, display: 'inline-block', marginTop: 8, cursor: 'pointer', fontSize: 11, textAlign: 'center' }}>
              {uploadingId === item._id ? 'Uploading...' : 'Photo'}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files[0] && uploadPhoto(item._id, e.target.files[0])}
              />
            </label>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px' }}>{item.name} <span style={{ fontSize: 12, color: '#999' }}>({item.rating}★)</span></h3>
            <p style={{ margin: '0 0 8px', color: '#777', fontSize: 13 }}>{item.designation}</p>
            <p style={{ fontSize: 13 }}>{item.message}</p>
            <button type="button" style={btnSecondary} onClick={() => startEdit(item)}>Edit</button>
            <button type="button" style={btnDanger} onClick={() => remove(item._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const card = { background: '#fff', padding: 20, borderRadius: 6, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };
const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 };
const label = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 };
const input = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' };
const btnPrimary = { background: '#c9a24b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginRight: 8 };
const btnSecondary = { background: '#eee', color: '#333', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginRight: 8 };
const btnDanger = { background: '#c0392b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 };
