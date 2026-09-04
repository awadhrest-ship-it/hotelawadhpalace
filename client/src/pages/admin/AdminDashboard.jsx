import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get('/dashboard/summary')
      .then(({ data }) => active && setSummary(data.data))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, []);

  if (error) return <p style={{ color: '#c0392b' }}>{error}</p>;
  if (!summary) return <p>Loading&hellip;</p>;

  const cards = [
    { label: 'Total Rooms', value: summary.totalRooms },
    { label: 'Active Rooms', value: summary.activeRooms },
    { label: 'Total Bookings', value: summary.totalBookings },
    { label: 'Pending Bookings', value: summary.pendingBookings },
    { label: 'Confirmed Bookings', value: summary.confirmedBookings },
    { label: 'New Enquiries', value: summary.newEnquiries },
    { label: 'Newsletter Subscribers', value: summary.subscribers },
    { label: 'Total Revenue', value: `₹${summary.totalRevenue.toFixed(2)}` },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 30 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: '#fff', padding: 20, borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{c.value}</div>
            <div style={{ fontSize: 13, color: '#777' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <h2>Recent Bookings</h2>
      <table style={{ width: '100%', background: '#fff', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
            <th style={th}>Reference</th>
            <th style={th}>Room</th>
            <th style={th}>Check-in</th>
            <th style={th}>Check-out</th>
            <th style={th}>Status</th>
            <th style={th}>Total</th>
          </tr>
        </thead>
        <tbody>
          {summary.recentBookings.map((b) => (
            <tr key={b._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={td}>{b.reference}</td>
              <td style={td}>{b.room?.name}</td>
              <td style={td}>{new Date(b.checkIn).toLocaleDateString()}</td>
              <td style={td}>{new Date(b.checkOut).toLocaleDateString()}</td>
              <td style={td}>{b.status}</td>
              <td style={td}>₹{b.totalAmount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { padding: '10px 12px', fontSize: 13 };
const td = { padding: '10px 12px', fontSize: 13 };