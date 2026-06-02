import React from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { useData } from '../../context/DataContext';
import RecipeList from '../../components/RecipeList';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import { colors } from '../../styles/theme';

export default function GroupRecipesScreen({ route, navigation }) {
  const { group } = route.params;
  const { recipes, updateRecipe } = useData();

  const groupRecipes = recipes.filter(r => r.groupIds && r.groupIds.includes(group.id));

  const handleRemoveFromGroup = (recipe) => {
    Alert.alert(
      'Quitar del Grupo',
      '¿Deseas quitar esta receta de este grupo? (La receta no se borrará de la aplicación)',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, quitar', 
          style: 'destructive',
          onPress: async () => {
            const newGroups = recipe.groupIds.filter(id => id !== group.id);
            await updateRecipe(recipe.id, { groupIds: newGroups });
          }
        }
      ]
    );
  };

  return (
    <BackgroundWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>{group.name}</Text>
        {group.description ? <Text style={styles.desc}>{group.description}</Text> : null}
      </View>
      <View style={styles.container}>
        <RecipeList 
          recipes={groupRecipes} 
          navigation={navigation} 
          onRemoveFromGroup={handleRemoveFromGroup} 
        />
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 3,
    borderColor: colors.fucsia,
  },
  title: {
    fontFamily: 'BiscuitGlitch',
    fontSize: 28,
    color: colors.rosaOscuro,
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    color: colors.negro,
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  }
});
