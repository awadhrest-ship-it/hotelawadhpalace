import { useEffect, useState } from 'react';
import PageBanner from '../components/PageBanner';
import NewsCard from '../components/NewsCard';
import api from '../api/client';

export default function News() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get('/blog')
      .then(({ data }) => active && setPosts(data.data))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageBanner title="Our Blog" crumbs={[{ label: 'Blog' }]} image="/assets/images/banner/2.jpg" />
      <div className="section-full p-tb80 bg-white">
        <div className="container">
          <div className="portfolio-wrap news-grid clearfix">
            <div className="row">
              {loading && <p className="text-center w-100">Loading posts&hellip;</p>}
              {!loading && posts.length === 0 && (
                <p className="text-center w-100">No blog posts published yet.</p>
              )}
              {posts.map((post) => (
                <NewsCard key={post._id} post={post} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
