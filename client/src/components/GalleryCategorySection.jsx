import { Link } from 'react-router-dom';
import { useOwlCarousel } from '../hooks/useOwlCarousel';

// Featured gallery categories shown on the home page.
// Markup is copied 1:1 from the theme's original "Our Team" section
// (wt-team-arc2 > wt-media / wt-info > team-detail) so this renders with
// the exact same bordered offset-photo card look — just swap photo +
// name + description for the person's name + role.
//
// The hover reveal is also copied from the same place: the theme slides
// "team-social-center" up from the bottom of the photo on hover. We reuse
// that exact element/class so the same CSS transition applies, just with
// a single "View" link (to the Gallery page, filtered to this category)
// instead of social icons.
//
// Cards are shown in an Owl Carousel (same instance/options pattern as the
// "Our Rooms & Suites" carousel on this page) instead of a wrapping grid,
// so no more than 3 cards ever show in a row at once — extra categories
// slide in via the nav arrows instead of dropping to a new line. Nav
// arrows sit vertically centered on the left/right edges of the carousel
// (owl-btn-vertical-center, same treatment as the "About" slider).
function GalleryCarousel({ categories }) {
  const ref = useOwlCarousel(
    {
      loop: categories.length > 3,
      autoplay: true,
      margin: 20,
      nav: true,
      dots: false,
      navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
      responsive: { 0: { items: 1 }, 480: { items: 1 }, 991: { items: 2 }, 1200: { items: 2 }, 1366: { items: 3 } },
    },
    [categories.length]
  );

  return (
    <div ref={ref} className="owl-carousel owl-carousel-filter2 owl-btn-vertical-center gallery-cats-carousel">
      {categories.map((category) => (
        <div className="item" key={category._id}>
          <div className="wt-team-arc2">
            <div className="wt-media">
              {category.coverImage?.url ? (
                <img src={category.coverImage.url} alt={category.name} />
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
                    <Link
                      to={`/gallery?category=${category._id}`}
                      style={{ width: 'auto', padding: '0 18px', display: 'inline-block' }}
                    >
                      View
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="wt-info">
              <div className="team-detail text-center">
                <h3 className="m-t0">{category.name}</h3>
                {category.description && <p>{category.description}</p>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GalleryCategorySection({ categories }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="section-full p-t90 p-b60 bg-white">
      <div className="container">
        <div className="section-head text-left">
          <h2 className="m-b5" data-title="Gallery">Our Gallery</h2>
          <div className="wt-separator-outer">
            <div className="wt-separator site-bg-primary" />
          </div>
        </div>

        <div className="our-team-two">
          <GalleryCarousel categories={categories} />
        </div>
      </div>
    </div>
  );
}