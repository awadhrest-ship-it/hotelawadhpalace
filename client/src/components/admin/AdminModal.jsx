// Simple popup dialog used by admin forms (Add/Edit Category, Add Image, etc.)
// Click the dark overlay or the × to close. Doesn't close on outside click while
// something is uploading, so people don't lose an in-progress submission.
export default function AdminModal({ title, onClose, children, closable = true }) {
  return (
    <div
      style={overlay}
      onClick={() => closable && onClose()}
    >
      <div style={box} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
          {closable && (
            <button type="button" onClick={onClose} style={closeBtn} aria-label="Close">
              ×
            </button>
          )}
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 16,
};

const box = {
  background: '#fff',
  borderRadius: 8,
  width: '100%',
  maxWidth: 460,
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
};

const header = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderBottom: '1px solid #eee',
};

const closeBtn = {
  background: 'transparent',
  border: 'none',
  fontSize: 22,
  lineHeight: 1,
  cursor: 'pointer',
  color: '#999',
  padding: 4,
};