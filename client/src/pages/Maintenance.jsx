import { useEffect, useMemo, useState } from 'react';
import './maintenance.css';

/**
 * ---------------------------------------------------------------------
 *  MAINTENANCE MODE — edit the line below to set the expected return.
 *  Format: 'YYYY-MM-DDTHH:MM:SS+05:30'  (+05:30 = India Standard Time)
 * ---------------------------------------------------------------------
 */
const EXPECTED_BACK_ONLINE = '2026-09-04T15:15:00+05:30';

function getRemaining(targetISO) {
  const total = new Date(targetISO).getTime() - Date.now();
  const clamped = Math.max(total, 0);
  return {
    total: clamped,
    days: Math.floor(clamped / (1000 * 60 * 60 * 24)),
    hours: Math.floor((clamped / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((clamped / (1000 * 60)) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  };
}

export default function Maintenance() {
  const [remaining, setRemaining] = useState(() => getRemaining(EXPECTED_BACK_ONLINE));

  useEffect(() => {
    document.title = 'Under Maintenance | Hotel Awadh Palace';
    const timer = setInterval(() => {
      setRemaining(getRemaining(EXPECTED_BACK_ONLINE));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isDue = remaining.total <= 0;

  const targetLabel = useMemo(() => {
    try {
      return new Date(EXPECTED_BACK_ONLINE).toLocaleString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return null;
    }
  }, []);

  const units = [
    { label: 'Days', value: remaining.days },
    { label: 'Hours', value: remaining.hours },
    { label: 'Minutes', value: remaining.minutes },
    { label: 'Seconds', value: remaining.seconds },
  ];

  return (
    <div className="maint-page">
      <div className="maint-veil" />

      <div className="maint-arch">
        <div className="maint-arch-inner">
          <img
            src="/assets/images/logo-dark.png"
            alt="Hotel Awadh Palace"
            className="maint-logo"
          />

          <div className="maint-rule" />

          <h1 className="maint-heading">We&rsquo;re Refining Your Experience</h1>
          <p className="maint-copy">
            Our website has stepped away for a short while for scheduled
            maintenance. The hotel and every reservation continue exactly as
            usual &mdash; only this page is resting.
          </p>

          {!isDue ? (
            <>
              <p className="maint-countdown-label">
                {targetLabel ? <>Expected back online &mdash; {targetLabel}</> : 'Expected back online shortly'}
              </p>
              <div className="maint-countdown" role="timer" aria-live="polite">
                {units.map((u, i) => (
                  <div className="maint-unit-group" key={u.label}>
                    <div className="maint-unit">
                      <span className="maint-unit-value">{String(u.value).padStart(2, '0')}</span>
                      <span className="maint-unit-label">{u.label}</span>
                    </div>
                    {i < units.length - 1 && <span className="maint-sep">&middot;</span>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="maint-countdown-label maint-due">
              We&rsquo;re just putting on the finishing touches &mdash; back with you any moment now.
            </p>
          )}

          <div className="maint-rule maint-rule-small" />
          <p className="maint-footnote">Thank you for your patience.</p>
        </div>
      </div>
    </div>
  );
}