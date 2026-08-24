import { useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import ContactForm from '../components/ContactForm';
import api from '../api/client';

export default function Contact() {
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
    <>
      <PageBanner title="Contact Us" crumbs={[{ label: 'Contact Us' }]} image="/assets/images/banner/4.jpg" />

      <div className="section-full p-tb80">
        <div className="container">
          <div className="section-content">
            <div className="row">
              <div className="col-lg-4 col-md-6">
                <div className="contact-info text-black m-b30">
                  <div className="section-head text-left">
                    <h2 className="m-b5">Contact Info</h2>
                  </div>

                  <div className="wt-icon-box-wraper left p-b40">
                    <div className="icon-xs"><i className="fa fa-phone" /></div>
                    <div className="icon-content">
                      <h3 className="m-t0 font-weight-500">Phone number</h3>
                      <p>{settings?.phone || '+1 234 567 8900'}</p>
                    </div>
                  </div>

                  <div className="wt-icon-box-wraper left p-b40">
                    <div className="icon-xs"><i className="fa fa-envelope" /></div>
                    <div className="icon-content">
                      <h3 className="m-t0 font-weight-500">Email address</h3>
                      <p>{settings?.email || 'info@sharanresort.test'}</p>
                    </div>
                  </div>

                  <div className="wt-icon-box-wraper left">
                    <div className="icon-xs"><i className="fa fa-map-marker" /></div>
                    <div className="icon-content">
                      <h3 className="m-t0 font-weight-500">Address info</h3>
                      <p>{settings?.address || '123 Ocean Drive, Paradise Coast'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-8 col-md-6">
                <ContactForm />
              </div>
            </div>
          </div>

          <div className="gmap-outline">
            <div className="google-map-gray google-map">
              <iframe
                title="Sharan Resort & Hotel location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387191.33750346623!2d-73.97968099999999!3d40.6974881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1671883239943!5m2!1sen!2sin"
                width="600"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
