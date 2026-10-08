import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, UserPlus } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  name: '',
  rollNumber: '',
  email: '',
  password: '',
  phone: '',
  department: '',
  year: '',
};

const StudentSignup = () => {
  const [form, setForm] = useState(initialForm);
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
      const { data } = await api.post('/auth/student/signup', form);
      login(data);
      navigate('/student/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text' },
    { name: 'rollNumber', label: 'Roll Number', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone Number', type: 'tel' },
    { name: 'department', label: 'Department', type: 'text' },
    { name: 'year', label: 'Year', type: 'text' },
  ];

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-xl2 shadow-soft border border-khaki-200 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-forest-500 flex items-center justify-center mb-3">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-forest-800">Student Sign Up</h1>
          <p className="text-sm text-forest-400">Create your BUSy Way passenger account</p>
        </div>

        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.name} className={f.name === 'name' ? 'sm:col-span-2' : ''}>
              <label className="block text-sm font-semibold text-forest-700 mb-1">{f.label}</label>
              <input
                type={f.type}
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-khaki-300 focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-forest-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-lg border border-khaki-300 focus:outline-none focus:ring-2 focus:ring-forest-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="sm:col-span-2 w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-forest-500 text-white font-bold hover:bg-forest-600 transition disabled:opacity-60"
          >
            <UserPlus className="w-4 h-4" /> {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-forest-500 mt-6">
          Already have an account?{' '}
          <Link to="/student/login" className="font-semibold text-forest-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StudentSignup;
