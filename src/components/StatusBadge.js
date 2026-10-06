import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export const StatusBadge = ({ status }) => {
  const normalized = (status || 'pending').toLowerCase();

  let bg = COLORS.pendingBg;
  let border = COLORS.pendingBorder;
  let text = COLORS.pending;
  let label = 'Pending';

  if (normalized === 'resolved') {
    bg = COLORS.resolvedBg;
    border = COLORS.resolvedBorder;
    text = COLORS.resolved;
    label = 'Resolved';
  } else if (normalized === 'reopened') {
    bg = COLORS.reopenedBg;
    border = COLORS.reopenedBorder;
    text = COLORS.reopened;
    label = 'Reopened';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      <View style={[styles.dot, { backgroundColor: text }]} />
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
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
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
