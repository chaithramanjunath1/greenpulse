/**
 * Sanitize a user-provided string by trimming and removing HTML tags.
 * Prevents XSS and injection attacks from user input.
 * @param {string} str - The string to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  return str.trim().replace(/<[^>]*>/g, '').slice(0, 100);
};

/**
 * Validate the carbon evaluation request payload.
 * Ensures entries is an array of valid activity objects with kind/amount fields.
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
    } else if (entry.kind.length > 50) {
      errors.push(`Entry at index ${i}: "kind" must not exceed 50 characters`);
    }

    if (typeof entry.amount !== 'number' || entry.amount < 0) {
      errors.push(`Entry at index ${i}: "amount" must be a non-negative number`);
    } else if (entry.amount > 100000) {
      errors.push(`Entry at index ${i}: "amount" must not exceed 100,000`);
    }
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Validate the advisor suggestion request payload.
 * Ensures totalKg is a valid number and bySector is an object if provided.
 * @param {unknown} body - The request body to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateAdvisorPayload = (body) => {
  const errors = [];

  if (!body || typeof body !== 'object') {
    errors.push('Request body must be a JSON object');
    return { valid: false, errors };
  }

  if (typeof body.totalKg !== 'number' || isNaN(body.totalKg)) {
    errors.push('totalKg must be a valid number');
  } else if (body.totalKg < 0 || body.totalKg > 1000000) {
    errors.push('totalKg must be between 0 and 1,000,000');
  }

  if (body.bySector !== undefined && (typeof body.bySector !== 'object' || body.bySector === null || Array.isArray(body.bySector))) {
    errors.push('bySector must be a plain object if provided');
  }

  return { valid: errors.length === 0, errors };
};
