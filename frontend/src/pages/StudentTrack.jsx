import { useCallback, useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import useInterval from '../hooks/useInterval';
import BusMap from '../components/BusMap';
import RouteTimeline from '../components/RouteTimeline';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { timeAgo } from '../utils/time';
import AlertToast from '../components/AlertToast';
import useStopNotifications from '../hooks/useStopNotifications';
import { getNotificationPermission, requestNotificationPermission } from '../utils/notifications';

const POLL_MS = 5000;

const StudentTrack = () => {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [notifState, setNotifState] = useState(getNotificationPermission());

  useStopNotifications(status, {
    enabled: notifState === 'granted',
    onAlert: (alert) => setAlerts((current) => [alert, ...current].slice(0, 3)),
  });

  const fetchStatus = useCallback(async () => {
    try {
      const { data: busesData } = await api.get('/buses');
      if (!busesData.buses.length) {
        setError('No active bus has been added yet.');
        return;
      }
      const bus = busesData.buses[0];
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

  if (loading) return <Loader label="Loading live map..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchStatus} />;
  if (!status) return <ErrorMessage message="No bus data is available right now." onRetry={fetchStatus} />;

  const { bus, stops, location, liveStatus, currentStop, nextStop, passedStopIds } = status;
  const busPosition = location ? [location.latitude, location.longitude] : null;

  return (
    <div className="max-w-6xl mx-auto">
      <AlertToast
        alerts={alerts}
        onDismiss={(id) => setAlerts((current) => current.filter((alert) => alert.id !== id))}
        notifState={notifState}
        onEnableNotifications={async () => setNotifState(await requestNotificationPermission())}
      />
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-forest-800">{bus.busNumber} - Live Map</h1>
          <p className="text-sm text-forest-400 flex items-center gap-1.5">
            <RefreshCcw className="w-3.5 h-3.5" /> Last updated: {location ? timeAgo(location.timestamp) : 'never'}
          </p>
        </div>
        <StatusBadge status={liveStatus} />
      </div>

      {liveStatus === 'DEMO' && (
        <div className="mb-4 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 inline-block">
          DEMO MODE - SIMULATED GPS
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BusMap
            stops={stops}
            busPosition={busPosition}
            currentStopId={currentStop?._id}
            nextStopId={nextStop?._id}
            passedStopIds={passedStopIds}
            height="500px"
          />
        </div>
        <div className="bg-white rounded-xl2 shadow-card border border-khaki-200 p-5">
          <h2 className="font-bold text-forest-800 mb-4">Route Stops</h2>
          <RouteTimeline
            stops={stops}
            currentStopId={currentStop?._id}
            nextStopId={nextStop?._id}
            passedStopIds={passedStopIds}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentTrack;
