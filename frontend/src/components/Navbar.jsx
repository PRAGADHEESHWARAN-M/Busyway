import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Top navigation shown on the public landing page. Student/admin dashboards
// use their own layouts (StudentLayout / AdminLayout) instead.
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-cream-50/90 backdrop-blur border-b border-khaki-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-forest-500 flex items-center justify-center">
            <Bus className="w-5 h-5 text-cream-50" />
          </div>
          <span className="font-extrabold text-lg text-forest-700 tracking-tight">BUSy Way</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {!isAuthenticated && (
            <>
              <Link to="/track" className="px-4 py-2 text-sm font-semibold text-forest-700 hover:text-forest-500 transition">
                Track Bus
              </Link>
              <Link to="/student/login" className="px-4 py-2 text-sm font-semibold text-forest-700 hover:text-forest-500 transition">
                Student Login
              </Link>
              <Link
                to="/admin/login"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-forest-500 text-white hover:bg-forest-600 transition shadow-soft"
              >
                Admin Login
              </Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <Link
                to={role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                className="px-4 py-2 text-sm font-semibold text-forest-700 hover:text-forest-500 transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-forest-500 text-white hover:bg-forest-600 transition"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          )}
        </nav>

        <button className="md:hidden p-2 text-forest-700" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-2 border-t border-khaki-200 bg-cream-50">
          {!isAuthenticated && (
            <>
              <Link to="/track" onClick={() => setOpen(false)} className="py-2 text-sm font-semibold text-forest-700">
                Track Bus
              </Link>
              <Link to="/student/login" onClick={() => setOpen(false)} className="py-2 text-sm font-semibold text-forest-700">
                Student Login
              </Link>
              <Link to="/admin/login" onClick={() => setOpen(false)} className="py-2 text-sm font-semibold text-forest-700">
                Admin Login
              </Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <Link
                to={role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-semibold text-forest-700"
              >
                Dashboard
              </Link>
              <button onClick={handleLogout} className="py-2 text-sm font-semibold text-left text-red-600">
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
