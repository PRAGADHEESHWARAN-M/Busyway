import { useCallback, useEffect, useState } from 'react';
import { Gauge, MapPin, Navigation, Clock, Satellite, RefreshCcw } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useInterval from '../hooks/useInterval';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { timeAgo, formatDistance } from '../utils/time';

const POLL_MS = 5000;

const StudentDashboard = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const { data: busesData } = await api.get('/buses');
      if (!busesData.buses.length) {
        setError('No active bus has been added yet. Please check back later.');
        setStatus(null);
        return;
      }
      const bus = busesData.buses[0]; // single-bus deployment for now
      const { data } = await api.get(`/buses/${bus.id || bus._id}/location`);
      setStatus(data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useInterval(fetchStatus, POLL_MS);

  if (loading) return <Loader label="Fetching live bus status..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchStatus} />;
  if (!status) return <ErrorMessage message="No bus data is available right now." onRetry={fetchStatus} />;

  const { bus, liveStatus, currentStop, previousStop, nextStop, distanceMeters, etaText, location, arrivalEvent } = status;

  const tiles = [
    {
      icon: MapPin,
      label: 'Current Location',
      value: location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : '—',
    },
    { icon: MapPin, label: 'Current Stop', value: currentStop?.name || 'Not started yet' },
    { icon: MapPin, label: 'Previous Stop', value: previousStop?.name || '—' },
    { icon: Navigation, label: 'Next Stop', value: nextStop?.name || '—' },
    { icon: Gauge, label: 'Distance', value: formatDistance(distanceMeters) },
    { icon: Clock, label: 'ETA', value: etaText },
    { icon: Gauge, label: 'Speed', value: location?.speed ? `${Math.round(location.speed)} km/h` : '—' },
    { icon: Satellite, label: 'GPS', value: location ? 'Online' : 'Offline' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-extrabold text-forest-800 mb-1">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
      <p className="text-forest-500 mb-6">Here's the latest status of your bus.</p>

      <div className="bg-white rounded-xl2 shadow-soft border border-khaki-200 p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <p className="text-xs text-forest-400 font-semibold uppercase tracking-wide">Bus</p>
            <p className="text-2xl font-extrabold text-forest-800">{bus.busNumber}</p>
            <p className="text-sm text-forest-400">{bus.busName}</p>
          </div>
          <StatusBadge status={liveStatus} />
        </div>

        {liveStatus === 'DEMO' && (
          <div className="mb-4 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 inline-block">
            DEMO MODE - SIMULATED GPS
          </div>
        )}

        {arrivalEvent && (
          <div className="mb-4 text-sm font-bold text-forest-800 bg-forest-50 border border-forest-100 rounded-lg px-4 py-3">
            {arrivalEvent.message}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiles.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-cream-100 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Icon className="w-5 h-5 text-forest-500" />
              </div>
              <div>
                <p className="text-xs text-forest-400 font-medium">{label}</p>
                <p className="font-bold text-forest-800">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-6 text-xs text-forest-400">
          <RefreshCcw className="w-3.5 h-3.5" />
          Last updated: {location ? timeAgo(location.timestamp) : 'never'}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
