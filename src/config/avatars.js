// src/config/avatars.js
// Preset avatar options users can pick from in the dashboard. Identified by
// `id` (what we store in the database) and rendered by `emoji`.

export const AVATAR_OPTIONS = [
  { id: 'gymnast',   emoji: '🤸', label: 'Ximnasta' },
  { id: 'weights',   emoji: '🏋️', label: 'Forza' },
  { id: 'medal',     emoji: '🥇', label: 'Medalla' },
  { id: 'star',      emoji: '⭐', label: 'Estrela' },
  { id: 'sparkle',   emoji: '✨', label: 'Brillo' },
  { id: 'fire',      emoji: '🔥', label: 'Lume' },
  { id: 'bolt',      emoji: '⚡', label: 'Raio' },
  { id: 'rainbow',   emoji: '🌈', label: 'Arco da vella' },
  { id: 'fox',       emoji: '🦊', label: 'Raposa' },
  { id: 'bear',      emoji: '🐻', label: 'Oso' },
  { id: 'lion',      emoji: '🦁', label: 'León' },
  { id: 'panda',     emoji: '🐼', label: 'Panda' },
];

export const getAvatarEmoji = (avatarId) => {
  if (!avatarId) return null;
  const option = AVATAR_OPTIONS.find((o) => o.id === avatarId);
  return option ? option.emoji : null;
};

// Background colours the user can choose for their avatar circle. Stored
// by `id`; the colour is applied as `value` on the CSS background.
export const AVATAR_COLORS = [
  { id: 'red',      value: '#BC0500', label: 'Vermello' },
  { id: 'crimson',  value: '#831616', label: 'Carmesí' },
  { id: 'rose',     value: '#E0598F', label: 'Rosa' },
  { id: 'amber',    value: '#E0922A', label: 'Ámbar' },
  { id: 'forest',   value: '#2E7D5E', label: 'Bosque' },
  { id: 'teal',     value: '#1F9AA0', label: 'Verde mar' },
  { id: 'ocean',    value: '#2F6EAF', label: 'Océano' },
  { id: 'indigo',   value: '#5444B0', label: 'Índigo' },
  { id: 'slate',    value: '#4A5568', label: 'Lousa' },
];

export const DEFAULT_AVATAR_COLOR = AVATAR_COLORS[0];

export const getAvatarColor = (avatarColorId) => {
  if (!avatarColorId) return DEFAULT_AVATAR_COLOR.value;
  const option = AVATAR_COLORS.find((o) => o.id === avatarColorId);
  return option ? option.value : DEFAULT_AVATAR_COLOR.value;
};
