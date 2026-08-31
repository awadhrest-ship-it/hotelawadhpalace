import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function AdminAboutImages() {
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await api.get('/about-images/admin/all');
    setImages(data.data);
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
      // Uploads can take longer than the shared api client's default
      // timeout, so give this request more headroom (same pattern as
      // Admin > Hero Images).
      await api.post('/about-images', fd, {
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

  const remove = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await api.delete(`/about-images/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = async (id, active) => {
    try {
      await api.put(`/about-images/${id}`, { active: !active });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>About Images</h1>
      <p style={{ fontSize: 13, color: '#666', marginTop: -8 }}>
        These images appear in the &ldquo;About Awadh Palace&rdquo; slider on the homepage, and the first
        active image is also used as the photo on the About Us page.
      </p>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Upload New About Image</h3>
        <p style={{ fontSize: 13, color: '#666' }}>Images appear in upload order on the homepage slider.</p>
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

      {images.map((img, idx) => (
        <div key={img._id} style={card}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 200 }}>
              <img
                src={img.image.url}
                alt={img.image.alt || 'About Awadh Palace'}
                style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block', borderRadius: 4 }}
              />
              <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>Order: {idx + 1}</div>
            </div>

            <div style={{ flex: 1 }}>
              <label style={labelCheckbox}>
                <input type="checkbox" checked={img.active} onChange={() => toggleActive(img._id, img.active)} />
                Active
              </label>
              <br />
              <button type="button" onClick={() => remove(img._id)} style={btnDanger}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {images.length === 0 && (
        <p>No custom About images yet &mdash; the site is showing its default images. Upload one to override them.</p>
      )}
    </div>
  );
}

const card = { background: '#fff', padding: 20, borderRadius: 6, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };
const btnPrimary = { background: '#c9a24b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginRight: 8 };
const btnDanger = { background: '#c0392b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginRight: 8 };
const labelCheckbox = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginTop: 8, marginBottom: 12 };