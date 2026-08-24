import { Link } from 'react-router-dom';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const day = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  const year = d.getFullYear();
  return { day, year };
}

export default function NewsCard({ post }) {
  const { day, year } = formatDate(post.publishedAt || post.createdAt);
  return (
    <div className="masonry-item col-lg-4 col-md-6 col-sm-6 m-b30">
      <div className="wt-img-effect">
        <img src={post.coverImage?.url || '/assets/images/blog/pic1.jpg'} alt={post.title} />
      </div>
      <div className="p-a20 bg-white">
        <div className="wt-post-info">
          <div className="wt-post-meta">
            <ul>
              <li className="post-date"><strong>{day}</strong> <span>{year}</span></li>
              <li className="post-author"><i className="fa fa-user" /> By <span>{post.author}</span></li>
            </ul>
          </div>
          <div className="wt-post-title">
            <h3 className="post-title">
              <Link to={`/news/${post.slug}`} className="m-t0">{post.title}</Link>
            </h3>
          </div>
          <div className="wt-post-text">
            <p>{post.excerpt}</p>
          </div>
          <Link to={`/news/${post.slug}`} className="btn-half site-button button-md m-b15">
            <span>Read More</span><em />
          </Link>
        </div>
      </div>
    </div>
  );
}
