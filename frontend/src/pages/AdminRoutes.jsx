import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const emptyForm = { name: '', startingPoint: '', destination: '' };

const AdminRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchRoutes = useCallback(async () => {
    try {
      const { data } = await api.get('/routes');
      setRoutes(data.routes);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (route) => {
    setForm({ name: route.name, startingPoint: route.startingPoint, destination: route.destination });
    setEditingId(route._id);
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editingId) {
        await api.put(`/admin/routes/${editingId}`, form);
      } else {
        await api.post('/admin/routes', form);
      }
      setShowForm(false);
      fetchRoutes();
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this route and all of its stops?')) return;
    try {
      await api.delete(`/admin/routes/${id}`);
      fetchRoutes();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (loading) return <Loader label="Loading routes..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchRoutes} />;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-forest-800">Route Management</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest-500 text-white font-semibold hover:bg-forest-600"
        >
          <Plus className="w-4 h-4" /> Add Route
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {routes.map((route) => (
          <div key={route._id} className="bg-white rounded-xl2 shadow-card border border-khaki-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-forest-800">{route.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => openEdit(route)} className="p-1.5 rounded-lg hover:bg-khaki-100 text-forest-600">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(route._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-forest-500">
              <span className="font-semibold text-forest-700">From:</span> {route.startingPoint}
            </p>
            <p className="text-sm text-forest-500">
              <span className="font-semibold text-forest-700">To:</span> {route.destination}
            </p>
          </div>
        ))}
        {routes.length === 0 && (
          <p className="text-forest-400 text-sm col-span-2 py-8 text-center">No routes yet. Click "Add Route" to create one.</p>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-forest-800/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-xl2 shadow-soft w-full max-w-md p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-forest-400">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-lg text-forest-800 mb-4">{editingId ? 'Edit Route' : 'Add Route'}</h2>
            {formError && <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Route Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-khaki-300"
              />
              <input
                required
                placeholder="Starting Point"
                value={form.startingPoint}
                onChange={(e) => setForm({ ...form, startingPoint: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-khaki-300"
              />
              <input
                required
                placeholder="Destination"
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-khaki-300"
              />
              <button type="submit" className="w-full py-2.5 rounded-lg bg-forest-500 text-white font-bold hover:bg-forest-600">
                {editingId ? 'Save Changes' : 'Create Route'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoutes;
