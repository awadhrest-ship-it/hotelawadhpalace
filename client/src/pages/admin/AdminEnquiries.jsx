import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/contact');
    setEnquiries(data.data);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/contact/${id}/status`, { status });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try {
      await api.delete(`/contact/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Contact Enquiries</h1>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}
      {enquiries.map((enq) => (
        <div key={enq._id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>{enq.name}</strong> &middot; {enq.email} {enq.phone && `\u00b7 ${enq.phone}`}
              <p style={{ margin: '6px 0' }}>{enq.message}</p>
              <span style={{ fontSize: 12, color: '#999' }}>
                {new Date(enq.createdAt).toLocaleString()}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <select value={enq.status} onChange={(e) => updateStatus(enq._id, e.target.value)}>
                <option value="new">new</option>
                <option value="read">read</option>
                <option value="responded">responded</option>
                <option value="archived">archived</option>
              </select>
              <br />
              <button
                type="button"
                onClick={() => remove(enq._id)}
                style={{ marginTop: 8, background: '#c0392b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
      {enquiries.length === 0 && <p>No enquiries yet.</p>}
    </div>
  );
}

const card = { background: '#fff', padding: 16, borderRadius: 6, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' };
