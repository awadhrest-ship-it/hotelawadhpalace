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
        <div className="our-gallery">
          <div className="row d-flex justify-content-center">
            {categories.map((category) => (
              <div className="col-lg-4 col-md-6 m-b30" key={category._id}>
                <div className="wt-gallery-arc2">
                  <div className="wt-media">
                    {category.coverImage?.url && (
                      <img src={category.coverImage.url} alt={category.name} style={{ width: '100%', height: 280, objectFit: 'cover' }} />
                    )}
                  </div>
                  <div className="wt-info">
                    <div className="gallery-detail text-center">
                      <h3 className="m-t0">{category.name}</h3>
                      {category.description && <p style={{ color: '#666', fontSize: 14 }}>{category.description}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}