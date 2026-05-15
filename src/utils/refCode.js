// src/utils/refCode.js
// Short, human-friendly registration reference used as the bank transfer
// description, e.g. CAMP-2026-AB12CD. Avoids characters that look alike
// (0/O, 1/I) on purpose.

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const generateRefCode = (prefix = 'CAMP', length = 6) => {
  const year = new Date().getFullYear();
  let random = '';
  for (let i = 0; i < length; i += 1) {
    random += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `${prefix}-${year}-${random}`;
};
