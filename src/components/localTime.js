export function convertToLocalTime(dateStr) {
  const date = new Date(dateStr);

  // Handle invalid date
  if (isNaN(date)) {
    return 'Invalid date';
  }

  return date.toLocaleString(); // Formats using user's local settings
}