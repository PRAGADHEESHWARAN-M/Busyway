import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bus, LayoutDashboard, Route as RouteIcon, MapPin, Users, Radio, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Layout for authenticated admin pages: persistent sidebar with all
// management sections.
const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/buses', label: 'Buses', icon: Bus },
    { to: '/admin/routes', label: 'Routes', icon: RouteIcon },
    { to: '/admin/stops', label: 'Stops', icon: MapPin },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/tracking', label: 'Live Tracking', icon: Radio },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col md:flex-row">
      <aside className="hidden md:flex md:flex-col w-64 bg-forest-700 text-cream-50 p-6 shrink-0">
        <div className="flex items-center gap-2 mb-10">
          <Bus className="w-6 h-6" />
          <span className="font-extrabold text-lg">BUSy Way</span>
          <span className="text-[10px] bg-orange-500 px-1.5 py-0.5 rounded font-bold ml-auto">ADMIN</span>
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

      <header className="md:hidden flex items-center justify-between bg-forest-700 text-cream-50 px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Bus className="w-5 h-5" />
          <span className="font-bold">BUSy Way Admin</span>
        </div>
        <button onClick={handleLogout} className="text-red-300">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <nav className="md:hidden flex overflow-x-auto gap-2 px-3 py-2 bg-forest-600 sticky top-[52px] z-20">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold ${
                isActive ? 'bg-white text-forest-700' : 'text-khaki-100'
              }`
            }
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
