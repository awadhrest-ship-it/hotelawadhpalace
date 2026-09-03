import { useEffect, useState } from 'react';
import api from '../../api/client';

const emptyForm = {
  name: '',
  slug: '',
  category: '',
  description: '',
  shortDescription: '',
  price: '',
  capacityAdults: 2,
  capacityChildren: 0,
  sizeSqft: '',
  sizeSqmt: '',
  bedType: '',
  bathroomCount: 1,
  view: '',
  totalUnits: 1,
  featured: false,
  status: 'active',
  amenities: [],
};

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  const load = async () => {
    const [roomsRes, catRes, amenityRes] = await Promise.all([
      api.get('/rooms'),
      api.get('/categories'),
      api.get('/amenities'),
    ]);
    setRooms(roomsRes.data.data);
    setCategories(catRes.data.data);
    setAmenities(amenityRes.data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleAmenity = (id) => {
    setForm((f) => {
      const has = f.amenities.includes(id);
      return { ...f, amenities: has ? f.amenities.filter((a) => a !== id) : [...f.amenities, id] };
    });
  };

  const startEdit = (room) => {
    setEditingId(room._id);
    setForm({
      name: room.name,
      slug: room.slug,
      category: room.category?._id || room.category,
      description: room.description,
      shortDescription: room.shortDescription || '',
      price: room.price,
      capacityAdults: room.capacityAdults,
      capacityChildren: room.capacityChildren,
      sizeSqft: room.sizeSqft || '',
      sizeSqmt: room.sizeSqmt || '',
      bedType: room.bedType || '',
      bathroomCount: room.bathroomCount ?? 1,
      view: room.view || '',
      totalUnits: room.totalUnits,
      featured: room.featured,
      status: room.status,
      amenities: (room.amenities || []).map((a) => (a._id ? a._id : a)),
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
      const payload = {
        ...form,
        price: Number(form.price),
        capacityAdults: Number(form.capacityAdults),
        capacityChildren: Number(form.capacityChildren),
        sizeSqft: form.sizeSqft ? Number(form.sizeSqft) : undefined,
        sizeSqmt: form.sizeSqmt ? Number(form.sizeSqmt) : undefined,
        bathroomCount: form.bathroomCount !== '' ? Number(form.bathroomCount) : undefined,
        totalUnits: Number(form.totalUnits),
        amenities: form.amenities,
      };
      if (editingId) {
        await api.put(`/rooms/${editingId}`, payload);
      } else {
        await api.post('/rooms', payload);
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
    if (!window.confirm('Delete this room? This cannot be undone.')) return;
    try {
      await api.delete(`/rooms/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const uploadImage = async (roomId, file) => {
    setUploadingId(roomId);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await api.post(`/rooms/${roomId}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  const deleteImage = async (roomId, publicId) => {
    try {
      await api.delete(`/rooms/${roomId}/images/${encodeURIComponent(publicId)}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Rooms</h1>
      <p style={{ color: '#666', fontSize: 13, marginTop: -6 }}>
        Manage room types, pricing, images, and details here. Need a new category (Deluxe, Executive, Suite&hellip;)
        or a new feature tag (Wi-Fi, Study Room, Smoking Room&hellip;)? Head to the <strong>Room Categories</strong> or{' '}
        <strong>Room Features</strong> pages in the sidebar first, then come back to assign them.
      </p>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <form onSubmit={submit} style={card}>
        <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit room' : 'Add a room'}</h3>
        <div style={grid2}>
          <div>
            <label style={label}>Name</label>
            <input name="name" value={form.name} onChange={onChange} required style={input} />
          </div>
          <div>
            <label style={label}>Slug</label>
            <input name="slug" value={form.slug} onChange={onChange} required style={input} />
          </div>
          <div>
            <label style={label}>Category</label>
            <select name="category" value={form.category} onChange={onChange} required style={input}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>Price / night</label>
            <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={onChange} required style={input} />
          </div>
          <div>
            <label style={label}>Adult capacity</label>
            <input name="capacityAdults" type="number" min="1" value={form.capacityAdults} onChange={onChange} required style={input} />
          </div>
          <div>
            <label style={label}>Children capacity</label>
            <input name="capacityChildren" type="number" min="0" value={form.capacityChildren} onChange={onChange} style={input} />
          </div>
          <div>
            <label style={label}>Size (sqft)</label>
            <input name="sizeSqft" type="number" min="0" value={form.sizeSqft} onChange={onChange} style={input} />
          </div>
          <div>
            <label style={label}>Size (sq.mt)</label>
            <input name="sizeSqmt" type="number" min="0" value={form.sizeSqmt} onChange={onChange} style={input} />
          </div>
          <div>
            <label style={label}>Bed type</label>
            <input name="bedType" value={form.bedType} onChange={onChange} placeholder="e.g. 1 King Bed" style={input} />
          </div>
          <div>
            <label style={label}>Bathrooms</label>
            <input name="bathroomCount" type="number" min="0" value={form.bathroomCount} onChange={onChange} style={input} />
          </div>
          <div>
            <label style={label}>View</label>
            <input name="view" value={form.view} onChange={onChange} placeholder="e.g. City View, Garden View" style={input} />
          </div>
          <div>
            <label style={label}>Total units</label>
            <input name="totalUnits" type="number" min="1" value={form.totalUnits} onChange={onChange} style={input} />
          </div>
          <div>
            <label style={label}>Status</label>
            <select name="status" value={form.status} onChange={onChange} style={input}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
        <div style={{ margin: '10px 0' }}>
          <label style={label}>Short description</label>
          <input name="shortDescription" value={form.shortDescription} onChange={onChange} style={input} />
        </div>
        <div style={{ margin: '10px 0' }}>
          <label style={label}>Description</label>
          <textarea name="description" rows="3" value={form.description} onChange={onChange} required style={input} />
        </div>
        <div style={{ margin: '10px 0' }}>
          <label style={label}>Features / Amenities</label>
          {amenities.length === 0 ? (
            <p style={{ fontSize: 13, color: '#777' }}>
              No features yet &mdash; add some on the <em>Room Features</em> page first.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
              {amenities.map((a) => (
                <label key={a._id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={form.amenities.includes(a._id)}
                    onChange={() => toggleAmenity(a._id)}
                  />
                  {a.name}
                </label>
              ))}
            </div>
          )}
        </div>
        <label style={{ ...label, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" name="featured" checked={form.featured} onChange={onChange} /> Featured
        </label>
        <div style={{ marginTop: 14 }}>
          <button type="submit" style={btnPrimary} disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update room' : 'Create room'}
          </button>
          {editingId && (
            <button type="button" style={btnSecondary} onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={{ marginTop: 30 }}>
        {rooms.map((room) => (
          <div key={room._id} style={{ ...card, display: 'flex', gap: 20 }}>
            <div style={{ width: 160 }}>
              {room.images?.[0]?.url && (
                <img src={room.images[0].url} alt={room.name} style={{ width: '100%', borderRadius: 4 }} />
              )}
              <label style={{ ...btnSecondary, display: 'inline-block', marginTop: 8, cursor: 'pointer', textAlign: 'center' }}>
                {uploadingId === room._id ? 'Uploading...' : 'Add image'}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files[0] && uploadImage(room._id, e.target.files[0])}
                />
              </label>
              {room.images?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                  {room.images.map((img) => (
                    <button
                      key={img.publicId}
                      type="button"
                      onClick={() => deleteImage(room._id, img.publicId)}
                      style={{ fontSize: 11, border: '1px solid #ddd', background: '#fff', borderRadius: 4, cursor: 'pointer' }}
                      title="Remove image"
                    >
                      remove
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px' }}>{room.name}</h3>
              <p style={{ margin: '0 0 8px', color: '#777', fontSize: 13 }}>
                {room.category?.name} &middot; ${room.price.toFixed(2)}/night &middot; {room.status}
                {room.featured ? ' \u2605 featured' : ''}
              </p>
              <p style={{ margin: '0 0 8px', color: '#777', fontSize: 13 }}>
                {room.sizeSqft ? `${room.sizeSqft} sqft` : ''}
                {room.sizeSqmt ? ` (${room.sizeSqmt} sq.mt)` : ''}
                {room.bedType ? ` \u00b7 ${room.bedType}` : ''}
                {room.bathroomCount ? ` \u00b7 ${room.bathroomCount} Bathroom${room.bathroomCount > 1 ? 's' : ''}` : ''}
                {room.view ? ` \u00b7 ${room.view}` : ''}
              </p>
              {room.amenities?.length > 0 && (
                <p style={{ margin: '0 0 8px', color: '#555', fontSize: 12 }}>
                  {room.amenities.map((a) => a.name).join(' \u00b7 ')}
                </p>
              )}
              <p style={{ fontSize: 13 }}>{room.shortDescription || room.description}</p>
              <button type="button" style={btnSecondary} onClick={() => startEdit(room)}>Edit</button>
              <button type="button" style={btnDanger} onClick={() => remove(room._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
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