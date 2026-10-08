// Small colored pill showing LIVE / OFFLINE / DEMO / NO_DATA states.
const CONFIG = {
  LIVE: { label: 'LIVE', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  OFFLINE: { label: 'OFFLINE', dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-600' },
  DEMO: { label: 'DEMO MODE', dot: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-600' },
  NO_DATA: { label: 'NO DATA', dot: 'bg-gray-400', bg: 'bg-gray-100', text: 'text-gray-500' },
};

const StatusBadge = ({ status = 'NO_DATA', pulse = true }) => {
  const c = CONFIG[status] || CONFIG.NO_DATA;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot} ${pulse && status !== 'OFFLINE' ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  );
};

export default StatusBadge;
