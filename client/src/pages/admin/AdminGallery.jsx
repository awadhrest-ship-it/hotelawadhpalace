import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import AdminModal from '../../components/admin/AdminModal';

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');

  const categoryById = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c._id] = c; });
    return map;
  }, [categories]);

  const load = async () => {
    try {
      setLoading(true);
      const [catRes, itemRes] = await Promise.all([
        api.get('/gallery-categories'),
        api.get('/gallery'),
      ]);
      setCategories(catRes.data.data);
      setItems(itemRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAddModal = () => {
    setTitle('');
    setCategory(categories[0]?._id || '');
    setImageFile(null);
    setImagePreview('');
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    if (uploading) return;
    setShowModal(false);
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (categories.length === 0) {
      setFormError('Create a gallery category first, then come back and upload images.');
      return;
    }
    if (!category) {
      setFormError('Please select a category');
      return;
    }
    if (!imageFile) {
      setFormError('Please choose an image to upload');
      return;
    }

    setUploading(true);
    setFormError('');
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      fd.append('title', title);
      fd.append('category', category);
      await api.post('/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowModal(false);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
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
      setError(err.response?.data?.message || err.message);
    }
  };

  const visibleItems = activeTab === 'all' ? items : items.filter((item) => item.category === activeTab);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Gallery Images</h1>
        <button type="button" onClick={openAddModal} style={btnPrimary}>
          + Add Image
        </button>
      </div>

      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      {!loading && categories.length === 0 && (
        <div style={{ ...card, marginBottom: 16, color: '#777' }}>
          You don&apos;t have any gallery categories yet. Go to <strong>Gallery Categories</strong> and add one first —
          then you can upload images into it here.
        </div>
      )}

      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <button type="button" onClick={() => setActiveTab('all')} style={activeTab === 'all' ? tabActive : tab}>
            All ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.category === cat._id).length;
            return (
              <button
                key={cat._id}
                type="button"
                onClick={() => setActiveTab(cat._id)}
                style={activeTab === cat._id ? tabActive : tab}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {loading && <p>Loading gallery&hellip;</p>}
      {!loading && visibleItems.length === 0 && categories.length > 0 && (
        <p style={{ color: '#777' }}>No images {activeTab !== 'all' ? 'in this category' : ''} yet.</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {visibleItems.map((item) => (
          <div key={item._id} style={{ background: '#fff', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <img src={item.image.url} alt={item.title} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: 8 }}>
              <div style={{ fontSize: 12, color: '#333', fontWeight: 600 }}>{item.title || 'Untitled'}</div>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>
                {categoryById[item.category]?.name || 'Uncategorized'}
              </div>
              <button type="button" onClick={() => remove(item._id)} style={{ ...btnDanger, width: '100%' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <AdminModal title="Add Image" onClose={closeModal} closable={!uploading}>
          <form onSubmit={handleSubmit}>
            {formError && <p style={{ color: '#c0392b', fontSize: 13, marginTop: 0 }}>{formError}</p>}

            <label style={label}>Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ ...input, marginBottom: 12 }}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <label style={label}>Title (optional)</label>
            <input
              placeholder="e.g. Deluxe Room View"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ ...input, marginBottom: 12 }}
            />

            <label style={label}>Image *</label>
            <div style={{ marginBottom: 16 }}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 4, display: 'block', marginBottom: 8 }} />
              ) : (
                <p style={{ fontSize: 12, color: '#999', margin: '0 0 8px' }}>No image selected yet.</p>
              )}
              <label style={{ ...btnSecondary, display: 'inline-block', cursor: 'pointer' }}>
                {imagePreview ? 'Change Image' : 'Choose Image'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onImageChange} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={uploading} style={{ ...btnPrimary, flex: 1 }}>
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
              <button type="button" onClick={closeModal} disabled={uploading} style={{ ...btnSecondary, flex: 1 }}>
                Cancel
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}

const card = { background: '#fff', padding: 20, borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };
const label = { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 };
const input = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' };
const btnPrimary = { background: '#c9a24b', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 600 };
const btnSecondary = { background: '#7f8c8d', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13 };
const btnDanger = { background: '#c0392b', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13 };
const tab = { background: '#f0f0f0', color: '#333', border: 'none', padding: '7px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 12 };
const tabActive = { ...tab, background: '#c9a24b', color: '#fff', fontWeight: 600 };