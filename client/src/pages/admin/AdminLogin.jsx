import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/admin';

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <form style={styles.card} onSubmit={submit}>
        <h2 style={{ marginTop: 0 }}>Awadh Palace Admin</h2>
        {error && <p style={styles.error}>{error}</p>}
        <label style={styles.label}>Email</label>
        <input
          type="email"
          required
          style={styles.input}
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <label style={styles.label}>Password</label>
        <input
          type="password"
          required
          style={styles.input}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1b1b1b',
    fontFamily: 'sans-serif',
  },
  card: {
    background: '#fff',
    padding: 32,
    borderRadius: 8,
    width: 340,
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
  },
  label: { display: 'block', fontSize: 13, fontWeight: 600, margin: '14px 0 6px' },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: 4,
    fontSize: 14,
    boxSizing: 'border-box',
  },
  button: {
    marginTop: 20,
    width: '100%',
    padding: '10px 12px',
    background: '#c9a24b',
    border: 'none',
    borderRadius: 4,
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: { color: '#c0392b', fontSize: 13 },
};