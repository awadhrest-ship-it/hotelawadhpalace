import { useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import api from '../api/client';

export default function Gallery() {
  const [categories, setCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/gallery-categories'),
      api.get('/gallery')
    ])
      .then(([categoriesRes, itemsRes]) => {
        if (active) {
          setCategories(categoriesRes.data.data);
          setAllItems(itemsRes.data.data);
          if (categoriesRes.data.data.length > 0) {
            setSelectedCategory(categoriesRes.data.data[0]._id);
          }
        }
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    
    return () => {
      active = false;
    };
  }, []);

  // Initialize the original Magnific Popup lightbox on the gallery grid.
  useEffect(() => {
    const $ = window.jQuery;
    if (!$ || allItems.length === 0) return undefined;
    const $gallery = $('.mfp-gallery-grid');
    if ($gallery.data('magnificPopup')) {
      $gallery.magnificPopup('close');
    }
    $gallery.magnificPopup({
      delegate: 'a.mfp-link',
      type: 'image',
      gallery: { enabled: true },
    });
    return () => {
      if ($gallery.data('magnificPopup')) $gallery.magnificPopup('close');
    };
  }, [allItems.length, selectedCategory]);

  // Filter items by selected category
  const filteredItems = selectedCategory 
    ? allItems.filter(item => item.category === selectedCategory)
    : [];

  return (
    <>
      <PageBanner title="Gallery" crumbs={[{ label: 'Gallery' }]} image="/assets/images/banner/3.jpg" />
      <div className="section-full p-tb80 bg-white">
        <div className="container">
          {/* CATEGORY TABS */}
          {categories.length > 0 && (
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => setSelectedCategory(cat._id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 4,
                      border: 'none',
                      background: selectedCategory === cat._id ? '#c9a24b' : '#f0f0f0',
                      color: selectedCategory === cat._id ? '#fff' : '#333',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: selectedCategory === cat._id ? 600 : 400,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GALLERY GRID */}
          <div className="mfp-gallery-grid row">
            {loading && <p className="text-center w-100">Loading gallery&hellip;</p>}
            {!loading && filteredItems.length === 0 && <p className="text-center w-100">No images in this category yet.</p>}
            {filteredItems.map((item) => (
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