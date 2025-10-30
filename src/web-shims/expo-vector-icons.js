// Web shim for @expo/vector-icons using Unicode emojis and symbols
import React from 'react';

const iconMap = {
  // Common Ionicons mappings to Unicode
  'home': '🏠',
  'home-outline': '🏠',
  'book': '📚',
  'book-outline': '📖',
  'chatbubbles': '💬',
  'chatbubbles-outline': '💬',
  'musical-notes': '🎵',
  'musical-notes-outline': '🎵',
  'trophy': '🏆',
  'trophy-outline': '🏆',
  'ellipsis-horizontal-circle': '⚙️',
  'ellipsis-horizontal-circle-outline': '⚙️',
  'refresh-circle': '🔄',
  'refresh-circle-outline': '🔄',
  'settings': '⚙️',
  'settings-outline': '⚙️',
  'person': '👤',
  'person-outline': '👤',
  'log-out': '🚪',
  'log-out-outline': '🚪',
  'checkmark-circle': '✅',
  'checkmark-circle-outline': '✅',
  'close-circle': '❌',
  'close-circle-outline': '❌',
  'chevron-back': '◀️',
  'chevron-forward': '▶️',
  'add-circle': '➕',
  'add-circle-outline': '➕',
  'trash': '🗑️',
  'trash-outline': '🗑️',
};

// Generic icon component
const Icon = ({ name, size = 24, color = '#000', style }) => {
  const icon = iconMap[name] || '•';
  return (
    <span
      style={{
        fontSize: size,
        color,
        display: 'inline-block',
        lineHeight: 1,
        ...style,
      }}
    >
      {icon}
    </span>
  );
};

export const Ionicons = Icon;
export const MaterialIcons = Icon;
export const FontAwesome = Icon;
export const MaterialCommunityIcons = Icon;
export const Feather = Icon;

export default {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  MaterialCommunityIcons,
  Feather,
};
