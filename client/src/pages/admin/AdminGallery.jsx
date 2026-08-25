import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    try {
      const { data } = await api.get('/gallery-categories');
      setCategories(data.data);
      if (data.data.length > 0 && !category) {
        setCategory(data.data[0]._id);
      }
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const load = async () => {
    const { data } = await api.get('/gallery');
    setItems(data.data);
  };

  useEffect(() => {
    loadCategories();
    load().catch((err) => setError(err.message));
  }, []);

  const upload = async (file) => {
    if (!category) {
      setError('Please select a category');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('title', title);
      fd.append('category', category);
      await api.post('/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setTitle('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Gallery Images</h1>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Add image</h3>
        <input
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ ...input, marginBottom: 8 }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ ...input, marginBottom: 8 }}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <label style={{ ...btnPrimary, display: 'inline-block', cursor: 'pointer' }}>
          {uploading ? 'Uploading...' : 'Choose image'}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && upload(e.target.files[0])}
          />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {items.map((item) => (
          <div key={item._id} style={{ background: '#fff', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <img src={item.image.url} alt={item.title} style={{ width: '100%', display: 'block' }} />
            <div style={{ padding: 8 }}>
              <div style={{ fontSize: 12, color: '#777' }}>
                {item.title || 'Untitled'}
                {item.category && <div style={{ fontSize: 10, color: '#999' }}>Category: {item.category}</div>}
              </div>
              <button type="button" onClick={() => remove(item._id)} style={{ ...btnDanger, marginTop: 6, width: '100%' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const card = { background: '#fff', padding: 20, borderRadius: 6, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };
const input = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' };
const btnPrimary = { background: '#c9a24b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 };
const btnDanger = { background: '#c0392b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 };