import { useEffect, useState } from 'react';
import api from '../../api/client';

const EMPTY = { name: '', role: '', facebook: '', twitter: '', instagram: '' };

export default function AdminTeam() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY);
  const [createFile, setCreateFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY);

  const load = async () => {
    const { data } = await api.get('/team/admin/all');
    setItems(data.data);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!createFile) {
      setError('Please choose a photo.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', createFile);
      Object.entries(createForm).forEach(([k, v]) => fd.append(k, v));
      await api.post('/team', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCreateForm(EMPTY);
      setCreateFile(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const replacePhoto = async (id, file) => {
    try {
      const fd = new FormData();
      fd.append('image', file);
      await api.post(`/team/${id}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      name: item.name,
      role: item.role,
      facebook: item.socialLinks?.facebook || '',
      twitter: item.socialLinks?.twitter || '',
      instagram: item.socialLinks?.instagram || '',
    });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/team/${editingId}`, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this team member?')) return;
    try {
      await api.delete(`/team/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Our Team (Homepage)</h1>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <form onSubmit={create} style={card}>
        <h3 style={{ marginTop: 0 }}>Add Team Member</h3>
        <div style={grid2}>
          <div>
            <label style={label}>Name</label>
            <input style={input} value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label style={label}>Role</label>
            <input style={input} value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))} />
          </div>
          <div>
            <label style={label}>Facebook URL</label>
            <input style={input} value={createForm.facebook} onChange={(e) => setCreateForm((f) => ({ ...f, facebook: e.target.value }))} />
          </div>
          <div>
            <label style={label}>Twitter/X URL</label>
            <input style={input} value={createForm.twitter} onChange={(e) => setCreateForm((f) => ({ ...f, twitter: e.target.value }))} />
          </div>
          <div>
            <label style={label}>Instagram URL</label>
            <input style={input} value={createForm.instagram} onChange={(e) => setCreateForm((f) => ({ ...f, instagram: e.target.value }))} />
          </div>
          <div>
            <label style={label}>Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setCreateFile(e.target.files[0])} />
          </div>
        </div>
        <button type="submit" style={btnPrimary} disabled={uploading}>{uploading ? 'Saving...' : 'Add Member'}</button>
      </form>

      {items.map((item) => (
        <div key={item._id} style={card}>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ width: 130 }}>
              <img src={item.image.url} alt={item.name} style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 4 }} />
              <label style={{ ...btnSecondary, display: 'block', textAlign: 'center', marginTop: 8, cursor: 'pointer', fontSize: 12 }}>
                Replace photo
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && replacePhoto(item._id, e.target.files[0])} />
              </label>
            </div>
            <div style={{ flex: 1 }}>
              {editingId === item._id ? (
                <div>
                  <div style={grid2}>
                    <div>
                      <label style={label}>Name</label>
                      <input style={input} value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                      <label style={label}>Role</label>
                      <input style={input} value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))} />
                    </div>
                    <div>
                      <label style={label}>Facebook URL</label>
                      <input style={input} value={editForm.facebook} onChange={(e) => setEditForm((f) => ({ ...f, facebook: e.target.value }))} />
                    </div>
                    <div>
                      <label style={label}>Twitter/X URL</label>
                      <input style={input} value={editForm.twitter} onChange={(e) => setEditForm((f) => ({ ...f, twitter: e.target.value }))} />
                    </div>
                    <div>
                      <label style={label}>Instagram URL</label>
                      <input style={input} value={editForm.instagram} onChange={(e) => setEditForm((f) => ({ ...f, instagram: e.target.value }))} />
                    </div>
                  </div>
                  <button type="button" style={btnPrimary} onClick={saveEdit}>Save</button>
                  <button type="button" style={btnSecondary} onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              ) : (
                <div>
                  <h3 style={{ margin: '0 0 4px' }}>{item.name}</h3>
                  <p style={{ margin: '0 0 12px', color: '#666', fontSize: 13 }}>{item.role}</p>
                  <button type="button" style={btnSecondary} onClick={() => startEdit(item)}>Edit</button>
                  <button type="button" style={btnDanger} onClick={() => remove(item._id)}>Delete</button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {items.length === 0 && <p>No team members yet. Add one to get started.</p>}
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