import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated } from 'react-native';
import { Check, UserCheck } from 'lucide-react-native';
import { COLORS } from '../constants/colors';

export const ProfileSuccessModal = ({ visible, onDone }) => {
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

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalCard, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          {/* Animated Green Circle with Check Icon */}
          <View style={styles.checkCircle}>
            <Check size={48} color="#ffffff" strokeWidth={3.5} />
          </View>

          {/* Main Title */}
          <Text style={styles.title}>Profile Settings Updated!</Text>

          {/* Subtitle Message */}
          <View style={styles.textBox}>
            <Text style={styles.mainMessageText}>
              Your account details have been successfully updated.
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.actionBtn} onPress={onDone} activeOpacity={0.85}>
            <UserCheck size={18} color="#ffffff" />
            <Text style={styles.actionBtnText}>Done</Text>
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
  textBox: {
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  mainMessageText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    width: '100%',
    height: 50,
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
