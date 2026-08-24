import { useEffect, useState } from 'react';

export default function Loader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHidden(true), 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="loading-area" style={hidden ? { display: 'none' } : undefined}>
      <div className="loading-box" />
      <div className="loading-pic">
        <div className="cssload-thecube">
          <div className="cssload-cube cssload-c1" />
          <div className="cssload-cube cssload-c2" />
          <div className="cssload-cube cssload-c4" />
          <div className="cssload-cube cssload-c3" />
        </div>
      </div>
    </div>
  );
}
