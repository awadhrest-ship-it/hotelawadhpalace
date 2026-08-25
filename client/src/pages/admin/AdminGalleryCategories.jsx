import { useEffect, useState } from 'react';
import api from '../../api/client';
import AdminModal from '../../components/admin/AdminModal';

const emptyForm = { name: '', description: '', featured: false, order: 0 };

export default function AdminGalleryCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [removeExistingCover, setRemoveExistingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/gallery-categories');
      setCategories(data.data);
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
    setEditingId(null);
    setForm(emptyForm);
    setCoverFile(null);
    setCoverPreview('');
    setRemoveExistingCover(false);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name,
      description: category.description || '',
      featured: category.featured,
      order: category.order,
    });
    setCoverFile(null);
    setCoverPreview(category.coverImage?.url || '');
    setRemoveExistingCover(false);
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  const onCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setRemoveExistingCover(false);
    setCoverPreview(URL.createObjectURL(file));
  };

  const clearCover = () => {
    setCoverFile(null);
    setCoverPreview('');
    setRemoveExistingCover(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Category name is required');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description);
      fd.append('featured', form.featured ? 'true' : 'false');
      fd.append('order', String(parseInt(form.order) || 0));
      if (coverFile) fd.append('coverImage', coverFile);
      if (editingId && removeExistingCover) fd.append('removeCoverImage', 'true');

      if (editingId) {
        await api.put(`/gallery-categories/${editingId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/gallery-categories', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this category? Images already uploaded to it will stay in the gallery but lose this category.')) return;
    try {
      await api.delete(`/gallery-categories/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Gallery Categories</h1>
        <button type="button" onClick={openAddModal} style={btnPrimary}>
          + Add Category
        </button>
      </div>

      {error && <p style={{ color: '#c0392b', marginBottom: 16 }}>{error}</p>}
      {loading && <p>Loading categories&hellip;</p>}

      {!loading && categories.length === 0 && (
        <div style={{ ...card, textAlign: 'center', color: '#777' }}>
          No categories yet. Click <strong>+ Add Category</strong> to create your first one.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {categories.map((cat) => (
          <div key={cat._id} style={{ ...card, marginBottom: 0, padding: 0, overflow: 'hidden' }}>
            <div style={{ width: '100%', height: 140, background: '#f0ece2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {cat.coverImage?.url ? (
                <img src={cat.coverImage.url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 12, color: '#aaa' }}>No cover photo</span>
              )}
            </div>
            <div style={{ padding: 16 }}>
              <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600 }}>{cat.name}</h4>
              {cat.description && <p style={{ margin: '0 0 8px', fontSize: 12, color: '#666' }}>{cat.description}</p>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#999', marginBottom: 12 }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 10,
                    background: cat.featured ? '#e8f8ee' : '#f2f2f2',
                    color: cat.featured ? '#27ae60' : '#999',
                    fontWeight: 600,
                  }}
                >
                  {cat.featured ? 'Featured on Home' : 'Not featured'}
                </span>
                <span>Order: {cat.order}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" onClick={() => openEditModal(cat)} style={{ ...btnSecondary, flex: 1 }}>
                  Edit
                </button>
                <button type="button" onClick={() => remove(cat._id)} style={{ ...btnDanger, flex: 1 }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <AdminModal title={editingId ? 'Edit Category' : 'Add Category'} onClose={closeModal} closable={!saving}>
          <form onSubmit={handleSubmit}>
            {formError && <p style={{ color: '#c0392b', fontSize: 13, marginTop: 0 }}>{formError}</p>}

            <label style={label}>Category Name *</label>
            <input
              placeholder="e.g. Wedding"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ ...input, marginBottom: 12 }}
              autoFocus
            />

            <label style={label}>Description (optional)</label>
            <textarea
              placeholder="Short description shown with this category"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ ...input, marginBottom: 12, minHeight: 60, fontFamily: 'inherit' }}
            />

            <label style={label}>Cover Photo (optional)</label>
            <div style={{ marginBottom: 12 }}>
              {coverPreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={coverPreview} alt="Cover preview" style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 4, display: 'block' }} />
                  <button type="button" onClick={clearCover} style={removeCoverBtn}>
                    Remove
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: 12, color: '#999', margin: '0 0 8px' }}>
                  No cover photo selected — you can add one now or later by editing this category.
                </p>
              )}
              <div>
                <label style={{ ...btnSecondary, display: 'inline-block', cursor: 'pointer', marginTop: 8 }}>
                  {coverPreview ? 'Change Photo' : 'Choose Photo'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={onCoverChange} />
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <button
                type="button"
                role="switch"
                aria-checked={form.featured}
                onClick={() => setForm({ ...form, featured: !form.featured })}
                style={form.featured ? switchOn : switchOff}
              >
                <span style={form.featured ? switchKnobOn : switchKnobOff} />
              </button>
              <span style={{ fontSize: 13 }}>
                Feature on Home Page
                <span style={{ display: 'block', fontSize: 11, color: '#999' }}>
                  {form.featured ? 'On — shows in the homepage gallery slider' : 'Off — only visible on the Gallery page'}
                </span>
              </span>
            </div>

            <label style={label}>Display Order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
              style={{ ...input, marginBottom: 16 }}
            />

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={saving} style={{ ...btnPrimary, flex: 1 }}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Category'}
              </button>
              <button type="button" onClick={closeModal} disabled={saving} style={{ ...btnSecondary, flex: 1 }}>
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
const switchBase = {
  position: 'relative',
  width: 42,
  height: 24,
  borderRadius: 12,
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'background 0.2s ease',
};
const switchOn = { ...switchBase, background: '#c9a24b' };
const switchOff = { ...switchBase, background: '#ccc' };
const switchKnobBase = {
  position: 'absolute',
  top: 2,
  width: 20,
  height: 20,
  borderRadius: '50%',
  background: '#fff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  transition: 'left 0.2s ease',
};
const switchKnobOn = { ...switchKnobBase, left: 20 };
const switchKnobOff = { ...switchKnobBase, left: 2 };
const removeCoverBtn = {
  position: 'absolute',
  top: 4,
  right: 4,
  background: 'rgba(0,0,0,0.6)',
  color: '#fff',
  border: 'none',
  borderRadius: 3,
  padding: '3px 8px',
  fontSize: 11,
  cursor: 'pointer',
};