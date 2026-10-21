import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import { StarDisplay } from '../../components/StarRating';

const CATEGORY_LABELS = {
  cleanliness: 'Cleanliness',
  service: 'Service',
  comfort: 'Comfort',
  food: 'Food',
  value: 'Value',
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'featured', label: 'Featured on website' },
  { key: 'archived', label: 'Archived' },
];

export default function AdminFeedback() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get('/feedback');
    setItems(data.data);
  };

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleFeatured = async (item) => {
    if (!item.featured && !item.allowDisplay) {
      const ok = window.confirm(
        'This guest did not tick "you may show my feedback on the website".\n\nFeature it anyway?'
      );
      if (!ok) return;
    }
    try {
      await api.put(`/feedback/${item._id}/featured`, { featured: !item.featured });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/feedback/${id}/status`, { status });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this feedback permanently?')) return;
    try {
      await api.delete(`/feedback/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const stats = useMemo(() => {
    const total = items.length;
    const avg = total ? items.reduce((s, i) => s + (i.ratings?.overall || 0), 0) / total : 0;
    return {
      total,
      avg: avg.toFixed(1),
      newCount: items.filter((i) => i.status === 'new').length,
      featured: items.filter((i) => i.featured).length,
    };
  }, [items]);

  const visible = items.filter((i) => {
    if (filter === 'new') return i.status === 'new';
    if (filter === 'featured') return i.featured;
    if (filter === 'archived') return i.status === 'archived';
    return true;
  });

  return (
    <div>
      <h1>Guest Feedback</h1>
      <p style={{ color: '#777', marginTop: -6 }}>
        Feedback submitted from the website&rsquo;s feedback page. Click <strong>Feature on website</strong> to show a
        review in the &ldquo;Guest Feedback&rdquo; section of the home page.
      </p>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total feedback', value: stats.total },
          { label: 'Average rating', value: stats.total ? `${stats.avg} / 5` : '—' },
          { label: 'New (unread)', value: stats.newCount },
          { label: 'Featured on website', value: stats.featured },
        ].map((c) => (
          <div key={c.label} style={{ ...card, marginBottom: 0, padding: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{c.value}</div>
            <div style={{ fontSize: 12, color: '#777' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            style={{
              ...chip,
              ...(filter === f.key ? { background: '#c9a24b', color: '#fff', borderColor: '#c9a24b' } : {}),
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p>Loading&hellip;</p>}

      {visible.map((item) => (
        <div
          key={item._id}
          style={{ ...card, borderLeft: item.featured ? '4px solid #c9a24b' : '4px solid transparent' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 16 }}>{item.name}</strong>
                <StarDisplay value={item.ratings?.overall || 0} size={16} />
                {item.status === 'new' && <span style={{ ...badge, background: '#2980b9' }}>NEW</span>}
                {item.featured && <span style={{ ...badge, background: '#c9a24b' }}>FEATURED</span>}
                {!item.allowDisplay && (
                  <span style={{ ...badge, background: '#999' }} title="Guest did not agree to public display">
                    NOT FOR DISPLAY
                  </span>
                )}
              </div>

              <p style={{ margin: '10px 0', whiteSpace: 'pre-wrap' }}>{item.message}</p>

              {item.ratings && (
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: '#555', marginBottom: 8 }}>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) =>
                    item.ratings[key] ? (
                      <span key={key}>
                        {label}: <strong>{item.ratings[key]}/5</strong>
                      </span>
                    ) : null
                  )}
                </div>
              )}

              <div style={{ fontSize: 12, color: '#888', lineHeight: 1.7 }}>
                {item.email && <span>{item.email} &middot; </span>}
                {item.phone && <span>{item.phone} &middot; </span>}
                {item.city && <span>{item.city} &middot; </span>}
                {item.roomType && <span>Room: {item.roomType} &middot; </span>}
                {item.stayDate && <span>Stayed: {new Date(item.stayDate).toLocaleDateString()} &middot; </span>}
                {item.wouldRecommend === 'yes' && <span>Would recommend &middot; </span>}
                {item.wouldRecommend === 'no' && <span>Would not recommend &middot; </span>}
                <span>Submitted {new Date(item.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right', minWidth: 170 }}>
              <button
                type="button"
                onClick={() => toggleFeatured(item)}
                style={item.featured ? btnFeaturedOn : btnFeaturedOff}
              >
                {item.featured ? '★ Featured — click to remove' : '☆ Feature on website'}
              </button>
              <br />
              <select
                value={item.status}
                onChange={(e) => updateStatus(item._id, e.target.value)}
                style={{ marginTop: 10 }}
              >
                <option value="new">new</option>
                <option value="read">read</option>
                <option value="archived">archived</option>
              </select>
              <br />
              <button type="button" onClick={() => remove(item._id)} style={btnDanger}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {!loading && visible.length === 0 && <p>No feedback to show here yet.</p>}
    </div>
  );
}

const card = { background: '#fff', padding: 18, borderRadius: 6, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };
const chip = { background: '#fff', color: '#333', border: '1px solid #ddd', padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13, marginRight: 8, marginBottom: 6 };
const badge = { color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, letterSpacing: 0.5 };
const btnFeaturedOff = { background: '#c9a24b', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 13 };
const btnFeaturedOn = { background: '#fff', color: '#c9a24b', border: '1px solid #c9a24b', padding: '8px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 13 };
const btnDanger = { marginTop: 10, background: '#c0392b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13 };