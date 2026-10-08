// Thin wrapper around the browser Notification API. Browsers require a
// user gesture (a click) before they'll show the permission prompt, so
// requestNotificationPermission() should always be called from a button's
// onClick - never automatically on page load.
export const isNotificationSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export const getNotificationPermission = () => (isNotificationSupported() ? Notification.permission : 'unsupported');

export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const result = await Notification.requestPermission();
    return result; // 'granted' | 'denied' | 'default'
  } catch {
    return 'denied';
  }
};

// Shows a real OS-level notification if permission has been granted.
// Falls back silently otherwise - callers should also show an in-app
// toast/banner so the alert is never missed just because permission
// wasn't granted.
export const showBrowserNotification = (title, options = {}) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚌</text></svg>',
      ...options,
    });
  } catch {
    // Notification constructor can throw on some mobile browsers (they
    // require a Service Worker instead) - fail quietly, in-app alert still shows.
  }
};
