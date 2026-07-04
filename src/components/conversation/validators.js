/**
 * Validation utilities for the conversational wizard.
 */

export const validateRequired = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const validateGithubUsername = (username) => {
  if (!username) return 'GitHub username is required';
  // GitHub usernames may only contain alphanumeric characters or hyphens,
  // cannot begin or end with a hyphen, and have a maximum length of 39 characters.
  const regex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
  if (!regex.test(username)) {
    return 'Invalid GitHub username format';
  }
  return true;
};

export const validateUrl = (url) => {
  if (!url) return true; // Optional field
  try {
    new URL(url);
    return true;
  } catch (_) {
    return 'Please enter a valid URL (e.g. https://example.com)';
  }
};

export const validateEmail = (email) => {
  if (!email) return true; // Optional field
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return 'Please enter a valid email address';
  }
  return true;
};

export const validateField = (value, type, isRequired) => {
  if (isRequired && !validateRequired(value)) {
    return 'This field is required';
  }
  
  if (type === 'email') {
    return validateEmail(value);
  }
  if (type === 'url') {
    return validateUrl(value);
  }
  if (type === 'github-username') {
    return validateGithubUsername(value);
  }
  
  return true;
};
