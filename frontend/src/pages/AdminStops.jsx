import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const emptyForm = { name: '', latitude: '', longitude: '', route: '' };

// Admin can add/remove stops for a route and reorder them (moves the stop
// up/down, then persists all orders via /admin/stops/reorder).
const AdminStops = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchRoutes = useCallback(async () => {
    try {
      const { data } = await api.get('/routes');
      setRoutes(data.routes);
      if (data.routes.length && !selectedRoute) setSelectedRoute(data.routes[0]._id);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedRoute]);

  const fetchStops = useCallback(async (routeId) => {
    if (!routeId) return setStops([]);
    try {
      const { data } = await api.get(`/stops?route=${routeId}`);
      setStops(data.stops);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchStops(selectedRoute);
  }, [selectedRoute, fetchStops]);

  const openCreate = () => {
    setForm({ ...emptyForm, route: selectedRoute });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/admin/stops', {
        name: form.name,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        order: stops.length + 1,
        route: form.route,
      });
      setShowForm(false);
      fetchStops(selectedRoute);
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this stop?')) return;
    try {
      await api.delete(`/admin/stops/${id}`);
      fetchStops(selectedRoute);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const move = async (index, direction) => {
    const newStops = [...stops];
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= newStops.length) return;
    [newStops[index], newStops[swapWith]] = [newStops[swapWith], newStops[index]];
    setStops(newStops);
    try {
      await api.put('/admin/stops/reorder', {
        stops: newStops.map((s, i) => ({ id: s._id, order: i + 1 })),
      });
      fetchStops(selectedRoute);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (loading) return <Loader label="Loading stops..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchRoutes} />;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold text-forest-800">Stop Management</h1>
        <button
          onClick={openCreate}
          disabled={!selectedRoute}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest-500 text-white font-semibold hover:bg-forest-600 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Add Stop
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-forest-700 mb-1">Route</label>
        <select
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
          className="w-full sm:w-72 px-3 py-2 rounded-lg border border-khaki-300"
        >
          {routes.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl2 shadow-card border border-khaki-200 divide-y divide-khaki-100">
        {stops.map((stop, index) => (
          <div key={stop._id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-bold text-forest-800">
                {stop.order}. {stop.name}
              </p>
              <p className="text-xs text-forest-400">
                {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => move(index, -1)} disabled={index === 0} className="p-1.5 rounded-lg hover:bg-khaki-100 disabled:opacity-30">
                <ArrowUp className="w-4 h-4 text-forest-600" />
              </button>
              <button
                onClick={() => move(index, 1)}
                disabled={index === stops.length - 1}
                className="p-1.5 rounded-lg hover:bg-khaki-100 disabled:opacity-30"
              >
                <ArrowDown className="w-4 h-4 text-forest-600" />
              </button>
              <button onClick={() => handleDelete(stop._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {stops.length === 0 && <p className="text-forest-400 text-sm py-8 text-center">No stops on this route yet.</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-forest-800/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-xl2 shadow-soft w-full max-w-md p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-forest-400">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-lg text-forest-800 mb-4">Add Stop</h2>
            {formError && <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Stop Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-khaki-300"
              />
              <input
                required
                type="number"
                step="any"
                placeholder="Latitude"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-khaki-300"
              />
              <input
                required
                type="number"
                step="any"
                placeholder="Longitude"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-khaki-300"
              />
              <button type="submit" className="w-full py-2.5 rounded-lg bg-forest-500 text-white font-bold hover:bg-forest-600">
                Add Stop
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStops;
