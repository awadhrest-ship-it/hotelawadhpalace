import { useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import api from '../api/client';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get('/gallery')
      .then(({ data }) => active && setItems(data.data))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Initialize the original Magnific Popup lightbox on the gallery grid.
  useEffect(() => {
    const $ = window.jQuery;
    if (!$ || items.length === 0) return undefined;
    const $gallery = $('.mfp-gallery-grid');
    $gallery.magnificPopup({
      delegate: 'a.mfp-link',
      type: 'image',
      gallery: { enabled: true },
    });
    return () => {
      if ($gallery.data('magnificPopup')) $gallery.magnificPopup('close');
    };
  }, [items.length]);

  return (
    <>
      <PageBanner title="Gallery" crumbs={[{ label: 'Gallery' }]} image="/assets/images/banner/3.jpg" />
      <div className="section-full p-tb80 bg-white">
        <div className="container">
          <div className="mfp-gallery-grid row">
            {loading && <p className="text-center w-100">Loading gallery&hellip;</p>}
            {!loading && items.length === 0 && <p className="text-center w-100">No gallery items yet.</p>}
            {items.map((item) => (
              <div className="col-lg-4 col-md-6 m-b30" key={item._id}>
                <a href={item.image.url} className="mfp-link wt-img-effect" title={item.title}>
                  <img src={item.image.url} alt={item.title} style={{ width: '100%', borderRadius: 4 }} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
