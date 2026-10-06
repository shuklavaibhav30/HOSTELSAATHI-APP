import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  getAccessToken,
  setAccessToken,
  setRefreshToken,
  getUserData,
  setUserData,
  clearTokens
} from '../utils/tokenStorage';
import { loginStudent, getCurrentUser, logoutUser } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore persistent auth session on startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await getAccessToken();
        const savedUser = await getUserData();

        if (savedToken) {
          setToken(savedToken);
          if (savedUser) {
            setUser(savedUser);
          }
          // Verify & refresh user info from backend /auth/me
          try {
            const meRes = await getCurrentUser();
            if (meRes?.data) {
              setUser(meRes.data);
              await setUserData(meRes.data);
            }
          } catch (meErr) {
            // Token expired or invalid
            await clearTokens();
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Session restore error:', error);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const res = await loginStudent(email, password);
    const { accessToken, refreshToken, user: loggedUser } = res.data;

    // Enforce student role only for mobile app
    if (loggedUser.role !== 'student') {
      throw new Error('Access denied. Admin and Wardens must use the admin web portal.');
    }

    await setAccessToken(accessToken);
    if (refreshToken) {
      await setRefreshToken(refreshToken);
    }
    await setUserData(loggedUser);

    setToken(accessToken);
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      await clearTokens();
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = async (updatedData) => {
    const newObj = { ...user, ...updatedData };
    setUser(newObj);
    await setUserData(newObj);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
