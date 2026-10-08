import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bus, LayoutDashboard, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Layout for authenticated student pages: top bar + bottom mobile nav /
// left sidebar on larger screens.
const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/track', label: 'Live Map', icon: MapPin },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:flex-col w-64 bg-forest-700 text-cream-50 p-6 shrink-0">
        <div className="flex items-center gap-2 mb-10">
          <Bus className="w-6 h-6" />
          <span className="font-extrabold text-lg">BUSy Way</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                  isActive ? 'bg-forest-500 text-white' : 'text-khaki-200 hover:bg-forest-600'
                }`
              }
            >
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="pt-4 border-t border-forest-600">
          <p className="text-xs text-khaki-200 mb-2">Signed in as</p>
          <p className="text-sm font-semibold truncate">{user?.name}</p>
          <button onClick={handleLogout} className="mt-4 flex items-center gap-2 text-sm text-red-300 hover:text-red-200">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between bg-forest-700 text-cream-50 px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Bus className="w-5 h-5" />
          <span className="font-bold">BUSy Way</span>
        </div>
        <button onClick={handleLogout} className="text-red-300">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-khaki-200 flex justify-around py-2 z-30">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1 text-xs font-semibold ${
                isActive ? 'text-forest-600' : 'text-forest-300'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default StudentLayout;
