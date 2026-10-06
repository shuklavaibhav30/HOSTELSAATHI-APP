import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Mail, Lock, KeyRound, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { forgotPasswordSendOtp, forgotPasswordVerifyOtp, resetPassword } from '../api/authApi';
import { COLORS } from '../constants/colors';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = async () => {
    setErrorMsg('');
    if (!email.trim()) {
      setErrorMsg('Please enter your college email address.');
      return;
    }

    try {
      setLoading(true);
      await forgotPasswordSendOtp(email.trim());
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP to email.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg('');
    if (!otp.trim()) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }

    try {
      setLoading(true);
      await forgotPasswordVerifyOtp(email.trim(), otp.trim());
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMsg('');
    if (!newPassword.trim()) {
      setErrorMsg('Please enter your new password.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email.trim(), newPassword);
      Alert.alert('Password Reset Success', 'Your password has been reset successfully. Please sign in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reset Password</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            {step === 1 && (
              <>
                <Text style={styles.stepTitle}>Step 1: Enter College Email</Text>
                <Text style={styles.stepSub}>We will send a 6-digit OTP to verify your account identity.</Text>

                <View style={styles.inputBox}>
                  <Mail size={18} color={COLORS.textMuted} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="student@akgec.ac.in"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}

                <TouchableOpacity style={styles.submitBtn} onPress={handleSendOtp} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Text style={styles.submitBtnText}>Send Verification OTP</Text>
                      <ArrowRight size={18} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.stepTitle}>Enter and Verify OTP</Text>
                <Text style={styles.stepSub}>Enter the OTP sent to <Text style={styles.emailHighlight}>{email}</Text></Text>

                <View style={styles.otpBox}>
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

                {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}

                <TouchableOpacity style={styles.submitBtn} onPress={handleVerifyOtp} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} color="#ffffff" />
                      <Text style={styles.submitBtnText}>Verify OTP Code</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {step === 3 && (
              <>
                <Text style={styles.stepTitle}>Create New Password</Text>
                <Text style={styles.stepSub}>Set a strong new password for your HostelSaathi account.</Text>

                <View style={styles.inputBox}>
                  <Lock size={18} color={COLORS.textMuted} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor={COLORS.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                </View>

                {errorMsg ? <Text style={styles.errorText}>⚠️ {errorMsg}</Text> : null}

                <TouchableOpacity style={styles.submitBtn} onPress={handleResetPassword} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <KeyRound size={18} color="#ffffff" />
                      <Text style={styles.submitBtnText}>Reset Password</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    gap: 16,
  },
  stepTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  stepSub: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  emailHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 50,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  otpBox: {
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
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    gap: 8,
    marginTop: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
