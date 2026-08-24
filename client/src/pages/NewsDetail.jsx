import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageBanner from '../components/PageBanner';
import api from '../api/client';

export default function NewsDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/blog/${slug}`)
      .then(({ data }) => active && setPost(data.data))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) return <div className="container p-tb80 text-center">Loading&hellip;</div>;
  if (error || !post) {
    return (
      <div className="container p-tb80 text-center">
        <p className="text-danger">{error || 'Post not found.'}</p>
        <Link to="/news" className="btn-half site-button button-lg"><span>Back to Blog</span><em /></Link>
      </div>
    );
  }

  return (
    <>
      <PageBanner title={post.title} crumbs={[{ label: 'Blog', to: '/news' }, { label: post.title }]} image="/assets/images/banner/2.jpg" />
      <div className="section-full p-tb80 bg-white">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              {post.coverImage?.url && (
                <img
                  src={post.coverImage.url}
                  alt={post.title}
                  className="m-b30"
                  style={{ width: '100%', borderRadius: 4 }}
                />
              )}
              <div className="wt-post-meta m-b20">
                <ul>
                  <li className="post-author"><i className="fa fa-user" /> By <span>{post.author}</span></li>
                  <li className="post-date">
                    <strong>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</strong>
                  </li>
                </ul>
              </div>
              <div
                className="wt-post-text"
                // Content is authored by our own admins in the CMS, not third-party HTML.
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
