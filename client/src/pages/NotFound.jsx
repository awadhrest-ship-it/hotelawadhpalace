import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="section-full p-tb80 text-center">
      <div className="container">
        <h1 className="font-weight-800">404</h1>
        <p>The page you&rsquo;re looking for doesn&rsquo;t exist.</p>
        <Link to="/" className="btn-half site-button button-lg">
          <span>Back to Home</span><em />
        </Link>
      </div>
    </div>
  );
}
