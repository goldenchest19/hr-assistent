import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../utils/api';

// Создаем контекст авторизации
const AuthContext = createContext(null);

// Ключи для хранения данных в localStorage
const AUTH_STORAGE_KEY = 'hr_partner_auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Инициализация состояния из localStorage при загрузке
  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        setUser(parsedAuth.user);
        setToken(parsedAuth.token);
      } catch (error) {
        console.error('Ошибка при парсинге данных авторизации:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Вход через API
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      // Ожидаем, что backend возвращает токен и пользователя
      const data = response.data;
          const authData = {
        user: data.user || { email: data.email || email },
        token: data.token || data.accessToken || data.jwt || data.tokenValue || data,
          };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      setUser(authData.user);
      setToken(authData.token);
      return authData.user;
    } catch (error) {
      throw new Error(
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        'Ошибка при авторизации'
      );
        }
  };

  // Регистрация через API
  const register = async (userData) => {
    try {
      const response = await authAPI.register({
        username: userData.name || userData.email.split('@')[0],
          email: userData.email,
          password: userData.password,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        'Ошибка при регистрации'
      );
    }
  };

  // Функция для выхода пользователя
  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!user && !!token;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста авторизации
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

export default AuthContext; 