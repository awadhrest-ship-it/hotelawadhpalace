import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function AdminGalleryCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/gallery-categories');
      setCategories(data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setName('');
    setDescription('');
    setFeatured(false);
    setOrder(0);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (file) => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    if (editingId && !file) {
      // Update without file
      setUploading(true);
      setError('');
      try {
        await api.put(`/gallery-categories/${editingId}`, {
          name,
          description,
          featured: featured ? 'true' : 'false',
          order: parseInt(order),
        });
        reset();
        await load();
      } catch (err) {
        setError(err.message);
      } finally {
        setUploading(false);
      }
    } else if (file || editingId) {
      // Create or update with file
      setUploading(true);
      setError('');
      try {
        const fd = new FormData();
        fd.append('name', name);
        fd.append('description', description);
        fd.append('featured', featured ? 'true' : 'false');
        fd.append('order', parseInt(order));
        if (file) fd.append('coverImage', file);

        if (editingId) {
          await api.put(`/gallery-categories/${editingId}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          await api.post('/gallery-categories', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
        reset();
        await load();
      } catch (err) {
        setError(err.message);
      } finally {
        setUploading(false);
      }
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setName(category.name);
    setDescription(category.description);
    setFeatured(category.featured);
    setOrder(category.order);
    setError('');
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this category? All gallery items in this category will not be deleted but will lose the category reference.')) return;
    try {
      await api.delete(`/gallery-categories/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Gallery Categories</h1>
      {error && <p style={{ color: '#c0392b', marginBottom: 16 }}>{error}</p>}

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Category' : 'Add Category'}</h3>
        <input
          placeholder="Category Name (required)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ ...input, marginBottom: 8 }}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...input, marginBottom: 8, minHeight: 60, fontFamily: 'inherit' }}
        />
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              style={{ cursor: 'pointer', width: 18, height: 18 }}
            />
            <span style={{ fontSize: 13 }}>Featured on Home Page</span>
          </label>
        </div>
        <input
          type="number"
          placeholder="Order (0 is first)"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          style={{ ...input, marginBottom: 12 }}
        />
        <label style={{ ...btnPrimary, display: 'inline-block', cursor: 'pointer', marginRight: 8 }}>
          {uploading ? 'Processing...' : editingId ? 'Update Category' : 'Add Category'}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && handleSubmit(e.target.files[0])}
            disabled={uploading}
          />
        </label>
        {editingId && !uploading && (
          <>
            <button
              type="button"
              onClick={() => handleSubmit(null)}
              style={{ ...btnSecondary, display: 'inline-block', marginRight: 8 }}
            >
              Save Without Image
            </button>
            <button
              type="button"
              onClick={reset}
              style={{ ...btnDanger, display: 'inline-block' }}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      <div>
        <h3>Categories</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {categories.map((cat) => (
            <div key={cat._id} style={{ ...card, marginBottom: 0 }}>
              {cat.coverImage?.url && (
                <img
                  src={cat.coverImage.url}
                  alt={cat.name}
                  style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 4, marginBottom: 12 }}
                />
              )}
              <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600 }}>{cat.name}</h4>
              {cat.description && <p style={{ margin: '0 0 8px', fontSize: 12, color: '#666' }}>{cat.description}</p>}
              <div style={{ fontSize: 11, color: '#999', marginBottom: 10 }}>
                <div>Order: {cat.order}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Featured: 
                  <span style={{ 
                    display: 'inline-block', 
                    width: 16, 
                    height: 16, 
                    borderRadius: 2, 
                    background: cat.featured ? '#27ae60' : '#bdc3c7',
                    marginLeft: 4
                  }} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => startEdit(cat)}
                style={{ ...btnSecondary, marginRight: 6, width: 'calc(50% - 3px)' }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(cat._id)}
                style={{ ...btnDanger, width: 'calc(50% - 3px)' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const card = { background: '#fff', padding: 20, borderRadius: 6, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };
const input = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' };
const btnPrimary = { background: '#c9a24b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 };
const btnSecondary = { background: '#7f8c8d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 };
const btnDanger = { background: '#c0392b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 };