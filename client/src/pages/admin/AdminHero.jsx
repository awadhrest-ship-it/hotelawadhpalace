import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function AdminHero() {
  const [heroes, setHeroes] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', subtitle: '', buttonText: '', buttonLink: '', showButton: true });

  const load = async () => {
    const { data } = await api.get('/hero/admin/all');
    setHeroes(data.data);
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
      fd.append('title', '');
      fd.append('subtitle', '');
      // Uploads (especially larger hero images) can take longer than the
      // 15s default set on the shared `api` client, so give this request
      // more headroom instead of raising the timeout for every endpoint.
      await api.post('/hero', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (hero) => {
    setEditingId(hero._id);
    setEditForm({
      title: hero.title,
      subtitle: hero.subtitle,
      buttonText: hero.buttonText ?? 'Explore Rooms',
      buttonLink: hero.buttonLink ?? '/rooms',
      showButton: hero.showButton !== false,
    });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/hero/${editingId}`, editForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this hero image?')) return;
    try {
      await api.delete(`/hero/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = async (id, active) => {
    try {
      await api.put(`/hero/${id}`, { active: !active });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Hero Images (Homepage Slider)</h1>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Upload New Hero Image</h3>
        <p style={{ fontSize: 13, color: '#666' }}>Images will appear in order on the homepage slider</p>
        <label style={{ ...btnPrimary, display: 'inline-block', cursor: 'pointer' }}>
          {uploading ? 'Uploading...' : 'Choose Image'}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && upload(e.target.files[0])}
          />
        </label>
      </div>

      {heroes.map((hero, idx) => (
        <div key={hero._id} style={card}>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ width: 200 }}>
              <img src={hero.image.url} alt={hero.title} style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block', borderRadius: 4 }} />
              <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>Order: {idx + 1}</div>
            </div>

            <div style={{ flex: 1 }}>
              {editingId === hero._id ? (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={label}>Title</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Hero title (e.g., 'Discover A Hotel That Defines A New Dimension Of Luxury')"
                      style={input}
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={label}>Subtitle</label>
                    <input
                      type="text"
                      value={editForm.subtitle}
                      onChange={(e) => setEditForm((f) => ({ ...f, subtitle: e.target.value }))}
                      placeholder="Hero subtitle (optional)"
                      style={input}
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={labelCheckbox}>
                      <input
                        type="checkbox"
                        checked={editForm.showButton}
                        onChange={(e) => setEditForm((f) => ({ ...f, showButton: e.target.checked }))}
                      />
                      Show button on this slide
                    </label>
                  </div>
                  {editForm.showButton && (
                    <>
                      <div style={{ marginBottom: 12 }}>
                        <label style={label}>Button Text</label>
                        <input
                          type="text"
                          value={editForm.buttonText}
                          onChange={(e) => setEditForm((f) => ({ ...f, buttonText: e.target.value }))}
                          placeholder="e.g., 'Explore Rooms', 'Book Now'"
                          style={input}
                        />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label style={label}>Button Link</label>
                        <input
                          type="text"
                          value={editForm.buttonLink}
                          onChange={(e) => setEditForm((f) => ({ ...f, buttonLink: e.target.value }))}
                          placeholder="e.g., '/rooms' or 'https://example.com'"
                          style={input}
                        />
                      </div>
                    </>
                  )}
                  <button type="button" onClick={saveEdit} style={btnPrimary}>
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} style={btnSecondary}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <h3 style={{ margin: '0 0 8px' }}>{hero.title || '(No title)'}</h3>
                  <p style={{ margin: '0 0 8px', color: '#666', fontSize: 13 }}>{hero.subtitle || '(No subtitle)'}</p>
                  <p style={{ margin: '0 0 8px', color: '#666', fontSize: 13 }}>
                    Button: {hero.showButton !== false
                      ? `"${hero.buttonText || 'Explore Rooms'}" → ${hero.buttonLink || '/rooms'}`
                      : '(hidden)'}
                  </p>
                  <label style={{ ...labelCheckbox }}>
                    <input type="checkbox" checked={hero.active} onChange={() => toggleActive(hero._id, hero.active)} />
                    Active
                  </label>
                  <br />
                  <button type="button" onClick={() => startEdit(hero)} style={btnSecondary}>
                    Edit Text
                  </button>
                  <button type="button" onClick={() => remove(hero._id)} style={btnDanger}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {heroes.length === 0 && <p>No hero images yet. Upload one to get started.</p>}
    </div>
  );
}

const card = { background: '#fff', padding: 20, borderRadius: 6, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };
const label = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 };
const input = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' };
const btnPrimary = { background: '#c9a24b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginRight: 8 };
const btnSecondary = { background: '#eee', color: '#333', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginRight: 8 };
const btnDanger = { background: '#c0392b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginRight: 8 };
const labelCheckbox = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginTop: 8, marginBottom: 12 };