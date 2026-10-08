// Watches a bus "status" object (from GET /api/buses/:id/location) and
// fires a real-time alert the moment the bus reaches a new stop, and a
// one-time "arriving soon" alert when it gets close to the next stop.
// Works with ANY location source - real GPS, a driver's phone, or Demo Mode.
import { useEffect, useRef } from 'react';
import { showBrowserNotification } from '../utils/notifications';

const ARRIVING_SOON_METERS = 300; // distance threshold for the "arriving soon" alert

const useStopNotifications = (status, { enabled, onAlert }) => {
  const previousArrivalEventId = useRef(null);
  const announcedApproachId = useRef(null); // nextStop id already announced as "arriving soon"
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!status) return;
    const { bus, nextStop, distanceMeters, arrivalEvent } = status;

    // Skip the very first status received so we don't fire a false alert
    // just because the page loaded mid-route.
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      previousArrivalEventId.current = arrivalEvent?.eventId || null;
      return;
    }

    // The backend gives each persisted arrival a unique event id. This avoids
    // false/duplicate browser alerts caused by normal GPS drift inside a stop.
    if (arrivalEvent?.eventId && arrivalEvent.eventId !== previousArrivalEventId.current) {
      const title = arrivalEvent.message || `${bus.busNumber} has reached a stop`;
      const body = nextStop ? `Next stop: ${nextStop.name}` : 'Route completed.';
      if (enabled) showBrowserNotification(title, { body });
      onAlert?.({ id: arrivalEvent.eventId, type: 'arrived', title, body });
      previousArrivalEventId.current = arrivalEvent.eventId;
      announcedApproachId.current = null; // reset so the next leg can announce "approaching" again
    }

    // Bus is close to the next stop (announced once per leg of the journey).
    if (
      nextStop &&
      typeof distanceMeters === 'number' &&
      distanceMeters <= ARRIVING_SOON_METERS &&
      announcedApproachId.current !== nextStop._id
    ) {
      const title = `${bus.busNumber} approaching`;
      const body = `Arriving soon at ${nextStop.name} (~${distanceMeters} m away)`;
      if (enabled) showBrowserNotification(title, { body });
      onAlert?.({ id: `${nextStop._id}-approaching-${Date.now()}`, type: 'approaching', stopName: nextStop.name, title, body });
      announcedApproachId.current = nextStop._id;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
};

export default useStopNotifications;
