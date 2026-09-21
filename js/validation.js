export function sanitizeName(name) {
  if (!name) return '';
  return name.replace(/\s+/g, ' ').trim();
}

export function validateName(name) {
  const cleaned = sanitizeName(name);
  if (cleaned.length < 2 || cleaned.length > 30) {
    return false;
  }
  // Basic XSS check
  if (cleaned.includes('<') || cleaned.includes('>')) {
    return false;
  }
  return true;
}

export function validatePairsCount(count) {
  const parsed = parseInt(count, 10);
  return [8, 16, 24].includes(parsed) ? parsed : null;
}
