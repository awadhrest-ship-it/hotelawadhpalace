import { useState } from 'react';

const GOLD = '#c9a24b';
const GREY = '#d6d1c6';

// Read-only row of stars, e.g. <StarDisplay value={4} />
export function StarDisplay({ value = 0, size = 18 }) {
  return (
    <span aria-label={`${value} out of 5 stars`} style={{ color: GOLD, fontSize: size, letterSpacing: 2, whiteSpace: 'nowrap' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= value ? GOLD : GREY }}>&#9733;</span>
      ))}
    </span>
  );
}

// Clickable star picker. Tap the same star again to clear (when not required).
export default function StarInput({ value = 0, onChange, size = 30, label }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <span role="radiogroup" aria-label={label} style={{ display: 'inline-flex', gap: 4 }} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(0)}
          onClick={() => onChange(n === value ? 0 : n)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: size,
            lineHeight: 1,
            color: n <= shown ? GOLD : GREY,
            transition: 'transform 120ms ease, color 120ms ease',
            transform: n <= hover ? 'scale(1.12)' : 'scale(1)',
          }}
        >
          &#9733;
        </button>
      ))}
    </span>
  );
}