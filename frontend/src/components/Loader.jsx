import { Bus } from 'lucide-react';

// Small reusable loading indicator used while API calls are in flight.
const Loader = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-forest-500">
    <Bus className="w-8 h-8 animate-bounce" />
    <p className="text-sm font-medium">{label}</p>
  </div>
);

export default Loader;
