import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
  Image,
  useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Lock, Home, Hash, ArrowRight, CheckCircle2, X, Bell, ShieldCheck, MailCheck, UserPlus } from 'lucide-react-native';
import { CustomDropdown } from '../components/CustomDropdown';
import { GlossyButton } from '../components/GlossyButton';
import { sendOtp, verifyOtp, registerStudent } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import { validateStudentNo, validateEmail, validateRoomNumber } from '../utils/validators';

const akgecLogo = require('../../assets/akgec-logo.png');
const nameLogo = require('../../assets/name.png');

const HOSTELS = [
  'BOYS HOSTEL 1',
  'BOYS HOSTEL 2',
  'BOYS HOSTEL 3',
  'GIRLS HOSTEL 1',
  'GIRLS HOSTEL 2',
  'GIRLS HOSTEL 3',
];

export const RegisterScreen = ({ navigation }) => {
  const { login } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const isWide = windowWidth > 768;

  const [name, setName] = useState('');
  const [studentNo, setStudentNo] = useState('');
  const [hostel, setHostel] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [registering, setRegistering] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = async () => {
    setErrorMsg('');
    if (!name.trim() || !studentNo.trim() || !hostel || !roomNumber.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all registration fields.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg('Registration is strictly reserved for AKGEC student emails (@akgec.ac.in).');
      return;
    }

    if (!validateStudentNo(studentNo)) {
      setErrorMsg('Invalid Student Number (Must start with 23, 24, 25, or 26 followed by 5-6 digits, e.g. 2410082).');
      return;
    }

    if (!validateRoomNumber(roomNumber)) {
      setErrorMsg('Room number must be between 100 and 700 (e.g. 302, 700).');
      return;
    }

    try {
      setSendingOtp(true);
      await sendOtp(email.trim());
      setOtpModalVisible(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setErrorMsg(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.trim().length !== 6) {
      Alert.alert('Verification Error', 'Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    try {
      setVerifyingOtp(true);
      await verifyOtp(email.trim(), otp.trim());
      setOtpVerified(true);
      setOtpModalVisible(false);

      // Perform student registration immediately after verification
      handleFinalRegister();
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP code entered. Please try again.';
      Alert.alert('Verification Failed', msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleFinalRegister = async () => {
    try {
      setRegistering(true);
      await registerStudent({
        name: name.trim(),
        studentNo: studentNo.trim(),
        hostel,
        roomNumber: roomNumber.trim(),
        email: email.trim(),
        password,
      });

      Alert.alert('Registration Successful', 'Your student account has been created successfully!');
      
      // Auto login
      await login(email.trim(), password);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete registration.';
      setErrorMsg(msg);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background Soft Linear Gradient */}
      <LinearGradient
        colors={['#f8fafc', '#edf2fe', '#e2e8f0']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScrollView
          style={styles.scrollViewStyle}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          {/* Main Container Card Centered Vertically & Horizontally */}
          <View style={[styles.mainCard, isWide && styles.mainCardWide]}>
            
            {/* Left Hero Panel (Desktop / Wide Screens) */}
            {isWide && (
              <View style={styles.heroPanel}>
                <View style={styles.heroHeader}>
                  <View style={styles.akgecBadge}>
                    <Image source={akgecLogo} style={styles.akgecImg} resizeMode="contain" />
                  </View>
                  <View style={styles.heroBrandTextGroup}>
                    <Image source={nameLogo} style={styles.nameImgHero} resizeMode="contain" />
                    <Text style={styles.heroSubText}>AKGEC STUDENT PORTAL</Text>
                  </View>
                </View>

                <View style={styles.portalPill}>
                  <Text style={styles.portalPillText}>STUDENT REGISTRATION</Text>
                </View>

                <Text style={styles.heroHeading}>Join Hostel Saathi</Text>
                <Text style={styles.heroSubHeading}>
                  Set up your student account in three quick steps to raise complaints and track grievances.
                </Text>

                <View style={styles.featureCardsGroup}>
                  <View style={styles.featureCard}>
                    <View style={styles.featureIconBox}>
                      <MailCheck size={18} color="#0f172a" />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>1. Verify College Email</Text>
                      <Text style={styles.featureSub}>Must be an official @akgec.ac.in address</Text>
                    </View>
                  </View>

                  <View style={styles.featureCard}>
                    <View style={styles.featureIconBox}>
                      <ShieldCheck size={18} color="#0f172a" />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>2. Validate 6-Digit OTP</Text>
                      <Text style={styles.featureSub}>Secure instant email verification</Text>
                    </View>
                  </View>

                  <View style={styles.featureCard}>
                    <View style={styles.featureIconBox}>
                      <UserPlus size={18} color="#0f172a" />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>3. Complete Profile</Text>
                      <Text style={styles.featureSub}>Set room number, hostel & password</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.taglineRow}>
                  <Bell size={14} color={COLORS.textMuted} />
                  <Text style={styles.taglineText}>Simple. Transparent. Connected.</Text>
                </View>
              </View>
            )}

            {/* Right Form Panel */}
            <View style={[styles.formPanel, isWide && styles.formPanelWide]}>
              
              {/* Mobile Header Logos */}
              {!isWide && (
                <View style={styles.mobileBrandContainer}>
                  <View style={styles.mobileLogoRow}>
                    <View style={styles.akgecBadgeMobile}>
                      <Image source={akgecLogo} style={styles.akgecImgMobile} resizeMode="contain" />
                    </View>
                    <View style={styles.mobileDivider} />
                    <Image source={nameLogo} style={styles.nameImgMobile} resizeMode="contain" />
                  </View>
                  <Text style={styles.mobileBrandSub}>AKGEC STUDENT PORTAL</Text>
                </View>
              )}

              {/* Form Title */}
              <View style={styles.formHeader}>
                <Text style={styles.welcomeTitle}>Create your account</Text>
                <Text style={styles.welcomeSub}>Verify your college email address to get started.</Text>
              </View>

              {/* 3-Step Progress Indicator Header */}
              <View style={styles.stepperContainer}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, styles.stepCircleActive]}>
                    <Text style={styles.stepCircleTextActive}>1</Text>
                  </View>
                  <Text style={[styles.stepLabel, styles.stepLabelActive]}>EMAIL</Text>
                </View>

                <View style={styles.stepperLine} />

                <View style={styles.stepItem}>
                  <View style={styles.stepCircle}>
                    <Text style={styles.stepCircleText}>2</Text>
                  </View>
                  <Text style={styles.stepLabel}>VERIFY</Text>
                </View>

                <View style={styles.stepperLine} />

                <View style={styles.stepItem}>
                  <View style={styles.stepCircle}>
                    <Text style={styles.stepCircleText}>3</Text>
                  </View>
                  <Text style={styles.stepLabel}>DETAILS</Text>
                </View>
              </View>

              {/* Full Name */}
              <View style={styles.field}>
                <Text style={styles.label}>FULL NAME</Text>
                <View style={styles.inputBox}>
                  <User size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Rahul Sharma"
                    placeholderTextColor={COLORS.textMuted}
                    value={name}
                    onChangeText={(val) => {
                      setName(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                  />
                </View>
              </View>

              {/* Student Registration Number */}
              <View style={styles.field}>
                <Text style={styles.label}>STUDENT REG NO / ROLL NO</Text>
                <View style={styles.inputBox}>
                  <Hash size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2410082"
                    placeholderTextColor={COLORS.textMuted}
                    value={studentNo}
                    onChangeText={(val) => {
                      setStudentNo(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                  />
                </View>
              </View>

              {/* Hostel Selector */}
              <CustomDropdown
                label="ASSIGNED HOSTEL"
                options={HOSTELS}
                value={hostel}
                onSelect={(val) => {
                  setHostel(val);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Select your hostel"
              />

              {/* Room Number */}
              <View style={styles.field}>
                <Text style={styles.label}>ROOM NUMBER</Text>
                <View style={styles.inputBox}>
                  <Home size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 302"
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

              {/* College Email */}
              <View style={styles.field}>
                <Text style={styles.label}>AKGEC STUDENT EMAIL</Text>
                <View style={styles.inputBox}>
                  <Mail size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="rahul2410082@akgec.ac.in"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.field}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={styles.inputBox}>
                  <Lock size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Create a strong password"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    secureTextEntry
                  />
                </View>
              </View>

              {/* Error Message */}
              {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}

              {/* Verify & Register Button */}
              {sendingOtp || registering ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#0f172a" size="large" />
                </View>
              ) : (
                <GlossyButton
                  title="Verify OTP & Register"
                  onPress={handleSendOtp}
                  icon={ArrowRight}
                  variant="dark"
                  style={styles.registerBtn}
                />
              )}

              <View style={styles.loginLinkRow}>
                <Text style={styles.loginLinkText}>Already registered?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginHighlight}>Sign in to your account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Enter and Verify OTP Modal */}
      <Modal visible={otpModalVisible} transparent animationType="fade" onRequestClose={() => setOtpModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter and Verify OTP</Text>
              <TouchableOpacity onPress={() => setOtpModalVisible(false)}>
                <X size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Enter the 6-digit OTP sent to <Text style={styles.emailHighlight}>{email}</Text>
            </Text>

            <View style={styles.otpInputBox}>
              <TextInput
                style={styles.otpInput}
                placeholder="──────"
                placeholderTextColor={COLORS.textMuted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyOtp} disabled={verifyingOtp}>
              {verifyingOtp ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <CheckCircle2 size={18} color="#ffffff" />
                  <Text style={styles.verifyBtnText}>Verify & Complete Registration</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  scrollViewStyle: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web' ? { overflowY: 'auto' } : {}),
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  mainCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginVertical: 'auto',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 4,
  },
  mainCardWide: {
    maxWidth: 960,
    flexDirection: 'row',
  },
  heroPanel: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    padding: 36,
    justifyContent: 'center',
    gap: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  akgecBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  akgecImg: {
    height: 34,
    width: 34,
  },
  heroBrandTextGroup: {
    gap: 2,
  },
  nameImgHero: {
    height: 30,
    width: 130,
  },
  heroSubText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  portalPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 4,
  },
  portalPillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroHeading: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroSubHeading: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  featureCardsGroup: {
    gap: 10,
    marginTop: 6,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
  },
  featureSub: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  taglineText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  formPanel: {
    padding: 28,
    gap: 16,
  },
  formPanelWide: {
    flex: 1.1,
    padding: 36,
    justifyContent: 'center',
  },
  mobileBrandContainer: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  mobileLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  akgecBadgeMobile: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  akgecImgMobile: {
    height: 32,
    width: 32,
  },
  mobileDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#cbd5e1',
  },
  nameImgMobile: {
    height: 30,
    width: 125,
  },
  mobileBrandSub: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  formHeader: {
    gap: 4,
  },
  welcomeTitle: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  welcomeSub: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#0f172a',
  },
  stepCircleText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
  },
  stepCircleTextActive: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  stepLabel: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stepLabelActive: {
    color: '#0f172a',
  },
  stepperLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#cbd5e1',
    marginTop: -12,
  },
  field: {
    gap: 6,
  },
  label: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerBtn: {
    marginTop: 4,
  },
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  loginLinkText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
  },
  loginHighlight: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlayBg,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  modalSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  emailHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  otpInputBox: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
    width: '100%',
  },
  verifyBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 48,
    gap: 8,
  },
  verifyBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
