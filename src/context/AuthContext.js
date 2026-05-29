import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedUsers = await AsyncStorage.getItem('Users');
      const storedAuth = await AsyncStorage.getItem('Auth');
      
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        const initialUsers = [{ 
          nombre: 'Admin', 
          apellido: 'Admin', 
          email: 'admin@admin.com', 
          password: '123' 
        }];
        setUsers(initialUsers);
        await AsyncStorage.setItem('Users', JSON.stringify(initialUsers));
      }

      if (storedAuth) {
        setCurrentUser(JSON.parse(storedAuth));
      }
    } catch (error) {
      console.error('Error loading auth data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser(user);
      await AsyncStorage.setItem('Auth', JSON.stringify(user));
      return { success: true };
    }
    return { success: false, message: 'Credenciales inválidas' };
  };

  const register = async (userData) => {
    if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, message: 'El correo ya está registrado' };
    }
    
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      joinDate: new Date().toISOString()
    };
    
    const newUsers = [...users, newUser];
    setUsers(newUsers);
    await AsyncStorage.setItem('Users', JSON.stringify(newUsers));
    
    // Auto login
    setCurrentUser(newUser);
    await AsyncStorage.setItem('Auth', JSON.stringify(newUser));
    return { success: true };
  };

  const updateProfile = async (updatedData) => {
    if (!currentUser) return;
    const updatedUsers = users.map(u => u.email === currentUser.email ? { ...u, ...updatedData } : u);
    const updatedUser = { ...currentUser, ...updatedData };

    setUsers(updatedUsers);
    setCurrentUser(updatedUser);

    await AsyncStorage.setItem('Users', JSON.stringify(updatedUsers));
    await AsyncStorage.setItem('Auth', JSON.stringify(updatedUser));
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    const updatedUsers = users.filter(u => u.email !== currentUser.email);
    setUsers(updatedUsers);
    setCurrentUser(null);

    await AsyncStorage.setItem('Users', JSON.stringify(updatedUsers));
    await AsyncStorage.removeItem('Auth');
  };

  const logout = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem('Auth');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoading,
      login,
      register,
      updateProfile,
      deleteAccount,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
