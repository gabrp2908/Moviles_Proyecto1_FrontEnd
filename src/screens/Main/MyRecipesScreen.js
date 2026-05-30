import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import RecipeList from '../../components/RecipeList';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import { colors } from '../../styles/theme';

export default function MyRecipesScreen({ navigation }) {
  const { recipes } = useData();
  const { currentUser } = useAuth();

  const myRecipes = currentUser ? recipes.filter(r => r.createdBy === currentUser.email) : [];

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <RecipeList recipes={myRecipes} navigation={navigation} />
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => navigation.navigate('RecipeForm')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.fucsia,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.fucsiaOscuro,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  fabText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: -2,
  }
});
