import { Bell, BellOff, X, CheckCircle2, Navigation2 } from 'lucide-react';

// Fixed-position stack of recent real-time alerts (bus arrived / approaching),
// plus the "Enable Notifications" control since browsers require a user
// gesture before the permission prompt can be shown.
const AlertToast = ({ alerts, onDismiss, notifState, onEnableNotifications }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      {notifState !== 'granted' && notifState !== 'unsupported' && (
        <button
          onClick={onEnableNotifications}
          className="flex items-center gap-2 bg-forest-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-soft hover:bg-forest-600 transition self-end"
        >
          <Bell className="w-4 h-4" /> Enable arrival alerts
        </button>
      )}
      {notifState === 'unsupported' && (
        <div className="flex items-center gap-2 bg-gray-100 text-gray-500 text-xs font-medium px-3 py-2 rounded-xl self-end">
          <BellOff className="w-3.5 h-3.5" /> Notifications not supported on this browser
        </div>
      )}

      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-white border border-khaki-200 shadow-soft rounded-xl p-4 flex items-start gap-3"
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              alert.type === 'arrived' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
            }`}
          >
            {alert.type === 'arrived' ? <CheckCircle2 className="w-5 h-5" /> : <Navigation2 className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-forest-800">{alert.title}</p>
            <p className="text-xs text-forest-500">{alert.body}</p>
          </div>
          <button onClick={() => onDismiss(alert.id)} className="text-forest-300 hover:text-forest-500 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertToast;
