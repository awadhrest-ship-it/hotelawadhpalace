import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/hero', label: 'Hero Images' },
  { to: '/admin/rooms', label: 'Rooms' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/enquiries', label: 'Enquiries' },
  { to: '/admin/blog', label: 'Blog Posts' },
  { to: '/admin/gallery', label: 'Gallery' },
  { to: '/admin/testimonials', label: 'Testimonials' },
  { to: '/admin/specialization', label: 'Specialization' },
  { to: '/admin/services', label: 'Services' },
  { to: '/admin/partners', label: 'Partners' },
  { to: '/admin/team', label: 'Team' },
  { to: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout() {
  const { admin, loading, logout } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 40, fontFamily: 'sans-serif' }}>Loading&hellip;</div>;
  }

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <style>{`
        .admin-sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .admin-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .admin-sidebar-scroll::-webkit-scrollbar-thumb { background: #4a4a4a; border-radius: 3px; }
        .admin-sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #c9a24b; }
        .admin-sidebar-scroll { scrollbar-width: thin; scrollbar-color: #4a4a4a transparent; }

        .admin-main-scroll::-webkit-scrollbar { width: 8px; }
        .admin-main-scroll::-webkit-scrollbar-track { background: transparent; }
        .admin-main-scroll::-webkit-scrollbar-thumb { background: #d8d2c4; border-radius: 4px; }
        .admin-main-scroll::-webkit-scrollbar-thumb:hover { background: #c9a24b; }
        .admin-main-scroll { scrollbar-width: thin; scrollbar-color: #d8d2c4 transparent; }
      `}</style>
      <aside style={styles.sidebar} className="admin-sidebar-scroll">
        <div style={styles.brand}>Awadh Palace Admin</div>
        <nav>
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div style={styles.userBox}>
          <div style={{ fontSize: 13, opacity: 0.8 }}>{admin.name}</div>
          <button type="button" style={styles.logoutBtn} onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main style={styles.main} className="admin-main-scroll">
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  sidebar: {
    width: 220,
    flexShrink: 0,
    height: '100vh',
    position: 'sticky',
    top: 0,
    background: '#1b1b1b',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    overflowY: 'auto',
  },
  brand: { fontSize: 18, fontWeight: 700, padding: '0 20px 20px' },
  navLink: {
    display: 'block',
    padding: '10px 20px',
    color: '#ccc',
    textDecoration: 'none',
    fontSize: 14,
  },
  navLinkActive: { background: '#c9a24b', color: '#fff' },
  userBox: { marginTop: 'auto', padding: '20px' },
  logoutBtn: {
    marginTop: 8,
    background: 'transparent',
    border: '1px solid #555',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 13,
  },
  main: { flex: 1, height: '100vh', background: '#f5f5f5', padding: 30, overflowY: 'auto', boxSizing: 'border-box' },
};