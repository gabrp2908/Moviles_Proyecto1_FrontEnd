import axios from 'axios';
import { Alert } from 'react-native';
import Constants from 'expo-constants';

const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL
  || Constants.expoConfig?.extra?.API_BASE_URL
  || Constants.manifest?.extra?.API_BASE_URL;

const baseURL = envBaseUrl || 'https://recipes-backend-7xcr.onrender.com';

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const asString = (value) => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(asString).filter(Boolean).join(', ');
  if (value && typeof value === 'object') {
    if ('message' in value) return asString(value.message);
    return Object.values(value).map(asString).filter(Boolean).join(', ');
  }
  return '';
};

const getErrorMessage = (error) => {
  const data = error.response?.data;
  if (data?.message) {
    const message = asString(data.message);
    if (message) return message;
  }
  if (data?.errors) {
    const firstError = Object.values(data.errors)[0];
    const message = asString(firstError);
    if (message) return message;
  }
  if (error.message) return asString(error.message);
  return 'Error de red o del servidor';
};

export const setupInterceptors = (logoutCallback) => {
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const message = getErrorMessage(error);

      if (status === 401) {
        if (logoutCallback) logoutCallback();
      } else if (status === 429) {
        Alert.alert('Demasiados intentos', 'Por favor, intenta de nuevo más tarde.');
      } else if (status >= 500) {
        Alert.alert('Error del servidor', 'Ocurrió un problema en el servidor. Intenta nuevamente más tarde.');
      }

      error.normalizedMessage = message;
      return Promise.reject(error);
    }
  );
};

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const clearAuthToken = () => {
  delete apiClient.defaults.headers.common['Authorization'];
};

export default apiClient;
