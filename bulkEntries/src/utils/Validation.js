// Validation.js

// Validates standard email format
export const IsValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// Validates Indian phone numbers (10 digits, starting with 6-9)
export const IsValidPhone = (phone) => {
  const re = /^[6-9]\d{9}$/;
  return re.test(String(phone));
};

// Validates passwords with min 8 characters,
// at least one uppercase, one lowercase, one digit, and one special char
export const IsValidPassword = (password) => {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return re.test(password);
};
