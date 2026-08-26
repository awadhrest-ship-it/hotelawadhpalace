import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

const NAV = [
  {
    label: 'Home',
    to: '/',
  },
  {
    // Was a "Rooms" link to the standalone /rooms page. Now points at the
    // "Our Rooms & Suites" (id="amenities") section on the home page —
    // scrollTo drives the click handler below instead of a normal route.
    label: 'Amenities',
    scrollTo: 'amenities',
  },
  {
    label: 'Gallery',
    to: '/gallery',
  },
  {
    label: 'Blog',
    to: '/news',
  },
  {
    label: 'Contact',
    to: '/contact',
    children: [
      { label: 'About us', to: '/about' },
      { label: 'Contact us', to: '/contact' },
    ],
  },
];

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const headerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  // Waypoint.Sticky needs to sit on the same element the theme CSS expects
  // (.sticky-header) — not the outer <header> — otherwise `.is-fixed` and
  // `.color-fill` never land where `.header-style-1 .is-fixed.color-fill
  // .main-bar` (the solid background once scrolled) is looking for them.
  const stickyRef = useRef(null);

  // Sticky header behaviour, ported from the original Waypoint.Sticky call in custom.js
  useEffect(() => {
    const $ = window.jQuery;
    const Waypoint = window.Waypoint;
    if (!$ || !Waypoint || !stickyRef.current) return undefined;
    const sticky = new Waypoint.Sticky({ element: $(stickyRef.current) });
    return () => {
      if (sticky && sticky.destroy) sticky.destroy();
    };
  }, []);

  // Solid header background once scrolled, ported from color_fill_header()
  // in custom.js (it toggled `.color-fill` on whatever held `.is-fixed`).
  useEffect(() => {
    const onScroll = () => {
      if (!stickyRef.current) return;
      stickyRef.current.classList.toggle('color-fill', window.scrollY >= 100);
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleSubmenu = (label) => {
    setOpenSubmenu((prev) => (prev === label ? null : label));
  };

  // Shared by any nav item with a "scrollTo" id instead of a real route:
  // scroll straight there if we're already on the home page, otherwise
  // navigate home and let Home's own effect finish the scroll once the
  // section has mounted.
  const handleScrollNavClick = (item, e) => {
    e.preventDefault();
    setDrawerOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(item.scrollTo);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: item.scrollTo } });
    }
  };

  return (
    <header
      ref={headerRef}
      className={`site-header header-style-1 mobile-sider-drawer-menu nav-wide${
        drawerOpen ? ' active' : ''
      }`}
    >
      <div ref={stickyRef} className="sticky-header main-bar-wraper">
        <div className="main-bar p-t5">
          <div className="container">
            <div className="logo-header">
              <div className="logo-header-inner logo-header-one">
                <Link to="/">
                  <img src="/assets/images/logo-light.png" alt="Hotel Awadh Palace" />
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
                    className={
                      item.children
                        ? `has-child${openSubmenu === item.label ? ' nav-active' : ''}`
                        : undefined
                    }
                  >
                    {item.scrollTo ? (
                      <a href={`#${item.scrollTo}`} onClick={(e) => handleScrollNavClick(item, e)}>
                        {item.label}
                      </a>
                    ) : (
                      <NavLink to={item.to} end={item.to === '/'} onClick={() => setDrawerOpen(false)}>
                        {item.label}
                      </NavLink>
                    )}
                    {item.children && (
                      <>
                        <div
                          className="fa fa-angle-right submenu-toogle"
                          onClick={() => toggleSubmenu(item.label)}
                        />
                        <ul
                          className="sub-menu"
                          style={{
                            display:
                              openSubmenu === item.label || window.innerWidth > 991
                                ? undefined
                                : 'none',
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
                      </>
                    )}
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