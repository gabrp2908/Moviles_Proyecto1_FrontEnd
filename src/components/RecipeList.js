import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import RecipeCard from './RecipeCard';
import { colors } from '../styles/theme';

const toMillis = (value) => {
  const date = new Date(value || 0);
  const ms = date.getTime();
  return Number.isFinite(ms) ? ms : 0;
};

export default function RecipeList({
  recipes,
  navigation,
  onRemoveFromGroup,
  sortOption: externalSortOption,
  onSortChange,
  refreshing = false,
  onRefresh,
}) {
  const [internalSortOption, setInternalSortOption] = useState('alphabetical');
  const isExternallySorted = typeof externalSortOption === 'string' && typeof onSortChange === 'function';
  const sortOption = isExternallySorted ? externalSortOption : internalSortOption;

  const handleSortChange = (value) => {
    if (isExternallySorted) {
      onSortChange(value);
      return;
    }
    setInternalSortOption(value);
  };

  const sortedRecipes = [...recipes].sort((a, b) => {
    if (sortOption === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return toMillis(b.createdAt) - toMillis(a.createdAt);
  });

  const listData = isExternallySorted ? recipes : sortedRecipes;

  return (
    <View style={styles.container}>
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Ordenar por:</Text>
        <View style={styles.buttonsRow}>
          <TouchableOpacity 
            style={[styles.sortBtn, sortOption === 'alphabetical' && styles.sortBtnActive]}
            onPress={() => handleSortChange('alphabetical')}
          >
            <Text style={[styles.sortBtnText, sortOption === 'alphabetical' && styles.sortBtnTextActive]}>A-Z</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortBtn, sortOption === 'recent' && styles.sortBtnActive]}
            onPress={() => handleSortChange('recent')}
          >
            <Text style={[styles.sortBtnText, sortOption === 'recent' && styles.sortBtnTextActive]}>Recientes</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={listData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <RecipeCard 
            recipe={item} 
            onPress={(recipe) => navigation.navigate('RecipeDetail', { recipe })} 
            onRemoveFromGroup={onRemoveFromGroup}
          />
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
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
