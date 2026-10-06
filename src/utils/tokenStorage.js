import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'hostelsaathi_student_accessToken';
const REFRESH_TOKEN_KEY = 'hostelsaathi_student_refreshToken';
const USER_KEY = 'hostelsaathi_student_user';

// Fallback in-memory / web storage implementation if SecureStore is unavailable
const memoryStorage = new Map();

export const setAccessToken = async (token) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch (error) {
    memoryStorage.set(TOKEN_KEY, token);
  }
};

export const getAccessToken = async () => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    return memoryStorage.get(TOKEN_KEY) || null;
  }
};

export const setRefreshToken = async (token) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    }
  } catch (error) {
    memoryStorage.set(REFRESH_TOKEN_KEY, token);
  }
};

export const getRefreshToken = async () => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    return memoryStorage.get(REFRESH_TOKEN_KEY) || null;
  }
};

export const setUserData = async (user) => {
  try {
    const jsonValue = JSON.stringify(user);
    if (Platform.OS === 'web') {
      localStorage.setItem(USER_KEY, jsonValue);
    } else {
      await SecureStore.setItemAsync(USER_KEY, jsonValue);
    }
  } catch (error) {
    memoryStorage.set(USER_KEY, JSON.stringify(user));
  }
};

export const getUserData = async () => {
  try {
    let jsonValue;
    if (Platform.OS === 'web') {
      jsonValue = localStorage.getItem(USER_KEY);
    } else {
      jsonValue = await SecureStore.getItemAsync(USER_KEY);
    }
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    const mem = memoryStorage.get(USER_KEY);
    return mem ? JSON.parse(mem) : null;
  }
};

export const clearTokens = async () => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  } catch (error) {
    memoryStorage.clear();
  }
};
