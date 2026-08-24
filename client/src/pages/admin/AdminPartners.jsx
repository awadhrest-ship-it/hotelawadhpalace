import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function AdminPartners() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', link: '' });

  const load = async () => {
    const { data } = await api.get('/partners/admin/all');
    setItems(data.data);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const upload = async (file) => {
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('name', 'Partner');
      await api.post('/partners', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const replaceImage = async (id, file) => {
    try {
      const fd = new FormData();
      fd.append('image', file);
      await api.post(`/partners/${id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditForm({ name: item.name, link: item.link || '' });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/partners/${editingId}`, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this partner logo?')) return;
    try {
      await api.delete(`/partners/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Our Partners (Homepage Logo Grid)</h1>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Add Partner Logo</h3>
        <label style={{ ...btnPrimary, display: 'inline-block', cursor: 'pointer' }}>
          {uploading ? 'Uploading...' : 'Choose Logo Image'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && upload(e.target.files[0])} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {items.map((item) => (
          <div key={item._id} style={card}>
            <div style={{ background: '#f5f5f5', padding: 10, borderRadius: 4, textAlign: 'center', marginBottom: 10 }}>
              <img src={item.image.url} alt={item.name} style={{ maxWidth: '100%', maxHeight: 70 }} />
            </div>
            {editingId === item._id ? (
              <div>
                <label style={label}>Name</label>
                <input style={input} value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                <label style={label}>Link (optional)</label>
                <input style={input} value={editForm.link} onChange={(e) => setEditForm((f) => ({ ...f, link: e.target.value }))} />
                <div style={{ marginTop: 10 }}>
                  <button type="button" style={btnPrimary} onClick={saveEdit}>Save</button>
                  <button type="button" style={btnSecondary} onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{item.name}</div>
                <label style={{ ...btnSecondary, display: 'inline-block', cursor: 'pointer', fontSize: 12 }}>
                  Replace
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && replaceImage(item._id, e.target.files[0])} />
                </label>
                <button type="button" style={{ ...btnSecondary, fontSize: 12 }} onClick={() => startEdit(item)}>Edit</button>
                <button type="button" style={{ ...btnDanger, fontSize: 12 }} onClick={() => remove(item._id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && <p>No partner logos yet. Add one to get started.</p>}
    </div>
  );
}

const card = { background: '#fff', padding: 16, borderRadius: 6, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };
const label = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, marginTop: 8 };
const input = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' };
const btnPrimary = { background: '#c9a24b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginRight: 8 };
const btnSecondary = { background: '#eee', color: '#333', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', marginRight: 6 };
const btnDanger = { background: '#c0392b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' };