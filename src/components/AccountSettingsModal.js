import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { X, Phone, User, Home, Save } from 'lucide-react-native';
import { GlossyButton } from './GlossyButton';
import { ProfileSuccessModal } from './ProfileSuccessModal';
import { useAuth } from '../context/AuthContext';
import { updateAccountDetails } from '../api/authApi';
import { COLORS } from '../constants/colors';
import { validatePhone, validateRoomNumber } from '../utils/validators';

export const AccountSettingsModal = ({ visible, onClose }) => {
  const { user, updateUser } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [roomNumber, setRoomNumber] = useState(user?.roomNumber || '');
  const [phone, setPhone] = useState(user?.phone || user?.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (visible && user) {
      setName(user.name || '');
      setRoomNumber(user.roomNumber || '');
      setPhone(user.phone || user.phoneNumber || '');
      setErrorMsg('');
    }
  }, [visible, user]);

  if (!visible && !showSuccessModal) return null;

  const performUpdate = async () => {
    try {
      setLoading(true);
      const res = await updateAccountDetails({
        name: name.trim(),
        roomNumber: roomNumber.trim(),
        phone: phone.trim(),
      });

      if (res?.data) {
        await updateUser(res.data);
      }
      onClose(); // Hide settings modal
      setShowSuccessModal(true); // Trigger animated success tick modal
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update account details.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setErrorMsg('');
    
    if (!name.trim() && !roomNumber.trim() && !phone.trim()) {
      setErrorMsg('At least one field (Name, Room Number, or Phone) is required.');
      return;
    }

    if (phone.trim() && !validatePhone(phone)) {
      setErrorMsg('Phone number must be a valid 10-digit mobile number starting with 6-9.');
      return;
    }

    if (roomNumber.trim() && !validateRoomNumber(roomNumber)) {
      setErrorMsg('Room number must be between 100 and 700 (e.g. 302, 700).');
      return;
    }

    // Cross-platform Confirmation Alert (window.confirm on web, Alert.alert on native)
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure to update your account info?');
      if (confirmed) {
        performUpdate();
      }
    } else {
      Alert.alert(
        'Update Account Settings',
        'Are you sure to update your account info?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes, Update', onPress: performUpdate },
        ]
      );
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Update Account Settings</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Clean Editable Fields */}
            <View style={styles.formSection}>
              {/* Student Name */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <View style={styles.inputBox}>
                  <User size={16} color={COLORS.textMuted} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Vaibhav Shukla"
                    placeholderTextColor={COLORS.textMuted}
                    value={name}
                    onChangeText={(val) => {
                      setName(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                  />
                </View>
              </View>

              {/* Room Number */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Room Number (100 - 700)</Text>
                <View style={styles.inputBox}>
                  <Home size={16} color={COLORS.textMuted} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 301"
                    placeholderTextColor={COLORS.textMuted}
                    value={roomNumber}
                    onChangeText={(val) => {
                      setRoomNumber(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Phone Number */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>10-Digit Mobile Phone</Text>
                <View style={styles.inputBox}>
                  <Phone size={16} color={COLORS.textMuted} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 8400777282"
                    placeholderTextColor={COLORS.textMuted}
                    value={phone}
                    onChangeText={(val) => {
                      setPhone(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}
            </View>

            {/* Action Row */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <View style={styles.saveBtnWrap}>
                {loading ? (
                  <ActivityIndicator color={COLORS.primary} size="small" />
                ) : (
                  <GlossyButton
                    title="Save Changes"
                    onPress={handleSave}
                    icon={Save}
                    variant="primary"
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Animated Profile Success Modal */}
      <ProfileSuccessModal
        visible={showSuccessModal}
        onDone={() => setShowSuccessModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlayBg,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  formSection: {
    gap: 14,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 48,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.cardBgLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtnWrap: {
    flex: 1.5,
  },
});
