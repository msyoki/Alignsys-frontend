export function toSentenceCase(text) {
  if (!text) return '';
  
  // Trim and lowercase the entire string
  const lower = text.trim().toLowerCase();

  // Capitalize the first letter
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}




  export function formatDate (dateString)  {
    if (!dateString) return '';

    const utcString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    const date = new Date(utcString);
    if (isNaN(date)) return '';

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(',', '');
  };

export const toUpperCase = (text) => text?.toUpperCase();
