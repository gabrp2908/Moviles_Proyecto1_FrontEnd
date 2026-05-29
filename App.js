import React from 'react';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View } from 'react-native';
import { colors } from './src/styles/theme';

function AppContent() {
  const [fontsLoaded] = useFonts({
    'BiscuitGlitch': require('./assets/fonts/Biscuit Glitch.ttf'),
  });

  const { isLoading } = useAuth();

  if (!fontsLoaded || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.rosaClarito }}>
        <ActivityIndicator size="large" color={colors.fucsia} />
      </View>
    );
  }

  return (
    <DataProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </DataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
