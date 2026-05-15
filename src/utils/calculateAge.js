// src/utils/calculateAge.js
// Returns the integer age in years for a given ISO date string (yyyy-mm-dd)
// or Date object. Returns null when the input cannot be parsed.

export const calculateAge = (input, today = new Date()) => {
  if (!input) return null;
  const birth = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(birth.getTime())) return null;

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age -= 1;
  }
  return age;
};
