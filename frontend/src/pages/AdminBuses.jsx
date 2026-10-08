import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const emptyForm = { busNumber: '', busName: '', registrationNumber: '', route: '', status: 'active' };

const AdminBuses = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = useCallback(async () => {
    try {
      const [{ data: busData }, { data: routeData }] = await Promise.all([api.get('/buses'), api.get('/routes')]);
      setBuses(busData.buses);
      setRoutes(routeData.routes);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (bus) => {
    setForm({
      busNumber: bus.busNumber,
      busName: bus.busName,
      registrationNumber: bus.registrationNumber,
      route: bus.route?._id || bus.route || '',
      status: bus.status,
    });
    setEditingId(bus._id);
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingId) {
        await api.put(`/admin/buses/${editingId}`, form);
      } else {
        await api.post('/admin/buses', form);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bus? This also removes its location history.')) return;
    try {
      await api.delete(`/admin/buses/${id}`);
      fetchData();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (loading) return <Loader label="Loading buses..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-forest-800">Bus Management</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest-500 text-white font-semibold hover:bg-forest-600"
        >
          <Plus className="w-4 h-4" /> Add Bus
        </button>
      </div>

      <div className="bg-white rounded-xl2 shadow-card border border-khaki-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-forest-400 border-b border-khaki-200">
              <th className="py-3 px-4">Bus Number</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Registration</th>
              <th className="py-3 px-4">Route</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr key={bus._id} className="border-b border-khaki-100 last:border-0">
                <td className="py-3 px-4 font-bold text-forest-800">{bus.busNumber}</td>
                <td className="py-3 px-4">{bus.busName}</td>
                <td className="py-3 px-4">{bus.registrationNumber}</td>
                <td className="py-3 px-4">{bus.route?.name || '—'}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      bus.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {bus.status}
                  </span>
                </td>
                <td className="py-3 px-4 flex gap-2 justify-end">
                  <button onClick={() => openEdit(bus)} className="p-1.5 rounded-lg hover:bg-khaki-100 text-forest-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(bus._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {buses.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-forest-400">
                  No buses yet. Click "Add Bus" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-forest-800/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-xl2 shadow-soft w-full max-w-md p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-forest-400">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-lg text-forest-800 mb-4">{editingId ? 'Edit Bus' : 'Add Bus'}</h2>
            {formError && <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Bus Number (e.g. BUS-01)"
                value={form.busNumber}
                onChange={(e) => setForm({ ...form, busNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-khaki-300"
              />
              <input
                required
                placeholder="Bus Name"
                value={form.busName}
                onChange={(e) => setForm({ ...form, busName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-khaki-300"
              />
              <input
                required
                placeholder="Registration Number"
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-khaki-300"
              />
              <select
                value={form.route}
                onChange={(e) => setForm({ ...form, route: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-khaki-300"
              >
                <option value="">No route assigned</option>
                {routes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-khaki-300"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button type="submit" className="w-full py-2.5 rounded-lg bg-forest-500 text-white font-bold hover:bg-forest-600">
                {editingId ? 'Save Changes' : 'Create Bus'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBuses;
