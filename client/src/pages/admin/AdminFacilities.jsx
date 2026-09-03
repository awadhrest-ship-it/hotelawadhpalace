import { useEffect, useState } from 'react';
import api from '../../api/client';

const EMPTY = { tabLabel: '', name: '', tagline: '', description: '', menuLink: '', order: 0 };

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AdminFacilities() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY);
  const [uploadingId, setUploadingId] = useState(null);

  const load = async () => {
    const { data } = await api.get('/facilities/admin/all');
    setItems(data.data);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      tabLabel: item.tabLabel,
      name: item.name,
      tagline: item.tagline || '',
      description: item.description || '',
      menuLink: item.menuLink || '',
      order: item.order,
    });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/facilities/${editingId}`, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    try {
      const key = slugify(createForm.tabLabel);
      if (!key) {
        setError('Tab label is required.');
        return;
      }
      await api.post('/facilities', { ...createForm, key, order: Number(createForm.order) || 0 });
      setCreating(false);
      setCreateForm(EMPTY);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this tab? This cannot be undone.')) return;
    try {
      await api.delete(`/facilities/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = async (id, active) => {
    try {
      await api.put(`/facilities/${id}`, { active: !active });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const uploadImage = async (id, file) => {
    setUploadingId(id);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      await api.post(`/facilities/${id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div>
      <h1>Rooms &amp; Suites Section (Homepage Tabs)</h1>
      <p style={{ fontSize: 13, color: '#666', maxWidth: 640 }}>
        These are the extra tabs shown next to <strong>Rooms</strong> in the homepage &ldquo;Our Rooms &amp; Suites&rdquo; section
        (e.g. Restaurant, Bar, Rooftop, Garden, Dome). The <strong>Rooms</strong> tab itself always shows your live room
        listings and isn&rsquo;t managed here — manage rooms under Rooms. Order controls left-to-right position; lower
        numbers show first. Uncheck Active to hide a tab without deleting it.
      </p>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <div style={card}>
        {!creating ? (
          <button type="button" style={btnPrimary} onClick={() => setCreating(true)}>+ Add Tab</button>
        ) : (
          <form onSubmit={create}>
            <h3 style={{ marginTop: 0 }}>New Tab</h3>
            <div style={grid2}>
              <div>
                <label style={label}>Tab label (shown on the button, e.g. &ldquo;Spa&rdquo;)</label>
                <input style={input} value={createForm.tabLabel} onChange={(e) => setCreateForm((f) => ({ ...f, tabLabel: e.target.value }))} required />
              </div>
              <div>
                <label style={label}>Venue name (e.g. &ldquo;Serenity Spa&rdquo;)</label>
                <input style={input} value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
            </div>
            <div style={grid2}>
              <div>
                <label style={label}>Tagline</label>
                <input style={input} value={createForm.tagline} onChange={(e) => setCreateForm((f) => ({ ...f, tagline: e.target.value }))} />
              </div>
              <div>
                <label style={label}>Order</label>
                <input type="number" style={input} value={createForm.order} onChange={(e) => setCreateForm((f) => ({ ...f, order: e.target.value }))} />
              </div>
            </div>
            <label style={label}>Description</label>
            <textarea style={{ ...input, minHeight: 80 }} value={createForm.description} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} />
            <label style={label}>Menu link (optional — e.g. an AnyFlip menu URL. Shows a &ldquo;View Menu&rdquo; button on this tab.)</label>
            <input
              type="url"
              style={input}
              placeholder="https://anyflip.com/..."
              value={createForm.menuLink}
              onChange={(e) => setCreateForm((f) => ({ ...f, menuLink: e.target.value }))}
            />
            <div style={{ marginTop: 12 }}>
              <button type="submit" style={btnPrimary}>Save</button>
              <button type="button" style={btnSecondary} onClick={() => { setCreating(false); setCreateForm(EMPTY); }}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {items.map((item) => (
        <div key={item._id} style={card}>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ width: 160, flexShrink: 0 }}>
              <img
                src={item.image?.url || '/assets/images/background/room.jpg'}
                alt={item.name}
                style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block', borderRadius: 4 }}
              />
              <label style={{ ...btnSecondary, display: 'block', textAlign: 'center', marginTop: 8, cursor: 'pointer' }}>
                {uploadingId === item._id ? 'Uploading...' : 'Change Image'}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files[0] && uploadImage(item._id, e.target.files[0])}
                />
              </label>
            </div>

            <div style={{ flex: 1 }}>
              {editingId === item._id ? (
                <div>
                  <div style={grid2}>
                    <div>
                      <label style={label}>Tab label</label>
                      <input style={input} value={editForm.tabLabel} onChange={(e) => setEditForm((f) => ({ ...f, tabLabel: e.target.value }))} />
                    </div>
                    <div>
                      <label style={label}>Venue name</label>
                      <input style={input} value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                    </div>
                  </div>
                  <div style={grid2}>
                    <div>
                      <label style={label}>Tagline</label>
                      <input style={input} value={editForm.tagline} onChange={(e) => setEditForm((f) => ({ ...f, tagline: e.target.value }))} />
                    </div>
                    <div>
                      <label style={label}>Order</label>
                      <input type="number" style={input} value={editForm.order} onChange={(e) => setEditForm((f) => ({ ...f, order: e.target.value }))} />
                    </div>
                  </div>
                  <label style={label}>Description</label>
                  <textarea style={{ ...input, minHeight: 80 }} value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
                  <label style={label}>Menu link (optional — e.g. an AnyFlip menu URL. Shows a &ldquo;View Menu&rdquo; button on this tab.)</label>
                  <input
                    type="url"
                    style={input}
                    placeholder="https://anyflip.com/..."
                    value={editForm.menuLink}
                    onChange={(e) => setEditForm((f) => ({ ...f, menuLink: e.target.value }))}
                  />
                  <div style={{ marginTop: 12 }}>
                    <button type="button" style={btnPrimary} onClick={saveEdit}>Save</button>
                    <button type="button" style={btnSecondary} onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 11, color: '#c9a24b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                    Tab: {item.tabLabel} &middot; Order: {item.order}
                  </div>
                  <h3 style={{ margin: '0 0 4px' }}>{item.name}</h3>
                  {item.tagline && <p style={{ margin: '0 0 6px', fontStyle: 'italic', color: '#888', fontSize: 13 }}>{item.tagline}</p>}
                  <p style={{ margin: '0 0 10px', color: '#666', fontSize: 13 }}>{item.description}</p>
                  {item.menuLink && (
                    <p style={{ margin: '0 0 10px', fontSize: 13 }}>
                      <a href={item.menuLink} target="_blank" rel="noreferrer">{item.menuLink}</a>
                    </p>
                  )}
                  <label style={labelCheckbox}>
                    <input type="checkbox" checked={item.active} onChange={() => toggleActive(item._id, item.active)} /> Active
                  </label>
                  <div style={{ marginTop: 8 }}>
                    <button type="button" style={btnSecondary} onClick={() => startEdit(item)}>Edit</button>
                    <button type="button" style={btnDanger} onClick={() => remove(item._id)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {items.length === 0 && <p>No tabs yet. Add one to get started.</p>}
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