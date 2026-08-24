import { useEffect, useState } from 'react';

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 900);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className="scroltop"
      style={{ display: visible ? 'block' : 'none' }}
      onClick={scrollTop}
      aria-label="Scroll to top"
    >
      <span className="fa fa-angle-up relative" id="btn-vibrate" />
    </button>
  );
}
