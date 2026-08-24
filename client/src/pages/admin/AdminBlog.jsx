import { useEffect, useState } from 'react';
import api from '../../api/client';

const emptyForm = { title: '', slug: '', excerpt: '', content: '', author: 'Admin', category: 'General', published: true };

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  const load = async () => {
    const { data } = await api.get('/blog/admin/all');
    setPosts(data.data);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const startEdit = (post) => {
    setEditingId(post._id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      author: post.author,
      category: post.category,
      published: post.published,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/blog/${editingId}`, form);
      } else {
        await api.post('/blog', form);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/blog/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const uploadCover = async (id, file) => {
    setUploadingId(id);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await api.post(`/blog/${id}/cover`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div>
      <h1>Blog Posts</h1>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <form onSubmit={submit} style={card}>
        <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit post' : 'New post'}</h3>
        <div style={grid2}>
          <div>
            <label style={label}>Title</label>
            <input name="title" value={form.title} onChange={onChange} required style={input} />
          </div>
          <div>
            <label style={label}>Slug</label>
            <input name="slug" value={form.slug} onChange={onChange} required style={input} />
          </div>
          <div>
            <label style={label}>Author</label>
            <input name="author" value={form.author} onChange={onChange} style={input} />
          </div>
          <div>
            <label style={label}>Category</label>
            <input name="category" value={form.category} onChange={onChange} style={input} />
          </div>
        </div>
        <div style={{ margin: '10px 0' }}>
          <label style={label}>Excerpt</label>
          <input name="excerpt" value={form.excerpt} onChange={onChange} style={input} />
        </div>
        <div style={{ margin: '10px 0' }}>
          <label style={label}>Content (HTML)</label>
          <textarea name="content" rows="6" value={form.content} onChange={onChange} required style={input} />
        </div>
        <label style={{ ...label, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" name="published" checked={form.published} onChange={onChange} /> Published
        </label>
        <div style={{ marginTop: 14 }}>
          <button type="submit" style={btnPrimary} disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update post' : 'Create post'}
          </button>
          {editingId && (
            <button type="button" style={btnSecondary} onClick={resetForm}>Cancel</button>
          )}
        </div>
      </form>

      {posts.map((post) => (
        <div key={post._id} style={{ ...card, display: 'flex', gap: 20 }}>
          <div style={{ width: 140 }}>
            {post.coverImage?.url && <img src={post.coverImage.url} alt={post.title} style={{ width: '100%', borderRadius: 4 }} />}
            <label style={{ ...btnSecondary, display: 'inline-block', marginTop: 8, cursor: 'pointer', textAlign: 'center' }}>
              {uploadingId === post._id ? 'Uploading...' : 'Cover image'}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files[0] && uploadCover(post._id, e.target.files[0])}
              />
            </label>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px' }}>{post.title}</h3>
            <p style={{ margin: '0 0 8px', color: '#777', fontSize: 13 }}>
              {post.category} &middot; {post.published ? 'published' : 'draft'}
            </p>
            <p style={{ fontSize: 13 }}>{post.excerpt}</p>
            <button type="button" style={btnSecondary} onClick={() => startEdit(post)}>Edit</button>
            <button type="button" style={btnDanger} onClick={() => remove(post._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const card = { background: '#fff', padding: 20, borderRadius: 6, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };
const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 };
const label = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 };
const input = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' };
const btnPrimary = { background: '#c9a24b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginRight: 8 };
const btnSecondary = { background: '#eee', color: '#333', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, marginRight: 8 };
const btnDanger = { background: '#c0392b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 };
