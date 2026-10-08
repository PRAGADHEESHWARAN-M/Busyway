import { Link } from 'react-router-dom';
import { Bus } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center px-4 text-center">
    <Bus className="w-12 h-12 text-forest-400 mb-4" />
    <h1 className="text-2xl font-extrabold text-forest-800 mb-2">Page not found</h1>
    <p className="text-forest-500 mb-6">The page you're looking for doesn't exist.</p>
    <Link to="/" className="px-5 py-2.5 rounded-lg bg-forest-500 text-white font-semibold hover:bg-forest-600">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
