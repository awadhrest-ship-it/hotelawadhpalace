import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageBanner from '../components/PageBanner';
import api from '../api/client';

export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null);
  // Admin > Settings > Page Banner Images ("Gallery").
  const [pageBanner, setPageBanner] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get('/settings')
      .then(({ data }) => active && setPageBanner(data.data?.pageBanners?.gallery))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/gallery-categories'),
      api.get('/gallery')
    ])
      .then(([categoriesRes, itemsRes]) => {
        if (active) {
          const loadedCategories = categoriesRes.data.data;
          setCategories(loadedCategories);
          setAllItems(itemsRes.data.data);

          // Only pre-select a category if the URL asked for a real one
          // (e.g. the "View" link from the home page gallery cards).
          // Otherwise land on the category picker, not a random category.
          const requested = searchParams.get('category');
          const requestedIsValid = requested && loadedCategories.some((c) => c._id === requested);
          if (requestedIsValid) {
            setSelectedCategory(requested);
          }
        }
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize the original Magnific Popup lightbox on the gallery grid.
  useEffect(() => {
    const $ = window.jQuery;
    if (!$ || allItems.length === 0 || !selectedCategory) return undefined;
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

  const selectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchParams(categoryId ? { category: categoryId } : {});
  };

  const activeCategory = categories.find((c) => c._id === selectedCategory) || null;
  const filteredItems = selectedCategory
    ? allItems.filter((item) => item.category === selectedCategory)
    : [];

  return (
    <>
      <PageBanner title="Gallery" crumbs={[{ label: 'Gallery' }]} image={pageBanner?.url || '/assets/images/banner/3.jpg'} />
      <div className="section-full p-tb80 bg-white">
        <div className="container">
          {loading && <p className="text-center w-100">Loading gallery&hellip;</p>}

          {!loading && !selectedCategory && (
            <>
              {categories.length === 0 ? (
                <p className="text-center w-100">No gallery categories yet.</p>
              ) : (
                <div className="our-team-two">
                  <div className="row d-flex justify-content-center">
                    {categories.map((cat) => (
                      <div className="col-lg-4 col-md-6 m-b30" key={cat._id}>
                        <div
                          className="wt-team-arc2"
                          onClick={() => selectCategory(cat._id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="wt-media">
                            {cat.coverImage?.url ? (
                              <img src={cat.coverImage.url} alt={cat.name} />
                            ) : (
                              <div
                                style={{
                                  width: 350,
                                  maxWidth: '100%',
                                  height: 350,
                                  background: '#f0ece2',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#aaa',
                                  fontSize: 13,
                                }}
                              >
                                No cover photo
                              </div>
                            )}

                            <div className="team-social-center">
                              <ul className="team-social-icon">
                                <li>
                                  <span style={{ width: 'auto', padding: '0 18px', display: 'inline-block', cursor: 'pointer' }}>
                                    View
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className="wt-info">
                            <div className="team-detail text-center">
                              <h3 className="m-t0">{cat.name}</h3>
                              {cat.description && <p>{cat.description}</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && selectedCategory && (
            <>
              <div style={{ marginBottom: 30, textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => selectCategory(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#c9a24b',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginBottom: 16,
                  }}
                >
                  &larr; All Categories
                </button>
                <h3 style={{ margin: 0 }}>{activeCategory?.name}</h3>

                {categories.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 }}>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        type="button"
                        onClick={() => selectCategory(cat._id)}
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
                )}
              </div>

              <div className="mfp-gallery-grid row">
                {filteredItems.length === 0 && <p className="text-center w-100">No images in this category yet.</p>}
                {filteredItems.map((item) => (
                  <div className="col-lg-4 col-md-6 m-b30" key={item._id}>
                    <a href={item.image.url} className="mfp-link wt-img-effect" title={item.title}>
                      <img src={item.image.url} alt={item.title} style={{ width: '100%', borderRadius: 4 }} />
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}