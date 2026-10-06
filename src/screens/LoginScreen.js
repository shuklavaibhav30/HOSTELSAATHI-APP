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
  Image,
  useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, MessageSquare, Clock, Bell } from 'lucide-react-native';
import { GlossyButton } from '../components/GlossyButton';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const akgecLogo = require('../../assets/akgec-logo.png');
const nameLogo = require('../../assets/name.png');

export const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const isWide = windowWidth > 768;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (err) {
      const backendError = err.response?.data?.message || err.message || 'Invalid user credentials entered';
      setErrorMessage(backendError);
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
            
            {/* Left Hero Panel (Visible on Desktop / Web Wide Screens) */}
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
                  <Text style={styles.portalPillText}>STUDENT PORTAL</Text>
                </View>

                <Text style={styles.heroHeading}>Your hostel, your voice.</Text>
                <Text style={styles.heroSubHeading}>
                  Raise concerns, track complaint status, and stay updated with your hostel administration in real-time.
                </Text>

                <View style={styles.featureCardsGroup}>
                  <View style={styles.featureCard}>
                    <View style={styles.featureIconBox}>
                      <MessageSquare size={18} color="#0f172a" />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>Raise Complaints</Text>
                      <Text style={styles.featureSub}>Submit grievances directly to hostel wardens</Text>
                    </View>
                  </View>

                  <View style={styles.featureCard}>
                    <View style={styles.featureIconBox}>
                      <Clock size={18} color="#0f172a" />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>Track Progress</Text>
                      <Text style={styles.featureSub}>View horizontal timeline & audit history</Text>
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
              
              {/* Brand Header for Mobile Viewport */}
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

              <View style={styles.formHeader}>
                <Text style={styles.welcomeTitle}>Welcome back</Text>
                <Text style={styles.welcomeSub}>Sign in to your Hostel Saathi account.</Text>
              </View>

              {/* Email Field */}
              <View style={styles.field}>
                <Text style={styles.label}>COLLEGE EMAIL</Text>
                <View style={styles.inputBox}>
                  <Mail size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="student@akgec.ac.in"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (errorMessage) setErrorMessage('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.field}>
                <View style={styles.labelHeaderRow}>
                  <Text style={styles.label}>PASSWORD</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.forgotLink}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputBox}>
                  <Lock size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••••••"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={(val) => {
                      setPassword(val);
                      if (errorMessage) setErrorMessage('');
                    }}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    {showPassword ? (
                      <EyeOff size={18} color={COLORS.textMuted} />
                    ) : (
                      <Eye size={18} color={COLORS.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Red Error Message Box */}
              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <AlertCircle size={18} color={COLORS.error} />
                  <Text style={styles.errorBannerText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Dark Glossy Sign In Button */}
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#0f172a" size="large" />
                </View>
              ) : (
                <GlossyButton
                  title="Sign In"
                  onPress={handleLogin}
                  variant="dark"
                  style={styles.signInBtn}
                />
              )}

              {/* Create Account Link */}
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>New to the hostel?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>Create an account</Text>
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
    maxWidth: 440,
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
    maxWidth: 920,
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
    gap: 18,
  },
  formPanelWide: {
    flex: 1,
    padding: 40,
    justifyContent: 'center',
  },
  mobileBrandContainer: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
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
  field: {
    gap: 6,
  },
  labelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  forgotLink: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
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
  eyeBtn: {
    padding: 6,
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
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  loadingContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInBtn: {
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  footerText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
  },
  registerLink: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
  },
});
