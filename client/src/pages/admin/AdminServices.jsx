import { useEffect, useState } from 'react';
import api from '../../api/client';

const EMPTY = { icon: 'flaticon-wifi', title: '', text: '' };

export default function AdminServices() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY);

  const load = async () => {
    const { data } = await api.get('/services/admin/all');
    setItems(data.data);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditForm({ icon: item.icon, title: item.title, text: item.text });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/services/${editingId}`, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/services', createForm);
      setCreating(false);
      setCreateForm(EMPTY);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = async (id, active) => {
    try {
      await api.put(`/services/${id}`, { active: !active });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Our Services (Homepage)</h1>
      <p style={{ fontSize: 13, color: '#666' }}>
        Icon class names come from the template's flaticon set (e.g. <code>flaticon-wifi</code>, <code>flaticon-calendar</code>).
      </p>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <div style={card}>
        {!creating ? (
          <button type="button" style={btnPrimary} onClick={() => setCreating(true)}>+ Add Service</button>
        ) : (
          <form onSubmit={create}>
            <h3 style={{ marginTop: 0 }}>New Service</h3>
            <div style={grid2}>
              <div>
                <label style={label}>Icon class</label>
                <input style={input} value={createForm.icon} onChange={(e) => setCreateForm((f) => ({ ...f, icon: e.target.value }))} />
              </div>
              <div>
                <label style={label}>Title</label>
                <input style={input} value={createForm.title} onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))} required />
              </div>
            </div>
            <label style={label}>Text</label>
            <input style={input} value={createForm.text} onChange={(e) => setCreateForm((f) => ({ ...f, text: e.target.value }))} />
            <div style={{ marginTop: 12 }}>
              <button type="submit" style={btnPrimary}>Save</button>
              <button type="button" style={btnSecondary} onClick={() => { setCreating(false); setCreateForm(EMPTY); }}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {items.map((item) => (
        <div key={item._id} style={card}>
          {editingId === item._id ? (
            <div>
              <div style={grid2}>
                <div>
                  <label style={label}>Icon class</label>
                  <input style={input} value={editForm.icon} onChange={(e) => setEditForm((f) => ({ ...f, icon: e.target.value }))} />
                </div>
                <div>
                  <label style={label}>Title</label>
                  <input style={input} value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
                </div>
              </div>
              <label style={label}>Text</label>
              <input style={input} value={editForm.text} onChange={(e) => setEditForm((f) => ({ ...f, text: e.target.value }))} />
              <div style={{ marginTop: 12 }}>
                <button type="button" style={btnPrimary} onClick={saveEdit}>Save</button>
                <button type="button" style={btnSecondary} onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <i className={item.icon} style={{ fontSize: 28, color: '#c9a24b', width: 36 }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px' }}>{item.title}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: 13 }}>{item.text}</p>
              </div>
              <label style={labelCheckbox}>
                <input type="checkbox" checked={item.active} onChange={() => toggleActive(item._id, item.active)} /> Active
              </label>
              <button type="button" style={btnSecondary} onClick={() => startEdit(item)}>Edit</button>
              <button type="button" style={btnDanger} onClick={() => remove(item._id)}>Delete</button>
            </div>
          )}
        </div>
      ))}

      {items.length === 0 && <p>No services yet. Add one to get started.</p>}
    </div>
  );
}

const card = { background: '#fff', padding: 20, borderRadius: 6, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 };
const label = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 };
const input = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' };
const btnPrimary = { background: '#c9a24b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginRight: 8 };
const btnSecondary = { background: '#eee', color: '#333', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginRight: 8 };
const btnDanger = { background: '#c0392b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 };
const labelCheckbox = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, whiteSpace: 'nowrap' };