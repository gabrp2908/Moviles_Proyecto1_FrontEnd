import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useData } from '../../context/DataContext';
import RecipeList from '../../components/RecipeList';
import BackgroundWrapper from '../../components/BackgroundWrapper';

export default function GeneralRecipesScreen({ navigation }) {
  const { recipes } = useData();

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <RecipeList recipes={recipes} navigation={navigation} />
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
