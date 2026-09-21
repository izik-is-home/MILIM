/**
 * Formats a duration in milliseconds to MM:SS.d
 * Example: 65123ms -> "01:05.1"
 */
export function formatTime(ms) {
  if (ms < 0) ms = 0;
  
  const totalTenths = Math.floor(ms / 100);
  const tenths = totalTenths % 10;
  
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  const minsStr = minutes.toString().padStart(2, '0');
  const secsStr = seconds.toString().padStart(2, '0');
  
  return `${minsStr}:${secsStr}.${tenths}`;
}

export function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
