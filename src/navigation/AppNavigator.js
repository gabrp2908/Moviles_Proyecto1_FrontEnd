import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/theme';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Main Screens
import GeneralRecipesScreen from '../screens/Main/GeneralRecipesScreen';
import MyRecipesScreen from '../screens/Main/MyRecipesScreen';
import GroupsScreen from '../screens/Main/GroupsScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';

import RecipeDetailScreen from '../screens/Main/RecipeDetailScreen';
import RecipeFormScreen from '../screens/Main/RecipeFormScreen';
import GroupRecipesScreen from '../screens/Main/GroupRecipesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.fucsia },
        headerTintColor: colors.blanco,
        headerTitleStyle: { fontFamily: 'BiscuitGlitch', fontSize: 24 },
        tabBarActiveTintColor: colors.fucsiaOscuro,
        tabBarInactiveTintColor: colors.negro,
        tabBarStyle: { backgroundColor: colors.rosaClarito },
        tabBarLabelStyle: { fontFamily: 'Comic Sans MS', fontWeight: 'bold' }
      }}
    >
      <Tab.Screen name="General" component={GeneralRecipesScreen} options={{ title: 'Todas' }} />
      <Tab.Screen name="MyRecipes" component={MyRecipesScreen} options={{ title: 'Mis Recetas' }} />
      <Tab.Screen name="Groups" component={GroupsScreen} options={{ title: 'Grupos' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mi Perfil' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { currentUser } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {currentUser ? (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen 
            name="RecipeDetail" 
            component={RecipeDetailScreen} 
            options={{ 
              headerShown: true, 
              title: 'Detalle de Receta',
              headerStyle: { backgroundColor: colors.fucsia },
              headerTintColor: colors.blanco,
              headerTitleStyle: { fontFamily: 'BiscuitGlitch', fontSize: 22 }
            }} 
          />
          <Stack.Screen 
            name="RecipeForm" 
            component={RecipeFormScreen} 
            options={({ route }) => ({
              headerShown: true, 
              title: route.params?.recipe ? 'Editar Receta' : 'Nueva Receta',
              headerStyle: { backgroundColor: colors.fucsia },
              headerTintColor: colors.blanco,
              headerTitleStyle: { fontFamily: 'BiscuitGlitch', fontSize: 22 }
            })} 
          />
          <Stack.Screen 
            name="GroupRecipes" 
            component={GroupRecipesScreen} 
            options={{ 
              headerShown: true, 
              title: 'Recetas del Grupo',
              headerStyle: { backgroundColor: colors.fucsia },
              headerTintColor: colors.blanco,
              headerTitleStyle: { fontFamily: 'BiscuitGlitch', fontSize: 22 }
            }} 
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
