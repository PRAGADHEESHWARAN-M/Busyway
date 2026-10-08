import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin/login', form);
      login(data);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl2 shadow-soft p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-forest-800">Admin Login</h1>
          <p className="text-sm text-forest-400">Restricted access - transportation control panel</p>
        </div>

        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-1">Admin Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-khaki-300 focus:outline-none focus:ring-2 focus:ring-forest-400"
              placeholder="admin@busyway.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-khaki-300 focus:outline-none focus:ring-2 focus:ring-forest-400"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-forest-700 text-white font-bold hover:bg-forest-800 transition disabled:opacity-60"
          >
            <LogIn className="w-4 h-4" /> {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-xs text-forest-300 mt-6">
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
