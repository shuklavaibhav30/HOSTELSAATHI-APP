import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated } from 'react-native';
import { Check, Mail, ArrowRight } from 'lucide-react-native';
import { COLORS } from '../constants/colors';

export const ComplaintSuccessModal = ({ visible, complaintId, onDone }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const formattedId = complaintId
    ? `#${complaintId.toString().slice(-6).toUpperCase()}`
    : '#SUBMITTED';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalCard, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          {/* Animated Green Circle with Check Icon */}
          <View style={styles.checkCircle}>
            <Check size={48} color="#ffffff" strokeWidth={3.5} />
          </View>

          {/* Main Title */}
          <Text style={styles.title}>Complaint Submitted!</Text>

          {/* Formatted Complaint ID Badge */}
          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>{formattedId}</Text>
          </View>

          {/* Message Text */}
          <View style={styles.textBox}>
            <Text style={styles.mainMessageText}>
              Complaint locked. It will be resolved shortly.
            </Text>
            <View style={styles.emailRow}>
              <Mail size={16} color={COLORS.primary} />
              <Text style={styles.emailText}>Check your email for more updates</Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.actionBtn} onPress={onDone} activeOpacity={0.85}>
            <Text style={styles.actionBtnText}>View Complaints Feed</Text>
            <ArrowRight size={18} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 28,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  checkCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.resolved,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.resolved,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  idBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
  },
  idBadgeText: {
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 14,
    color: COLORS.primary,
  },
  textBox: {
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  mainMessageText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emailText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    width: '100%',
    height: 52,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
