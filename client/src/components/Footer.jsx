import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NewsletterForm from './NewsletterForm';
import api from '../api/client';

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get('/settings')
      .then(({ data }) => active && setSettings(data.data))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <footer className="site-footer footer-large footer-dark footer-wide">
      <div className="footer-top overlay-wraper">
        <div className="overlay-main" />
        <div className="container">
          <div className="news-letter-footer">
            <div className="row">
              <div className="col-lg-6 col-md-12">
                <div className="newsletter-f-left">
                  <h3 className="text-uppercase m-t0 m-b10">Subscribe to our newsletter!</h3>
                  <p>Never miss an offer from {settings?.siteName || 'Hotel Awadh Palace'} by signing up to our newsletter.</p>
                </div>
              </div>
              <div className="col-lg-6 col-md-12">
                <div className="newsletter-f-right text-center">
                  <NewsletterForm />
                </div>
              </div>
            </div>
          </div>

          <div className="m-b10">
            <div className="wt-divider bg-gray-dark" />
          </div>

          <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="widget widget_about">
                <div className="logo-footer clearfix p-b15">
                  <Link to="/">
                    <img src="/assets/images/logo-dark.png" alt={settings?.siteName || 'Hotel Awadh Palace'} />
                  </Link>
                </div>
                <p className="max-w400">
                  A hospitality experience built on comfort, warmth, and genuine care for every guest
                  who walks through our doors.
                </p>
                {(() => {
                  const SOCIAL_ICONS = [
                    { key: 'facebook', label: 'Facebook', className: 'fa-brands fa-facebook-f' },
                    { key: 'twitter', label: 'Rss', className: 'fa fa-rss' },
                    { key: 'linkedin', label: 'Linkedin', className: 'fa-brands fa-linkedin-in' },
                    { key: 'instagram', label: 'Instagram', className: 'fa-brands fa-instagram' },
                  ];
                  const activeSocials = SOCIAL_ICONS.filter((s) => settings?.socialLinks?.[s.key]);
                  if (activeSocials.length === 0) return null;
                  return (
                    <ul className="social-icons social-tooltips-outer wt-social-links">
                      {activeSocials.map((s) => (
                        <li key={s.key}>
                          <a href={settings.socialLinks[s.key]} target="_blank" rel="noopener noreferrer" className={s.className}>
                            <span className="social-tooltips">{s.label}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            </div>

            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="widget widget_services inline-links">
                <h3 className="widget-title" style={{ fontWeight: 'normal' }}>Useful links</h3>
                <ul>
                  <li><Link to="/about">About</Link></li>
                  <li><Link to="/gallery">Gallery</Link></li>
                  <li><Link to="/news">Blog</Link></li>
                  <li><Link to="/rooms">Rooms</Link></li>
                  <li><Link to="/contact">Contact Us</Link></li>
                </ul>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="widget widget_services inline-links">
                <h3 className="widget-title" style={{ fontWeight: 'normal' }}>Rooms &amp; Suites</h3>
                <ul>
                  <li><Link to="/rooms">Classic</Link></li>
                  <li><Link to="/rooms">Superior</Link></li>
                  <li><Link to="/rooms">Deluxe</Link></li>
                  <li><Link to="/rooms">Suites</Link></li>
                </ul>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 col-sm-6">
              <div className="widget widget_address_outer">
                <h3 className="widget-title" style={{ fontWeight: 'normal' }}>Contact Us</h3>
                <ul className="widget_address">
                  <li><i className="sl-icon-map site-text-primary" /> {settings?.address || '123 Ocean Drive, Paradise Coast'}</li>
                  <li><i className="sl-icon-envolope-letter site-text-primary" /> {settings?.email || 'info@hotelawadhpalace.test'}</li>
                  <li><i className="sl-icon-phone site-text-primary" /> {settings?.phone || '(+1) 234 567 8900'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom overlay-wraper">
        <div className="overlay-main" />
        <div className="container">
          <div className="row">
            <div className="wt-footer-bot-center">
              <span className="copyrights-text">
                &copy; {new Date().getFullYear()} {settings?.siteName || 'Hotel Awadh Palace'}. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}