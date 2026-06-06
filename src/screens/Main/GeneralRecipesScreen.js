import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useData } from '../../context/DataContext';
import RecipeList from '../../components/RecipeList';
import BackgroundWrapper from '../../components/BackgroundWrapper';

export default function GeneralRecipesScreen({ navigation }) {
  const { recipes, loadData } = useData();
  const [sortOption, setSortOption] = useState('alphabetical');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshWithSort = useCallback(async (selectedSort) => {
    setIsRefreshing(true);
    try {
      await loadData(selectedSort);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadData]);

  const handleSortChange = async (selectedSort) => {
    setSortOption(selectedSort);
    await refreshWithSort(selectedSort);
  };

  const handleRefresh = async () => {
    await refreshWithSort(sortOption);
  };

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <RecipeList
          recipes={recipes}
          navigation={navigation}
          sortOption={sortOption}
          onSortChange={handleSortChange}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
