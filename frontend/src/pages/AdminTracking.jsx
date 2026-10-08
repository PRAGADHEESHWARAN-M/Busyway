import { useCallback, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Satellite, Gauge } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import useInterval from '../hooks/useInterval';
import BusMap from '../components/BusMap';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { timeAgo } from '../utils/time';

const AdminTracking = () => {
  const [buses, setBuses] = useState([]);
  const [busId, setBusId] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchBuses = useCallback(async () => {
    try {
      const { data } = await api.get('/buses');
      setBuses(data.buses);
      if (data.buses.length && !busId) setBusId(data.buses[0]._id || data.buses[0].id);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [busId]);

  const fetchStatus = useCallback(async () => {
    if (!busId) return;
    try {
      const { data } = await api.get(`/buses/${busId}/location`);
      setStatus(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [busId]);

  useEffect(() => {
    fetchBuses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchStatus();
  }, [busId, fetchStatus]);

  useInterval(fetchStatus, 4000);

  const runAction = async (action) => {
    setActionError('');
    setBusy(true);
    try {
      await api.post(`/admin/demo/${busId}/${action}`);
      fetchStatus();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader label="Loading tracking console..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchBuses} />;
  if (!buses.length) return <ErrorMessage message="Add a bus first to use live tracking." />;

  const busPosition = status?.location ? [status.location.latitude, status.location.longitude] : null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-extrabold text-forest-800">Live Tracking</h1>
        <select
          value={busId}
          onChange={(e) => setBusId(e.target.value)}
          className="px-3 py-2 rounded-lg border border-khaki-300"
        >
          {buses.map((b) => (
            <option key={b._id || b.id} value={b._id || b.id}>
              {b.busNumber}
            </option>
          ))}
        </select>
      </div>

      {status && (
        <>
          <div className="bg-white rounded-xl2 shadow-card border border-khaki-200 p-5 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h2 className="font-bold text-forest-800">DEMO / SIMULATION MODE</h2>
              <StatusBadge status={status.liveStatus} />
            </div>
            <p className="text-xs text-forest-400 mb-4">
              Use this when the physical GPS hardware isn't available. Simulated points are written to the same
              location feed real GPS uses, and are clearly labelled "DEMO MODE - SIMULATED GPS" everywhere they appear.
            </p>
            {actionError && <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{actionError}</p>}
            <div className="flex flex-wrap gap-2">
              <button
                disabled={busy}
                onClick={() => runAction('start')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest-500 text-white font-semibold hover:bg-forest-600 disabled:opacity-50"
              >
                <Play className="w-4 h-4" /> Start Demo
              </button>
              <button
                disabled={busy}
                onClick={() => runAction('pause')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-khaki-300 text-forest-800 font-semibold hover:bg-khaki-400 disabled:opacity-50"
              >
                <Pause className="w-4 h-4" /> Pause
              </button>
              <button
                disabled={busy}
                onClick={() => runAction('resume')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-khaki-300 text-forest-800 font-semibold hover:bg-khaki-400 disabled:opacity-50"
              >
                <Play className="w-4 h-4" /> Resume
              </button>
              <button
                disabled={busy}
                onClick={() => runAction('reset')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" /> Reset Demo
              </button>
              <button
                disabled={busy}
                onClick={() => runAction('next-stop')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest-700 text-white font-semibold hover:bg-forest-800 disabled:opacity-50"
              >
                <SkipForward className="w-4 h-4" /> Next Stop
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BusMap
                stops={status.stops}
                busPosition={busPosition}
                currentStopId={status.currentStop?._id}
                nextStopId={status.nextStop?._id}
                passedStopIds={status.passedStopIds}
                height="480px"
              />
            </div>
            <div className="bg-white rounded-xl2 shadow-card border border-khaki-200 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Satellite className="w-5 h-5 text-forest-500" />
                <div>
                  <p className="text-xs text-forest-400">Latitude / Longitude</p>
                  <p className="font-semibold text-forest-800 text-sm">
                    {status.location ? `${status.location.latitude.toFixed(6)}, ${status.location.longitude.toFixed(6)}` : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Gauge className="w-5 h-5 text-forest-500" />
                <div>
                  <p className="text-xs text-forest-400">Speed</p>
                  <p className="font-semibold text-forest-800 text-sm">
                    {status.location?.speed ? `${Math.round(status.location.speed)} km/h` : '—'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-forest-400">GPS Status</p>
                <p className="font-semibold text-forest-800 text-sm">{status.location ? 'Receiving GPS data' : 'No GPS data'}</p>
              </div>
              <div>
                <p className="text-xs text-forest-400">Current Stop</p>
                <p className="font-semibold text-forest-800 text-sm">{status.currentStop?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-forest-400">Previous Stop</p>
                <p className="font-semibold text-forest-800 text-sm">{status.previousStop?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-forest-400">Next Stop</p>
                <p className="font-semibold text-forest-800 text-sm">{status.nextStop?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-forest-400">Last Updated</p>
                <p className="font-semibold text-forest-800 text-sm">
                  {status.location ? timeAgo(status.location.timestamp) : 'never'}
                </p>
              </div>
              <div>
                <p className="text-xs text-forest-400">Connection Status</p>
                <StatusBadge status={status.liveStatus} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminTracking;
