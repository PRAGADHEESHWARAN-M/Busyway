// Formats a timestamp as "X seconds/minutes ago" for the "Last updated" UI.
export const timeAgo = (isoOrDate) => {
  if (!isoOrDate) return 'never';
  const date = new Date(isoOrDate);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
};

export const formatDistance = (meters) => {
  if (meters === null || meters === undefined) return '--';
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};
