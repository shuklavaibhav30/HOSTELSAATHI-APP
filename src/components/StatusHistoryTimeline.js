import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, Clock, RotateCcw, AlertCircle } from 'lucide-react-native';
import { COLORS } from '../constants/colors';

export const StatusHistoryTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Status & Activity Timeline</Text>

      <View style={styles.timeline}>
        {history.map((item, index) => {
          const isLast = index === history.length - 1;
          const status = (item.status || '').toLowerCase();

          let icon = <Clock size={16} color={COLORS.pending} />;
          let iconBg = COLORS.pendingBg;
          let iconBorder = COLORS.pendingBorder;
          let titleColor = COLORS.pending;

          if (status === 'resolved') {
            icon = <CheckCircle2 size={16} color={COLORS.resolved} />;
            iconBg = COLORS.resolvedBg;
            iconBorder = COLORS.resolvedBorder;
            titleColor = COLORS.resolved;
          } else if (status === 'reopened') {
            icon = <RotateCcw size={16} color={COLORS.reopened} />;
            iconBg = COLORS.reopenedBg;
            iconBorder = COLORS.reopenedBorder;
            titleColor = COLORS.reopened;
          }

          const formattedDate = item.timestamp
            ? new Date(item.timestamp).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })
            : '';

          return (
            <View key={index} style={styles.itemRow}>
              {/* Left Column: Icon & Vertical Line */}
              <View style={styles.leftCol}>
                <View style={[styles.iconCircle, { backgroundColor: iconBg, borderColor: iconBorder }]}>
                  {icon}
                </View>
                {!isLast ? <View style={styles.line} /> : null}
              </View>

              {/* Right Column: Event Content */}
              <View style={styles.rightCol}>
                <View style={styles.eventHeader}>
                  <Text style={[styles.statusTitle, { color: titleColor }]}>
                    {item.status.toUpperCase()}
                  </Text>
                  {formattedDate ? <Text style={styles.dateText}>{formattedDate}</Text> : null}
                </View>

                {item.note ? (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteText}>"{item.note}"</Text>
                  </View>
                ) : null}

                {item.changedByRole ? (
                  <Text style={styles.roleText}>
                    Updated by: <Text style={styles.roleHighlight}>{item.changedByRole}</Text>
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  timeline: {
    gap: 4,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
  },
  leftCol: {
    alignItems: 'center',
    width: 28,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  rightCol: {
    flex: 1,
    paddingBottom: 16,
    gap: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  noteBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    padding: 10,
    marginVertical: 4,
  },
  noteText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  roleText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  roleHighlight: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
