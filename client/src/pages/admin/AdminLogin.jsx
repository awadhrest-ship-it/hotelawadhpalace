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
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');

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
      <style>{`
        @import url('https://fonts.googleapis.com/css?family=DM+Serif+Text:400,400i&family=Poppins:300,400,500,600,700&display=swap');

        .admin-login-input {
          width: 100%;
          padding: 13px 14px 13px 42px;
          border: 1px solid #333;
          border-radius: 8px;
          font-size: 14px;
          font-family: 'Poppins', sans-serif;
          box-sizing: border-box;
          background: #232323;
          color: #f2f0eb;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .admin-login-input::placeholder { color: #7a7a7a; }
        .admin-login-input:focus {
          border-color: #c9a24b;
          background: #262319;
          box-shadow: 0 0 0 3px rgba(201, 162, 75, 0.18);
        }
        .admin-login-toggle {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #8a8a8a;
          font-size: 12px;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          letter-spacing: 0.03em;
          cursor: pointer;
          padding: 8px 10px;
        }
        .admin-login-toggle:hover { color: #c9a24b; }
        .admin-login-btn {
          width: 100%;
          padding: 14px 12px;
          background: linear-gradient(135deg, #d8b767, #b8863a);
          border: none;
          border-radius: 8px;
          color: #1b1b1b;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 14.5px;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
          box-shadow: 0 8px 20px rgba(201, 162, 75, 0.25);
        }
        .admin-login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(201, 162, 75, 0.35);
        }
        .admin-login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        @keyframes admin-login-spin { to { transform: rotate(360deg); } }
        .admin-login-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(27,27,27,0.35);
          border-top-color: #1b1b1b;
          border-radius: 50%;
          animation: admin-login-spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: -2px;
        }

        @keyframes admin-login-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .admin-login-card { animation: admin-login-fade-in 0.5s ease; }
      `}</style>

      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <form style={styles.card} className="admin-login-card" onSubmit={submit}>
        <div style={styles.crest}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v3c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" stroke="#c9a24b" strokeWidth="1.4" />
            <path d="M12 7v10M8 9.5h8" stroke="#c9a24b" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>

        <h1 style={styles.title}>Awadh Palace</h1>
        <div style={styles.subtitle}>Admin Portal</div>

        {error && (
          <div style={styles.error}>
            <span style={styles.errorDot} />
            {error}
          </div>
        )}

        <label style={styles.label} htmlFor="admin-email">
          Email
        </label>
        <div style={styles.inputWrap}>
          <span style={{ ...styles.icon, color: focused === 'email' ? '#c9a24b' : '#7a7a7a' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18v12H3V6z M3 6l9 7 9-7"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="username"
            placeholder="you@awadhpalace.com"
            className="admin-login-input"
            value={form.email}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused('')}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>

        <label style={styles.label} htmlFor="admin-password">
          Password
        </label>
        <div style={styles.inputWrap}>
          <span style={{ ...styles.icon, color: focused === 'password' ? '#c9a24b' : '#7a7a7a' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </span>
          <input
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="admin-login-input"
            style={{ paddingRight: 64 }}
            value={form.password}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused('')}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <button
            type="button"
            className="admin-login-toggle"
            onClick={() => setShowPassword((s) => !s)}
            tabIndex={-1}
          >
            {showPassword ? 'HIDE' : 'SHOW'}
          </button>
        </div>

        <button type="submit" className="admin-login-btn" style={{ marginTop: 26 }} disabled={loading}>
          {loading && <span className="admin-login-spinner" />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <div style={styles.footerNote}>Authorized personnel only</div>
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
    background: '#141414',
    fontFamily: "'Poppins', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    padding: 20,
    boxSizing: 'border-box',
  },
  bgGlow1: {
    position: 'absolute',
    width: 480,
    height: 480,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(201,162,75,0.14), transparent 70%)',
    top: -160,
    left: -120,
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(201,162,75,0.10), transparent 70%)',
    bottom: -140,
    right: -100,
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    background: '#1b1b1b',
    padding: '40px 36px',
    borderRadius: 16,
    width: 380,
    boxSizing: 'border-box',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,162,75,0.15)',
  },
  crest: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: 'rgba(201,162,75,0.1)',
    border: '1px solid rgba(201,162,75,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 18px',
  },
  title: {
    margin: 0,
    textAlign: 'center',
    fontFamily: "'DM Serif Text', serif",
    fontSize: 30,
    color: '#f5f1e8',
    fontWeight: 400,
    letterSpacing: 0.3,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 12.5,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#c9a24b',
    marginTop: 6,
    marginBottom: 28,
  },
  label: {
    display: 'block',
    fontSize: 12.5,
    fontWeight: 500,
    color: '#a8a8a8',
    margin: '16px 0 7px',
    letterSpacing: 0.2,
  },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  icon: {
    position: 'absolute',
    left: 14,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(192,57,43,0.12)',
    border: '1px solid rgba(192,57,43,0.35)',
    color: '#e57468',
    fontSize: 13,
    padding: '10px 12px',
    borderRadius: 8,
    marginBottom: 4,
  },
  errorDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#e57468',
    flexShrink: 0,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11.5,
    color: '#666',
    marginTop: 22,
    letterSpacing: 0.3,
  },
};