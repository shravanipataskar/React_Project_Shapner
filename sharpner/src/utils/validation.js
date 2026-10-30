/**
 * Validation utilities for phone numbers and email addresses
 * Used across all forms in the application
 */

/**
 * Validates Indian mobile numbers
 * - Must be exactly 10 digits
 * - Must start with 6, 7, 8, or 9
 * @param {string} value - The phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidPhoneNumber = (value) => {
  if (!value) return false;
  
  // Remove any whitespace
  const cleaned = String(value).trim();
  
  // Check if exactly 10 digits and starts with 6, 7, 8, or 9
  return /^[6-9]\d{9}$/.test(cleaned);
};

/**
 * Validates email addresses
 * Checks for standard email format: local@domain.tld
 * @param {string} value - The email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidEmail = (value) => {
  if (!value) return false;
  
  // Trim whitespace
  const cleaned = String(value).trim();
  
  // Standard email regex pattern
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
};

/**
 * Restricts input to numeric characters only
 * Useful for phone number input fields
 * @param {string} value - The input value
 * @returns {string} - Cleaned numeric-only string
 */
export const sanitizePhoneInput = (value) => {
  return String(value).replace(/[^0-9]/g, '');
};

/**
 * Trims and cleans email input
 * @param {string} value - The email input value
 * @returns {string} - Cleaned email string
 */
export const sanitizeEmailInput = (value) => {
  return String(value).trim();
};

/**
 * Gets validation error message for phone number
 * @param {string} value - The phone number value
 * @param {boolean} isRequired - Whether the field is required
 * @returns {string} - Error message or empty string if valid
 */
export const getPhoneErrorMessage = (value, isRequired = true) => {
  const trimmed = String(value || '').trim();
  
  if (!trimmed) {
    return isRequired ? 'Phone number is required.' : '';
  }
  
  if (!isValidPhoneNumber(trimmed)) {
    return 'Please enter a valid 10-digit mobile number.';
  }
  
  return '';
};

/**
 * Gets validation error message for email
 * @param {string} value - The email value
 * @param {boolean} isRequired - Whether the field is required
 * @returns {string} - Error message or empty string if valid
 */
export const getEmailErrorMessage = (value, isRequired = true) => {
  const trimmed = String(value || '').trim();
  
  if (!trimmed) {
    return isRequired ? 'Email is required.' : '';
  }
  
  if (!isValidEmail(trimmed)) {
    return 'Please enter a valid email address.';
  }
  
  return '';
};

/**
 * Validates a form field based on its type
 * @param {string} fieldName - Name of the field
 * @param {string} value - Value to validate
 * @param {boolean} isRequired - Whether field is required
 * @returns {string} - Error message or empty string if valid
 */
export const validateField = (fieldName, value, isRequired = true) => {
  const normalizedName = fieldName.toLowerCase();
  
  // Check if it's a phone/mobile/contact field
  if (
    normalizedName.includes('phone') ||
    normalizedName.includes('mobile') ||
    normalizedName.includes('contact') ||
    normalizedName.includes('telephone') ||
    normalizedName.includes('whatsapp')
  ) {
    return getPhoneErrorMessage(value, isRequired);
  }
  
  // Check if it's an email field
  if (normalizedName.includes('email') || normalizedName.includes('e-mail')) {
    return getEmailErrorMessage(value, isRequired);
  }
  
  return '';
};
