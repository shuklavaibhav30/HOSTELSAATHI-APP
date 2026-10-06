import React, { useRef, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { ChevronRight, Image as ImageIcon, Calendar, Home } from 'lucide-react-native';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { COLORS } from '../constants/colors';

const ComplaintCardComponent = ({ complaint, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  // Format complaint ID dynamically e.g. #CO36CE from MongoDB _id
  const formattedId = complaint?._id
    ? `#${complaint._id.toString().slice(-6).toUpperCase()}`
    : '#UNKNOWN';

  const formattedDate = complaint?.createdAt
    ? new Date(complaint.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '';

  const proofCount = complaint?.proofImages?.length || 0;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {/* Top Header: Formatted ID & Status */}
        <View style={styles.headerRow}>
          <View style={styles.idContainer}>
            <Text style={styles.complaintId}>{formattedId}</Text>
          </View>
          <StatusBadge status={complaint?.status} />
        </View>

        {/* Complaint Title */}
        <Text style={styles.title} numberOfLines={2}>
          {complaint?.title}
        </Text>

        {/* Description Snippet if present */}
        {complaint?.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {complaint.description}
          </Text>
        ) : null}

        {/* Footer Info Row */}
        <View style={styles.footerRow}>
          <View style={styles.leftInfo}>
            <CategoryBadge category={complaint?.category} />
            
            <View style={styles.infoPill}>
              <Home size={13} color={COLORS.textMuted} />
              <Text style={styles.infoText}>
                {complaint?.hostel}, Rm {complaint?.roomNumber}
              </Text>
            </View>
          </View>

          <View style={styles.rightInfo}>
            {proofCount > 0 ? (
              <View style={styles.proofPill}>
                <ImageIcon size={13} color={COLORS.primary} />
                <Text style={styles.proofText}>{proofCount}</Text>
              </View>
            ) : null}
            <ChevronRight size={18} color={COLORS.textMuted} />
          </View>
        </View>

        {/* Timestamp sub-row */}
        <View style={styles.dateRow}>
          <Calendar size={12} color={COLORS.textMuted} />
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Memoize component to eliminate redundant re-renders when rendering 500+ items
export const ComplaintCard = memo(ComplaintCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.complaint?._id === nextProps.complaint?._id &&
    prevProps.complaint?.status === nextProps.complaint?.status &&
    prevProps.complaint?.updatedAt === nextProps.complaint?.updatedAt
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idContainer: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
  },
  complaintId: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    fontSize: 12,
    color: COLORS.primary,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  rightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  proofPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  proofText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
});
