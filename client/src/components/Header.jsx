import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const NAV = [
  {
    label: 'Home',
    to: '/',
    children: [{ label: 'Home', to: '/' }],
  },
  {
    label: 'Rooms',
    to: '/rooms',
    children: [{ label: 'All Rooms', to: '/rooms' }],
  },
  {
    label: 'Pages',
    to: '/about',
    children: [
      { label: 'About us', to: '/about' },
      { label: 'Blog', to: '/news' },
      { label: 'Gallery', to: '/gallery' },
      { label: 'Contact us', to: '/contact' },
    ],
  },
  {
    label: 'Contact',
    to: '/contact',
    children: [{ label: 'Contact us', to: '/contact' }],
  },
];

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const headerRef = useRef(null);

  // Sticky header behaviour, ported from the original Waypoint.Sticky call in custom.js
  useEffect(() => {
    const $ = window.jQuery;
    const Waypoint = window.Waypoint;
    if (!$ || !Waypoint || !headerRef.current) return undefined;
    const sticky = new Waypoint.Sticky({ element: $(headerRef.current) });
    return () => {
      if (sticky && sticky.destroy) sticky.destroy();
    };
  }, []);

  const toggleSubmenu = (label) => {
    setOpenSubmenu((prev) => (prev === label ? null : label));
  };

  return (
    <header
      ref={headerRef}
      className={`site-header header-style-1 mobile-sider-drawer-menu nav-wide${
        drawerOpen ? ' active' : ''
      }`}
    >
      <div className="sticky-header main-bar-wraper">
        <div className="main-bar p-t5">
          <div className="container">
            <div className="logo-header">
              <div className="logo-header-inner logo-header-one">
                <Link to="/">
                  <img src="/assets/images/logo-light.png" alt="Sharan Resort & Hotel" />
                </Link>
              </div>
            </div>

            <button
              id="mobile-side-drawer"
              type="button"
              className="navbar-toggler collapsed"
              onClick={() => setDrawerOpen((v) => !v)}
            >
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar icon-bar-first" />
              <span className="icon-bar icon-bar-two" />
              <span className="icon-bar icon-bar-three" />
            </button>

            <div className={`header-nav navbar-collapse collapse${drawerOpen ? ' show' : ''}`}>
              <ul className="nav navbar-nav">
                {NAV.map((item) => (
                  <li
                    key={item.label}
                    className={`has-child${openSubmenu === item.label ? ' nav-active' : ''}`}
                  >
                    <NavLink to={item.to} end={item.to === '/'} onClick={() => setDrawerOpen(false)}>
                      {item.label}
                    </NavLink>
                    <div
                      className="fa fa-angle-right submenu-toogle"
                      onClick={() => toggleSubmenu(item.label)}
                    />
                    <ul
                      className="sub-menu"
                      style={{
                        display:
                          openSubmenu === item.label || window.innerWidth > 991 ? undefined : 'none',
                      }}
                    >
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <NavLink to={child.to} onClick={() => setDrawerOpen(false)}>
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>

            <div className="extra-nav">
              <div className="extra-cell">
                <a
                  href="#search"
                  className="text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    setSearchOpen(true);
                  }}
                >
                  <i className="fa fa-search" />
                </a>
              </div>
            </div>

            <div id="search" className={searchOpen ? 'open' : ''}>
              <span className="close" onClick={() => setSearchOpen(false)} />
              <form
                role="search"
                onSubmit={(e) => e.preventDefault()}
                className="radius-xl"
              >
                <div className="input-group">
                  <input name="q" type="search" placeholder="Type to search" />
                  <span className="input-group-btn">
                    <button type="button" className="search-btn">
                      <i className="fa fa-search" />
                    </button>
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
