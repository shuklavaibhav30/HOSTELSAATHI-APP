import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CATEGORY_STYLES = {
  electrical: {
    bg: '#fef3c7',        // Amber-100
    border: '#fde68a',    // Amber-200
    text: '#92400e',      // Amber-800
    dot: '#d97706',       // Amber-600
  },
  plumbing: {
    bg: '#cff4fc',        // Cyan-100
    border: '#9feaf9',    // Cyan-200
    text: '#08596b',      // Cyan-900
    dot: '#0891b2',       // Cyan-600
  },
  mess: {
    bg: '#ffedd5',        // Orange-100
    border: '#fed7aa',    // Orange-200
    text: '#9a3412',      // Orange-800
    dot: '#ea580c',       // Orange-600
  },
  cleaning: {
    bg: '#d1fae5',        // Emerald-100
    border: '#a7f3d0',    // Emerald-200
    text: '#065f46',      // Emerald-800
    dot: '#059669',       // Emerald-600
  },
  furniture: {
    bg: '#f3e8ff',        // Purple-100
    border: '#e9d5ff',    // Purple-200
    text: '#6b21a8',      // Purple-800
    dot: '#9333ea',       // Purple-600
  },
  internet: {
    bg: '#dbeafe',        // Blue-100
    border: '#bfdbfe',    // Blue-200
    text: '#1e40af',      // Blue-800
    dot: '#2563eb',       // Blue-600
  },
  other: {
    bg: '#f1f5f9',        // Slate-100
    border: '#e2e8f0',    // Slate-200
    text: '#334155',      // Slate-700
    dot: '#64748b',       // Slate-500
  },
};

export const CategoryBadge = ({ category }) => {
  const norm = (category || 'other').toLowerCase();
  
  let key = 'other';
  if (norm.includes('electr')) key = 'electrical';
  else if (norm.includes('plumb')) key = 'plumbing';
  else if (norm.includes('mess')) key = 'mess';
  else if (norm.includes('clean')) key = 'cleaning';
  else if (norm.includes('furn')) key = 'furniture';
  else if (norm.includes('net') || norm.includes('wi-fi')) key = 'internet';

  const styleConfig = CATEGORY_STYLES[key] || CATEGORY_STYLES.other;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: styleConfig.bg,
          borderColor: styleConfig.border,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: styleConfig.dot }]} />
      <Text style={[styles.label, { color: styleConfig.text }]}>
        {category || 'Other'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
