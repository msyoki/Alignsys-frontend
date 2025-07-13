export function toSentenceCase(text) {
  if (!text) return '';
  
  // Trim and lowercase the entire string
  const lower = text.trim().toLowerCase();

  // Capitalize the first letter
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
