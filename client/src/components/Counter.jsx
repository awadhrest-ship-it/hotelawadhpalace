import { useEffect, useRef } from 'react';

// Animates 0 -> `number` once this element scrolls into view.
//
// Previously this relied on jQuery Waypoints + counterUp. Waypoints only
// fires on a scroll *crossing* a threshold line — if the section is already
// in the viewport at mount (e.g. a short page, a wide/short window, or the
// browser restoring scroll position on back/forward navigation) no crossing
// ever happens and the counter is left stuck at "0" forever. That's the bug
// reported on the About page's "By The Numbers" section and, intermittently,
// on the homepage "Our Specialization" section.
//
// IntersectionObserver doesn't have that problem: it fires immediately for
// an element that's already visible when observation starts, as well as
// when the element later scrolls into view. It also has no dependency on
// jQuery/Waypoints being loaded yet, removing a timing race entirely.
export default function Counter({ number, label }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const target = Number(number) || 0;
    let animated = false;

    const animate = () => {
      if (animated) return;
      animated = true;
      const duration = 1000;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(progress * target).toString();
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target.toString();
        }
      };

      requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === 'undefined') {
      // Extremely old browsers without IntersectionObserver: just show the
      // final number rather than leaving it stuck at 0.
      animate();
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, [number]);

  return (
    <div className="m-b30 wt-icon-box-wraper">
      <h2 className="site-text-primary m-b5 font-weight-800 counter-box">
        <span className="counter m-r5" data-number={number} ref={ref}>
          0
        </span>
        <b>+</b>
      </h2>
      <h3 className="wt-tilte m-b0 text-white">{label}</h3>
    </div>
  );
}