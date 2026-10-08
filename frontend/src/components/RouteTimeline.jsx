import { CheckCircle2, MapPin, Circle } from 'lucide-react';

// Vertical timeline of stops showing passed / current / next / future states.
const RouteTimeline = ({ stops = [], currentStopId, nextStopId, passedStopIds = [] }) => {
  const getState = (stop) => {
    if (currentStopId && stop._id === currentStopId) return 'current';
    if (nextStopId && stop._id === nextStopId) return 'next';
    if (passedStopIds.includes(stop._id)) return 'passed';
    return 'future';
  };

  const styleFor = (state) => {
    switch (state) {
      case 'passed':
        return { icon: CheckCircle2, iconClass: 'text-forest-400', line: 'bg-forest-400', text: 'text-forest-400 line-through' };
      case 'current':
        return { icon: MapPin, iconClass: 'text-orange-500', line: 'bg-khaki-300', text: 'text-forest-800 font-bold' };
      case 'next':
        return { icon: MapPin, iconClass: 'text-forest-500', line: 'bg-khaki-300', text: 'text-forest-700 font-semibold' };
      default:
        return { icon: Circle, iconClass: 'text-khaki-300', line: 'bg-khaki-200', text: 'text-forest-400' };
    }
  };

  return (
    <ol className="relative">
      {stops.map((stop, index) => {
        const state = getState(stop);
        const s = styleFor(state);
        const Icon = s.icon;
        const isLast = index === stops.length - 1;
        return (
          <li key={stop._id} className="relative pl-8 pb-6 last:pb-0">
            {!isLast && <span className={`absolute left-[11px] top-6 w-0.5 h-full ${s.line}`} />}
            <span className="absolute left-0 top-0.5">
              <Icon className={`w-6 h-6 ${s.iconClass}`} fill={state === 'current' ? 'currentColor' : 'none'} />
            </span>
            <div className="flex items-center justify-between gap-2">
              <p className={`text-sm ${s.text}`}>{stop.name}</p>
              {state === 'current' && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}
              {state === 'next' && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full">
                  Next
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default RouteTimeline;
