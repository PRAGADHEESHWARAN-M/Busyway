// "Driver Mode" turns the driver's own phone into the bus's GPS transmitter,
// as an alternative to (or backup for) the ESP32 + NEO-6M hardware.
//
// How it works:
// 1. The driver opens this page in their phone's browser (Chrome/Safari) -
//    no app install required.
// 2. They pick their bus and (optionally) enter a device key set by the admin.
// 3. Tapping "Start Sharing Location" asks the browser for GPS permission and
//    starts watchPosition(), which fires every time the phone's GPS updates.
// 4. Each update is POSTed to the same /api/location endpoint the ESP32
//    would use, tagged source: "phone" so it's clearly distinguishable in
//    the database while being displayed to passengers exactly like normal
//    GPS data (see README section 7A "Using a Phone as the Bus GPS").
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus, Smartphone, Play, Square, ShieldCheck, AlertTriangle, Satellite } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';

const DriverMode = () => {
  const [buses, setBuses] = useState([]);
  const [busId, setBusId] = useState('');
  const [deviceKey, setDeviceKey] = useState('');
  const [sharing, setSharing] = useState(false);
  const [lastPing, setLastPing] = useState(null);
  const [pingCount, setPingCount] = useState(0);
  const [error, setError] = useState('');
  const [permissionError, setPermissionError] = useState('');
  const watchIdRef = useRef(null);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const { data } = await api.get('/buses');
        setBuses(data.buses);
        if (data.buses.length) setBusId(data.buses[0]._id || data.buses[0].id);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };
    fetchBuses();
  }, []);

  // Stop watching GPS if the component unmounts while sharing is active.
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const sendPing = async (position) => {
    const { latitude, longitude, speed } = position.coords;
    // Browser speed is in m/s (or null if the device can't determine it);
    // convert to km/h. We never invent a number - if speed is null we send 0
    // and the backend/ETA service will correctly show "Calculating...".
    const speedKmh = typeof speed === 'number' && speed !== null ? Math.round(speed * 3.6) : 0;

    try {
      await api.post(
        '/location',
        {
          busId,
          latitude,
          longitude,
          speed: speedKmh,
          satellites: 0, // browsers don't expose raw satellite count
          source: 'phone',
          timestamp: new Date().toISOString(),
        },
        deviceKey ? { headers: { 'x-device-key': deviceKey } } : undefined
      );
      setLastPing(new Date());
      setPingCount((c) => c + 1);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startSharing = () => {
    setPermissionError('');
    setError('');

    if (!busId) {
      setError('Select a bus first.');
      return;
    }
    if (!navigator.geolocation) {
      setPermissionError('This browser does not support location sharing.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => sendPing(position),
      (geoErr) => setPermissionError(`Location permission denied or unavailable: ${geoErr.message}`),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );

    watchIdRef.current = watchId;
    setSharing(true);
  };

  const stopSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
  };

  return (
    <div className="min-h-screen bg-forest-800 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-xl2 shadow-soft p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-forest-500 flex items-center justify-center mb-3">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-forest-800">Driver Mode</h1>
          <p className="text-sm text-forest-400 text-center mt-1">
            Use this phone as the bus's GPS. Keep this page open while driving.
          </p>
        </div>

        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        {permissionError && (
          <p className="mb-4 text-sm text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {permissionError}
          </p>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-1">Bus</label>
            <select
              value={busId}
              onChange={(e) => setBusId(e.target.value)}
              disabled={sharing}
              className="w-full px-4 py-2.5 rounded-lg border border-khaki-300 disabled:bg-cream-100"
            >
              {buses.map((b) => (
                <option key={b._id || b.id} value={b._id || b.id}>
                  {b.busNumber} - {b.busName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-forest-700 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Device Key (if set by admin)
            </label>
            <input
              type="password"
              value={deviceKey}
              onChange={(e) => setDeviceKey(e.target.value)}
              disabled={sharing}
              placeholder="Leave blank if not required"
              className="w-full px-4 py-2.5 rounded-lg border border-khaki-300 disabled:bg-cream-100"
            />
          </div>
        </div>

        {!sharing ? (
          <button
            onClick={startSharing}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-forest-500 text-white font-bold hover:bg-forest-600 transition"
          >
            <Play className="w-4 h-4" /> Start Sharing Location
          </button>
        ) : (
          <button
            onClick={stopSharing}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition"
          >
            <Square className="w-4 h-4" /> Stop Sharing
          </button>
        )}

        {sharing && (
          <div className="mt-5 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
            <Satellite className="w-6 h-6 text-emerald-600 animate-pulse" />
            <div className="text-sm">
              <p className="font-bold text-emerald-700">Sharing live location</p>
              <p className="text-emerald-600">
                {pingCount} update{pingCount === 1 ? '' : 's'} sent{lastPing ? ` - last at ${lastPing.toLocaleTimeString()}` : ''}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-forest-400 bg-cream-100 rounded-lg p-3 flex items-start gap-2">
          <Bus className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            Keep your screen on and this tab open/foregrounded while driving - most mobile browsers pause GPS updates
            when the screen locks or the tab goes to the background.
          </p>
        </div>

        <p className="text-center text-xs text-forest-300 mt-6">
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default DriverMode;
