import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import RecipeCard from './RecipeCard';
import { colors } from '../styles/theme';

export default function RecipeList({ recipes, navigation, onRemoveFromGroup }) {
  const [sortOption, setSortOption] = useState('alpha'); // 'alpha' | 'date'

  const sortedRecipes = [...recipes].sort((a, b) => {
    if (sortOption === 'alpha') {
      return a.title.localeCompare(b.title);
    } else {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Ordenar por:</Text>
        <View style={styles.buttonsRow}>
          <TouchableOpacity 
            style={[styles.sortBtn, sortOption === 'alpha' && styles.sortBtnActive]}
            onPress={() => setSortOption('alpha')}
          >
            <Text style={[styles.sortBtnText, sortOption === 'alpha' && styles.sortBtnTextActive]}>A-Z</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortBtn, sortOption === 'date' && styles.sortBtnActive]}
            onPress={() => setSortOption('date')}
          >
            <Text style={[styles.sortBtnText, sortOption === 'date' && styles.sortBtnTextActive]}>Recientes</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={sortedRecipes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <RecipeCard 
            recipe={item} 
            onPress={(recipe) => navigation.navigate('RecipeDetail', { recipe })} 
            onRemoveFromGroup={onRemoveFromGroup}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay recetas disponibles.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sortContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderColor: colors.rosa,
  },
  sortLabel: {
    fontWeight: 'bold',
    color: colors.fucsiaOscuro,
  },
  buttonsRow: {
    flexDirection: 'row',
  },
  sortBtn: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.rosaClarito,
    marginLeft: 10,
  },
  sortBtnActive: {
    backgroundColor: colors.fucsia,
  },
  sortBtnText: {
    color: colors.fucsiaOscuro,
    fontWeight: 'bold',
  },
  sortBtnTextActive: {
    color: 'white',
  },
  list: {
    padding: 15,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: colors.negro,
    fontSize: 16,
    fontStyle: 'italic',
  }
});
