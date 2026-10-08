// Standard declarative setInterval hook (Dan Abramov pattern) - used to
// poll the backend every few seconds for "live" updates without setting up
// WebSockets yet (see README "Real-Time Architecture").
import { useEffect, useRef } from 'react';

const useInterval = (callback, delayMs) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null) return;
    const id = setInterval(() => savedCallback.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
};

export default useInterval;
