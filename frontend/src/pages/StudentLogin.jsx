import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, LogIn } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StudentLogin = () => {
  const [form, setForm] = useState({ identifier: '', password: '' });
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
      const { data } = await api.post('/auth/student/login', form);
      login(data);
      navigate('/student/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl2 shadow-soft border border-khaki-200 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-forest-500 flex items-center justify-center mb-3">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-forest-800">Student Login</h1>
          <p className="text-sm text-forest-400">Track your bus and stay updated</p>
        </div>

        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-1">Roll Number or Email</label>
            <input
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-khaki-300 focus:outline-none focus:ring-2 focus:ring-forest-400"
              placeholder="CSE2023001 or you@college.edu"
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
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-forest-500 text-white font-bold hover:bg-forest-600 transition disabled:opacity-60"
          >
            <LogIn className="w-4 h-4" /> {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-forest-500 mt-6">
          New student?{' '}
          <Link to="/student/signup" className="font-semibold text-forest-700 hover:underline">
            Create an account
          </Link>
        </p>
        <p className="text-center text-xs text-forest-300 mt-3">
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;
