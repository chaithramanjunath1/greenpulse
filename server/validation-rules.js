/**
 * Validate the carbon evaluation request payload.
 * @param {unknown} body - The request body to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateCarbonPayload = (body) => {
  const errors = [];

  if (!body || typeof body !== 'object') {
    errors.push('Request body must be a JSON object');
    return { valid: false, errors };
  }

  if (!Array.isArray(body.entries)) {
    errors.push('Field "entries" must be an array');
    return { valid: false, errors };
  }

  if (body.entries.length === 0) {
    errors.push('At least one entry is required');
    return { valid: false, errors };
  }

  if (body.entries.length > 50) {
    errors.push('Maximum 50 entries allowed per request');
    return { valid: false, errors };
  }

  for (let i = 0; i < body.entries.length; i++) {
    const entry = body.entries[i];

    if (!entry || typeof entry !== 'object') {
      errors.push(`Entry at index ${i} must be an object`);
      continue;
    }

    if (typeof entry.kind !== 'string' || entry.kind.trim().length === 0) {
      errors.push(`Entry at index ${i}: "kind" must be a non-empty string`);
    }

    if (typeof entry.amount !== 'number' || entry.amount < 0) {
      errors.push(`Entry at index ${i}: "amount" must be a non-negative number`);
    }
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Sanitize a user-provided string by trimming and removing HTML tags.
 * @param {string} str - The string to sanitize
 * @returns {string}
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  return str.trim().replace(/<[^>]*>/g, '');
};
