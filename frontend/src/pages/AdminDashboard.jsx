import { useCallback, useEffect, useState } from 'react';
import { Bus, Activity, MapPin, Users } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import useInterval from '../hooks/useInterval';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { timeAgo } from '../utils/time';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [busStatus, setBusStatus] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [{ data: statsData }, { data: busesData }] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/buses'),
      ]);
      setStats(statsData.stats);

      if (busesData.buses.length) {
        const bus = busesData.buses[0];
        const { data } = await api.get(`/buses/${bus.id || bus._id}/location`);
        setBusStatus(data);
      }
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useInterval(fetchAll, 6000);

  if (loading) return <Loader label="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAll} />;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-extrabold text-forest-800 mb-6">Admin Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Bus} label="Total Buses" value={stats?.totalBuses ?? 0} accent="forest" />
        <StatCard icon={Activity} label="Active Buses" value={stats?.activeBuses ?? 0} accent="orange" />
        <StatCard icon={MapPin} label="Total Stops" value={stats?.totalStops ?? 0} accent="khaki" />
        <StatCard icon={Users} label="Registered Students" value={stats?.registeredStudents ?? 0} accent="forest" />
      </div>

      <div className="bg-white rounded-xl2 shadow-card border border-khaki-200 p-6">
        <h2 className="font-bold text-forest-800 mb-4">Live Bus Status</h2>
        {!busStatus ? (
          <p className="text-forest-400 text-sm">No bus has been added yet. Go to Buses to add one.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between bg-cream-100 rounded-xl p-4">
              <div>
                <p className="text-xs text-forest-400">Bus Number</p>
                <p className="font-bold text-forest-800">{busStatus.bus.busNumber}</p>
              </div>
              <StatusBadge status={busStatus.liveStatus} />
            </div>
            <div className="bg-cream-100 rounded-xl p-4">
              <p className="text-xs text-forest-400">Current Location</p>
              <p className="font-semibold text-forest-800 text-sm">
                {busStatus.location ? `${busStatus.location.latitude.toFixed(5)}, ${busStatus.location.longitude.toFixed(5)}` : '—'}
              </p>
            </div>
            <div className="bg-cream-100 rounded-xl p-4">
              <p className="text-xs text-forest-400">Current Stop</p>
              <p className="font-semibold text-forest-800">{busStatus.currentStop?.name || '—'}</p>
            </div>
            <div className="bg-cream-100 rounded-xl p-4">
              <p className="text-xs text-forest-400">Next Stop</p>
              <p className="font-semibold text-forest-800">{busStatus.nextStop?.name || '—'}</p>
            </div>
            <div className="bg-cream-100 rounded-xl p-4 sm:col-span-2">
              <p className="text-xs text-forest-400">Last GPS Update</p>
              <p className="font-semibold text-forest-800">
                {busStatus.location ? timeAgo(busStatus.location.timestamp) : 'never'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
