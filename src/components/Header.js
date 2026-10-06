import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const akgecLogo = require('../../assets/akgec-logo.png');
const nameLogo = require('../../assets/name.png');

export const Header = () => {
  return (
    <View style={styles.container}>
      {/* Ambient Gradient Top Border Line */}
      <View style={styles.gradientLine} />

      {/* Main Navbar Bar */}
      <View style={styles.navbar}>
        <View style={styles.logoRow}>
          {/* AKGEC Crest Logo */}
          <View style={styles.logoBadge}>
            <Image source={akgecLogo} style={styles.akgecImg} resizeMode="contain" />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* HostelSaathi Brand Logo */}
          <Image source={nameLogo} style={styles.nameImg} resizeMode="contain" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  gradientLine: {
    height: 4,
    backgroundColor: COLORS.primary,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  akgecImg: {
    height: 36,
    width: 36,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  nameImg: {
    height: 34,
    width: 140,
  },
});
