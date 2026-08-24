import { useEffect, useRef } from 'react';

export default function Counter({ number, label }) {
  const ref = useRef(null);

  useEffect(() => {
    const $ = window.jQuery;
    if (!$ || !ref.current) return undefined;
    const $el = $(ref.current);
    if (window.Waypoint) {
      // eslint-disable-next-line no-new
      const wp = new window.Waypoint({
        element: ref.current,
        handler() {
          $el.counterUp({ delay: 10, time: 1000 });
          this.destroy();
        },
        offset: 'bottom-in-view',
      });
      return () => wp.destroy && wp.destroy();
    }
    return undefined;
  }, []);

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
