import { Link } from 'react-router-dom';

export default function PageBanner({ title, crumbs = [], image = '/assets/images/banner/4.jpg' }) {
  return (
    <div
      className="wt-bnr-inr overlay-wraper bg-parallax bg-top-center"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="overlay-main bg-black opacity-07" />
      <div className="container">
        <div className="wt-bnr-inr-entry">
          <div className="banner-title-outer">
            <div className="banner-title-name">
              <h2 className="text-white font-80 font-weight-900">{title}</h2>
            </div>
          </div>
          <div>
            <ul className="wt-breadcrumb breadcrumb-style-2">
              <li><Link to="/">Home</Link></li>
              {crumbs.map((c, i) => (
                <li key={c.label}>
                  {i === crumbs.length - 1 || !c.to ? c.label : <Link to={c.to}>{c.label}</Link>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
