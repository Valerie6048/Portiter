import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="detail-page">
      <div className="container detail-container">
        <p className="detail-badge">404</p>
        <h1 className="detail-title">Page not found</h1>
        <p className="detail-subtitle">The page you requested does not exist.</p>
        <Link to="/" className="btn-primary">Back to portfolio</Link>
      </div>
    </main>
  );
}
