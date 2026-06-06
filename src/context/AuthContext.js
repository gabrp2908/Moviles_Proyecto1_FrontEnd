import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { setupInterceptors, setAuthToken, clearAuthToken } from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const buildFullName = (nombre, apellido) => `${nombre || ''} ${apellido || ''}`.trim();

const mapBackendUser = (userObj) => {
  const userName = userObj?.user_na || '';
  const [nombre, ...apellidoParts] = userName.split(' ');

  return {
    id: userObj?.user_id?.toString() || null,
    email: userObj?.user_mail || '',
    nombre: nombre || '',
    apellido: apellidoParts.join(' ') || '',
  };
};

const getErrorMessage = (error, fallbackMessage) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.normalizedMessage) return error.normalizedMessage;
  return fallbackMessage;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setupInterceptors(logoutLocally);
    loadData();
  }, []);

  const logoutLocally = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem('Auth');
    await AsyncStorage.removeItem('AuthToken');
    clearAuthToken();
  };

  const loadData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('AuthToken');
      if (storedToken) {
        setAuthToken(storedToken);
        try {
          const meRes = await apiClient.get('/auth/me');
          const userObj = meRes.data;
          if (userObj) {
            const user = mapBackendUser(userObj);
            setCurrentUser(user);
            await AsyncStorage.setItem('Auth', JSON.stringify(user));
            return;
          }
        } catch (e) {
          await AsyncStorage.removeItem('AuthToken');
          clearAuthToken();
          await AsyncStorage.removeItem('Auth');
          setCurrentUser(null);
          return;
        }
      }

      // No valid token means no authenticated session for the mobile token flow.
      await AsyncStorage.removeItem('Auth');
      setCurrentUser(null);
    } catch (error) {
      console.error('Error loading auth data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Use mobile-login to receive access token and user payload
      const res = await apiClient.post('/auth/mobile-login', { email, password });
      const token = res.data?.access_token;
      const userObj = res.data?.user;
      if (!token || !userObj) {
        throw new Error('No se recibió token o usuario del servidor');
      }

      setAuthToken(token);
      await AsyncStorage.setItem('AuthToken', token);

      const user = mapBackendUser(userObj);
      setCurrentUser(user);
      await AsyncStorage.setItem('Auth', JSON.stringify(user));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error, 'Credenciales inválidas'),
      };
    }
  };

  const register = async (userData) => {
    try {
      const name = buildFullName(userData.nombre, userData.apellido);
      await apiClient.post('/auth/register', {
        name,
        email: userData.email,
        password: userData.password,
      });

      return await login(userData.email, userData.password);
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error, 'Error en el registro'),
      };
    }
  };

  const updateProfile = async (updatedData) => {
    if (!currentUser) return;

    try {
      const payload = {};
      const newNombre = updatedData.nombre !== undefined ? updatedData.nombre : currentUser.nombre;
      const newApellido = updatedData.apellido !== undefined ? updatedData.apellido : currentUser.apellido;
      const fullName = buildFullName(newNombre, newApellido);

      if (fullName) {
        payload.name = fullName;
      }
      if (updatedData.email) {
        payload.email = updatedData.email;
      }
      if (updatedData.password) {
        payload.password = updatedData.password;
      }

      if (Object.keys(payload).length === 0) {
        return;
      }

      const response = await apiClient.put('/users/profile', payload);
      const returnedUser = response.data?.user;
      const nextUser = returnedUser ? mapBackendUser(returnedUser) : {
        ...currentUser,
        nombre: newNombre,
        apellido: newApellido,
        email: updatedData.email || currentUser.email,
      };

      setCurrentUser(nextUser);
      await AsyncStorage.setItem('Auth', JSON.stringify(nextUser));
    } catch (error) {
      const message = getErrorMessage(error, 'Error actualizando perfil');
      console.error('Error actualizando perfil', message);
      throw new Error(message);
    }
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    try {
      await apiClient.delete('/users/account');
      await logoutLocally();
    } catch (error) {
      if (error.response?.status === 401) {
        await logoutLocally();
      }
      const message = getErrorMessage(error, 'Error borrando cuenta');
      console.error('Error borrando cuenta', message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error cerrando sesión en servidor', error);
    } finally {
      await logoutLocally();
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoading,
      login,
      register,
      updateProfile,
      deleteAccount,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
