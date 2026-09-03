import { useEffect, useState } from 'react';
import api from '../../api/client';

const emptyForm = { name: '', slug: '', description: '' };

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AdminRoomCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get('/categories');
    setCategories(data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => {
      const next = { ...f, [name]: value };
      if (name === 'name' && !editingId) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setForm({ name: category.name, slug: category.slug, description: category.description || '' });
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
      const payload = { ...form, slug: form.slug || slugify(form.name) };
      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
      } else {
        await api.post('/categories', payload);
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
    if (!window.confirm('Delete this room category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Room Categories</h1>
      <p style={{ color: '#666', fontSize: 13, marginTop: -6 }}>
        Categories like <strong>Deluxe</strong>, <strong>Executive</strong>, and <strong>Suite</strong> group your
        rooms. Add, rename, or remove them here &mdash; then assign each room to one from the Rooms page.
      </p>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <form onSubmit={submit} style={card}>
        <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit category' : 'Add a category'}</h3>
        <div style={grid2}>
          <div>
            <label style={label}>Name</label>
            <input name="name" value={form.name} onChange={onChange} required placeholder="e.g. Executive" style={input} />
          </div>
          <div>
            <label style={label}>Slug</label>
            <input name="slug" value={form.slug} onChange={onChange} required style={input} />
          </div>
        </div>
        <div style={{ margin: '10px 0' }}>
          <label style={label}>Description</label>
          <textarea name="description" rows="2" value={form.description} onChange={onChange} style={input} />
        </div>
        <div style={{ marginTop: 14 }}>
          <button type="submit" style={btnPrimary} disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update category' : 'Add category'}
          </button>
          {editingId && (
            <button type="button" style={btnSecondary} onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={{ ...card, padding: 0 }}>
        {categories.length === 0 && <p style={{ padding: 20, margin: 0 }}>No categories yet.</p>}
        {categories.map((c, i) => (
          <div
            key={c._id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderTop: i === 0 ? 'none' : '1px solid #eee',
            }}
          >
            <div>
              <strong>{c.name}</strong>
              <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>/{c.slug}</span>
              {c.description && <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{c.description}</div>}
            </div>
            <div>
              <button type="button" style={btnSecondary} onClick={() => startEdit(c)}>Edit</button>
              <button type="button" style={btnDanger} onClick={() => remove(c._id)}>Delete</button>
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