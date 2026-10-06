import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Phone, Home, Settings, LogOut, ChevronRight, UserCheck } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { AccountSettingsModal } from '../components/AccountSettingsModal';
import { COLORS } from '../constants/colors';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your HostelSaathi account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MY PROFILE</Text>
        </View>

        {/* Profile Card */}
        <Animated.View style={[styles.profileCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={['#3b82f6', '#1d4ed8']}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </Text>
          </LinearGradient>

          <Text style={styles.userName}>{user?.name || 'Student Name'}</Text>
          
          <View style={styles.hostelTag}>
            <Home size={13} color={COLORS.primary} />
            <Text style={styles.hostelTagText}>
              {user?.hostel || 'Hostel'}, Room {user?.roomNumber || 'N/A'}
            </Text>
          </View>
        </Animated.View>

        {/* Info Section */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>ACCOUNT DETAILS</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Mail size={18} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Phone size={18} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{user?.phone ? `+91 ${user.phone}` : 'Not added yet'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Home size={18} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Room Number</Text>
              <Text style={styles.infoValue}>{user?.hostel || 'Hostel'}, Room {user?.roomNumber || 'N/A'}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setSettingsModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.iconBox, { backgroundColor: COLORS.primaryLight }]}>
                <Settings size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Account Settings</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, styles.logoutRow]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
                <LogOut size={18} color={COLORS.error} />
              </View>
              <Text style={[styles.actionText, { color: COLORS.error }]}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Account Settings Modal */}
      <AccountSettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 16,
    paddingBottom: 28,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerTitle: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  profileCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarGradient: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    marginBottom: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 34,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 21,
    fontWeight: '800',
  },
  hostelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderPrimary,
    gap: 6,
    marginTop: 2,
  },
  hostelTagText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  infoValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  logoutRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 2,
  },
});
