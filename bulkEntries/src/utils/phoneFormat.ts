// utils/phoneFormat.ts

/**
 * Formats and manages Indian-style phone number input (+91 XXXXX XXXXX)
 * Returns formatted value ready to display in an input.
 */

export const handlePhoneValue = (digits: string): string => {
  const clean = digits.replace(/[^0-9]/g, '').slice(0, 10);
  if (!clean) return ''; // Allow clearing input

  let formatted = '+91 ';
  if (clean.length > 5) {
    formatted += clean.slice(0, 5) + ' ' + clean.slice(5);
  } else {
    formatted += clean;
  }
  return formatted;
};

export const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): string => {
  const prefix = '+91 ';
  let inputValue = e.target.value;

  if (inputValue.startsWith(prefix)) {
    inputValue = inputValue.substring(prefix.length);
  }

  // Keep only digits and limit to 10
  const newPhone = inputValue.replace(/[^0-9]/g, '').slice(0, 10);
  return handlePhoneValue(newPhone);
};
