import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

export const GlossyButton = ({
  title,
  onPress,
  icon: Icon,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'dark'
  disabled = false,
  style,
  textStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const getGradientColors = () => {
    if (disabled) return ['#94a3b8', '#64748b'];
    switch (variant) {
      case 'primary':
        return ['#6366f1', '#4f46e5', '#3730a3']; // Indigo modern glossy gradient
      case 'secondary':
        return ['#3b82f6', '#2563eb', '#1d4ed8']; // Blue glossy
      case 'dark':
        return ['#0f172a', '#1e293b', '#020617']; // Slate dark glossy
      case 'danger':
        return ['#f43f5e', '#e11d48', '#be123c']; // Rose glossy
      case 'outline':
        return ['#ffffff', '#f8fafc'];
      default:
        return ['#6366f1', '#4f46e5'];
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled}
        style={styles.touchable}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradientContainer,
            variant === 'outline' && styles.outlineBorder,
          ]}
        >
          {/* Glass Highlight Shine Bar */}
          <View style={styles.glassShine} pointerEvents="none" />

          <View style={styles.contentRow} pointerEvents="none">
            {Icon ? <Icon size={18} color={variant === 'outline' ? COLORS.primary : '#ffffff'} /> : null}
            <Text
              style={[
                styles.buttonText,
                variant === 'outline' && styles.outlineText,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  gradientContainer: {
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  outlineBorder: {
    borderColor: COLORS.primaryBorder,
    borderWidth: 1.5,
  },
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  outlineText: {
    color: COLORS.primary,
  },
});
