import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Alert,
  Image,
  useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User, Mail, Lock, Home, Hash, ArrowRight, ArrowLeft, Check, ShieldCheck, MailCheck, UserPlus, KeyRound, Bell, AlertCircle, Phone, GraduationCap
} from 'lucide-react-native';
import { CustomDropdown } from '../components/CustomDropdown';
import { GlossyButton } from '../components/GlossyButton';
import { sendOtp, verifyOtp, registerStudent } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import { validateStudentNo, validateEmail, validateRoomNumber, validatePhone } from '../utils/validators';

const akgecLogo = require('../../assets/akgec-logo.png');
const nameLogo = require('../../assets/name.png');

const HOSTELS = [
  { label: 'BOYS HOSTEL 1 (BH1)', value: 'BH1' },
  { label: 'BOYS HOSTEL 2 (BH2)', value: 'BH2' },
  { label: 'BOYS HOSTEL 3 (BH3)', value: 'BH3' },
  { label: 'GIRLS HOSTEL 1 (GH1)', value: 'GH1' },
  { label: 'GIRLS HOSTEL 2 (GH2)', value: 'GH2' },
  { label: 'GIRLS HOSTEL 3 (GH3)', value: 'GH3' },
];

const BRANCHES = ['CSE', 'IT', 'CSIT', 'CS(H)', 'CS', 'CSE(DS)', 'CSE(AIML)', 'CE', 'ME', 'ECE/EN'];
const GENDERS = ['Male', 'Female'];

// Modern 3-Step Wizard Indicator Component
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'EMAIL' },
    { num: 2, label: 'VERIFY' },
    { num: 3, label: 'DETAILS' }
  ];

  return (
    <View style={styles.stepperContainer}>
      {steps.map((s, idx) => {
        const isDone = s.num < currentStep;
        const isCurrent = s.num === currentStep;

        return (
          <React.Fragment key={s.num}>
            {idx > 0 && (
              <View
                style={[
                  styles.stepperLine,
                  s.num <= currentStep && styles.stepperLineActive
                ]}
              />
            )}
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isDone && styles.stepCircleDone,
                  isCurrent && styles.stepCircleActive
                ]}
              >
                {isDone ? (
                  <Check size={14} color="#ffffff" />
                ) : (
                  <Text style={[styles.stepCircleText, isCurrent && styles.stepCircleTextActive]}>
                    {s.num}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isDone && styles.stepLabelDone,
                  isCurrent && styles.stepLabelActive
                ]}
              >
                {s.label}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
};

export const RegisterScreen = ({ navigation }) => {
  const { login } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const isWide = windowWidth > 768;

  // Wizard state (1: Email, 2: OTP, 3: Details)
  const [step, setStep] = useState(1);

  // Step 1: Email
  const [email, setEmail] = useState('');

  // Step 2: OTP & Verification
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);

  // Step 3: Full Registration Form (matching backend user Schema)
  const [name, setName] = useState('');
  const [studentNo, setStudentNo] = useState('');
  const [hostel, setHostel] = useState('BH1');
  const [roomNumber, setRoomNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [branch, setBranch] = useState('CSE');
  const [password, setPassword] = useState('');

  // General Loading & Error States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Countdown timer handler for Resend OTP
  const startCountdown = useCallback(() => {
    setCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // === Step 1: Send OTP ===
  const handleSendOtp = async () => {
    setErrorMsg('');
    if (!email.trim()) {
      setErrorMsg('Please enter your college email address.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg('Registration is strictly reserved for AKGEC student emails (@akgec.ac.in).');
      return;
    }

    try {
      setLoading(true);
      await sendOtp(email.trim());
      startCountdown();
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP to your email.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // === Step 2: Verify OTP ===
  const handleVerifyOtp = async () => {
    setErrorMsg('');
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp(email.trim(), cleanOtp);
      const token = res?.data?.token || res?.token;
      if (token) {
        setVerificationToken(token);
      }
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'OTP verification failed.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setErrorMsg('');
    try {
      setLoading(true);
      await sendOtp(email.trim());
      startCountdown();
      Alert.alert('OTP Resent', 'A new 6-digit OTP code has been sent to your email.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend OTP code.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // === Step 3: Complete Registration ===
  const handleFinalRegister = async () => {
    setErrorMsg('');
    
    // Front-end validation for all 10 required fields
    if (!name.trim() || !studentNo.trim() || !hostel || !roomNumber.trim() || !phone.trim() || !password.trim()) {
      setErrorMsg('Please fill in all student profile fields (Name, Roll No, Room No, Phone, Password).');
      return;
    }

    if (!validateStudentNo(studentNo)) {
      setErrorMsg('Invalid Student Number (Must start with 23, 24, 25, or 26 followed by 5-6 digits, e.g. 2410082).');
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMsg('Phone number must be a valid 10-digit mobile number starting with 6-9.');
      return;
    }

    if (!validateRoomNumber(roomNumber)) {
      setErrorMsg('Room number must be between 100 and 700 (e.g. 302, 700).');
      return;
    }

    try {
      setLoading(true);
      await registerStudent({
        name: name.trim(),
        studentNo: studentNo.trim(),
        hostel,
        roomNumber: roomNumber.trim(),
        gender,
        branch,
        phone: phone.trim(),
        email: email.trim(),
        password,
        verificationToken,
      });

      // Auto login user after successful registration
      await login(email.trim(), password);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
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
          {/* Main Card Container Centered on Screen via marginVertical auto */}
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

            {/* Right Wizard Form Panel */}
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

              {/* Form Title & Step Subtitle */}
              <View style={styles.formHeader}>
                <Text style={styles.welcomeTitle}>Create your account</Text>
                <Text style={styles.welcomeSub}>
                  {step === 1 && 'Verify your college email address to get started.'}
                  {step === 2 && 'Enter the 6-digit OTP code sent to your email.'}
                  {step === 3 && 'Enter your details to complete student registration.'}
                </Text>
              </View>

              {/* 3-Step Wizard Progress Indicator */}
              <StepIndicator currentStep={step} />

              {/* ================= STEP 1: EMAIL ================= */}
              {step === 1 && (
                <View style={styles.stepFormGroup}>
                  <View style={styles.field}>
                    <Text style={styles.label}>COLLEGE EMAIL</Text>
                    <View style={styles.inputBox}>
                      <Mail size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="yourname@akgec.ac.in"
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
                    <Text style={styles.hintText}>Only official @akgec.ac.in email addresses are accepted</Text>
                  </View>

                  {errorMsg ? (
                    <View style={styles.errorBanner}>
                      <AlertCircle size={16} color={COLORS.error} />
                      <Text style={styles.errorBannerText}>{errorMsg}</Text>
                    </View>
                  ) : null}

                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#0f172a" size="large" />
                    </View>
                  ) : (
                    <GlossyButton
                      title="Send Verification Code"
                      onPress={handleSendOtp}
                      icon={Mail}
                      variant="dark"
                      style={styles.actionBtn}
                    />
                  )}
                </View>
              )}

              {/* ================= STEP 2: VERIFY OTP ================= */}
              {step === 2 && (
                <View style={styles.stepFormGroup}>
                  {/* Readonly Email Row with Change Button */}
                  <View style={styles.field}>
                    <Text style={styles.label}>COLLEGE EMAIL</Text>
                    <View style={[styles.inputBox, styles.readOnlyInputBox]}>
                      <Mail size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, styles.readOnlyInputText]}
                        value={email}
                        editable={false}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          setStep(1);
                          setOtp('');
                          setErrorMsg('');
                        }}
                        style={styles.changeEmailBtn}
                      >
                        <Text style={styles.changeEmailText}>Change</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* 6-Digit OTP Field */}
                  <View style={styles.field}>
                    <Text style={styles.label}>6-DIGIT OTP CODE</Text>
                    <View style={[styles.inputBox, styles.otpInputBox]}>
                      <KeyRound size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.otpInputText}
                        placeholder="••••••"
                        placeholderTextColor={COLORS.textMuted}
                        value={otp}
                        onChangeText={(val) => {
                          setOtp(val.replace(/\D/g, '').slice(0, 6));
                          if (errorMsg) setErrorMsg('');
                        }}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>
                  </View>

                  {errorMsg ? (
                    <View style={styles.errorBanner}>
                      <AlertCircle size={16} color={COLORS.error} />
                      <Text style={styles.errorBannerText}>{errorMsg}</Text>
                    </View>
                  ) : null}

                  {/* Verify OTP Button */}
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#0f172a" size="large" />
                    </View>
                  ) : (
                    <GlossyButton
                      title="Verify OTP"
                      onPress={handleVerifyOtp}
                      icon={ShieldCheck}
                      variant="dark"
                      style={styles.actionBtn}
                    />
                  )}

                  {/* Resend OTP Timer & Button */}
                  <View style={styles.resendContainer}>
                    {countdown > 0 ? (
                      <Text style={styles.resendTimerText}>
                        Resend code in <Text style={styles.resendCountdownBold}>{countdown}s</Text>
                      </Text>
                    ) : (
                      <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                        <Text style={styles.resendLinkText}>Didn't receive code? Resend OTP</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* ================= STEP 3: DETAILS ================= */}
              {step === 3 && (
                <View style={styles.stepFormGroup}>
                  {/* Verified Email Banner */}
                  <View style={styles.verifiedBadgeBanner}>
                    <ShieldCheck size={18} color="#16a34a" />
                    <View style={styles.verifiedBadgeTextGroup}>
                      <Text style={styles.verifiedBadgeTitle}>VERIFIED EMAIL</Text>
                      <Text style={styles.verifiedBadgeEmail} numberOfLines={1}>{email}</Text>
                    </View>
                  </View>

                  {/* Full Name */}
                  <View style={styles.field}>
                    <Text style={styles.label}>FULL NAME</Text>
                    <View style={styles.inputBox}>
                      <User size={18} color={COLORS.textMuted} style={styles.inputIcon} />
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

                  {/* Student Roll No */}
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

                  {/* Mobile Phone Number */}
                  <View style={styles.field}>
                    <Text style={styles.label}>10-DIGIT MOBILE PHONE</Text>
                    <View style={styles.inputBox}>
                      <Phone size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. 9876543210"
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

                  {/* Branch Dropdown */}
                  <CustomDropdown
                    label="ACADEMIC BRANCH"
                    options={BRANCHES}
                    value={branch}
                    onSelect={(val) => {
                      setBranch(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Select branch"
                  />

                  {/* Gender Dropdown */}
                  <CustomDropdown
                    label="GENDER"
                    options={GENDERS}
                    value={gender}
                    onSelect={(val) => {
                      setGender(val);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Select gender"
                  />

                  {/* Hostel Dropdown */}
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

                  {errorMsg ? (
                    <View style={styles.errorBanner}>
                      <AlertCircle size={16} color={COLORS.error} />
                      <Text style={styles.errorBannerText}>{errorMsg}</Text>
                    </View>
                  ) : null}

                  {/* Action Buttons Row: Back + Complete Registration */}
                  <View style={styles.buttonActionRow}>
                    <TouchableOpacity
                      onPress={() => setStep(2)}
                      style={styles.backBtn}
                      disabled={loading}
                    >
                      <ArrowLeft size={16} color="#0f172a" />
                      <Text style={styles.backBtnText}>Back</Text>
                    </TouchableOpacity>

                    <View style={styles.completeBtnWrap}>
                      {loading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator color="#0f172a" size="small" />
                        </View>
                      ) : (
                        <GlossyButton
                          title="Complete Registration"
                          onPress={handleFinalRegister}
                          icon={UserPlus}
                          variant="dark"
                        />
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* Already registered sign-in link */}
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 4,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#0f172a',
  },
  stepCircleDone: {
    backgroundColor: '#10b981',
  },
  stepCircleText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
  },
  stepCircleTextActive: {
    color: '#ffffff',
  },
  stepLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stepLabelActive: {
    color: '#0f172a',
  },
  stepLabelDone: {
    color: '#10b981',
  },
  stepperLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
    marginTop: -14,
  },
  stepperLineActive: {
    backgroundColor: '#0f172a',
  },
  stepFormGroup: {
    gap: 16,
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
  hintText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
  },
  readOnlyInputBox: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  readOnlyInputText: {
    color: '#475569',
    fontWeight: '600',
  },
  changeEmailBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  changeEmailText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '800',
  },
  otpInputBox: {
    justifyContent: 'center',
  },
  otpInputText: {
    flex: 1,
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    paddingTop: 4,
  },
  resendTimerText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  resendCountdownBold: {
    color: '#0f172a',
    fontWeight: '800',
  },
  resendLinkText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  verifiedBadgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  verifiedBadgeTextGroup: {
    flex: 1,
  },
  verifiedBadgeTitle: {
    color: '#15803d',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  verifiedBadgeEmail: {
    color: '#14532d',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  buttonActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
    gap: 6,
  },
  backBtnText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
  },
  completeBtnWrap: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  errorBannerText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  loadingContainer: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    marginTop: 2,
  },
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
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
});
