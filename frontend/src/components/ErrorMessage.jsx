import { AlertTriangle } from 'lucide-react';

// Friendly, non-technical error banner. Never renders raw server errors.
const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center bg-white rounded-xl2 shadow-card border border-khaki-200">
    <AlertTriangle className="w-8 h-8 text-orange-500" />
    <p className="text-forest-700 font-medium max-w-sm">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2 px-4 py-2 bg-forest-500 text-white rounded-lg text-sm font-semibold hover:bg-forest-600 transition"
      >
        Try Again
      </button>
    )}
  </div>
);

export default ErrorMessage;
