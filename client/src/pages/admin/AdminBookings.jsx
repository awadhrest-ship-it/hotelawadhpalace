import { useEffect, useState } from 'react';
import api from '../../api/client';

const STATUSES = ['pending', 'confirmed', 'cancelled', 'checked-in', 'completed'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/bookings', { params: filter ? { status: filter } : {} });
    setBookings(data.data);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Bookings</h1>
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ marginBottom: 16, padding: 8 }}>
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <table style={{ width: '100%', background: '#fff', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
            <th style={th}>Reference</th>
            <th style={th}>Guest</th>
            <th style={th}>Room</th>
            <th style={th}>Dates</th>
            <th style={th}>Total</th>
            <th style={th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={td}>{b.reference}</td>
              <td style={td}>
                {b.guest.firstName} {b.guest.lastName}
                <br />
                <span style={{ color: '#888' }}>{b.guest.email}</span>
              </td>
              <td style={td}>{b.room?.name}</td>
              <td style={td}>
                {new Date(b.checkIn).toLocaleDateString()} &rarr; {new Date(b.checkOut).toLocaleDateString()}
              </td>
              <td style={td}>${b.totalAmount.toFixed(2)}</td>
              <td style={td}>
                <select value={b.status} onChange={(e) => updateStatus(b._id, e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td style={td} colSpan={6}>No bookings found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const th = { padding: '10px 12px', fontSize: 13 };
const td = { padding: '10px 12px', fontSize: 13, verticalAlign: 'top' };
