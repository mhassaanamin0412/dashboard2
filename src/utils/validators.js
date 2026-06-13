export const validateEmail = (email) => {
  const trimmed = email?.trim();
  if (!trimmed) return 'Email is required';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return 'Please enter a valid email address';

  return null;
};

export const validateUrl = (url) => {
  if (!url || url.trim() === '') return null; // URL is optional

  const trimmed = url.trim();
  const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

  if (!urlRegex.test(trimmed)) return 'Please enter a valid URL';

  return null;
};

export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || value.trim() === '') return `${fieldName} is required`;
  return null;
};

export const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/[<>]/g, '');
};
