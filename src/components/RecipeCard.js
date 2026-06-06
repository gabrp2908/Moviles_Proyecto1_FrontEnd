import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../styles/theme';
import { getRecipeImageUrl } from '../utils/recipeImage';

export default function RecipeCard({ recipe, onPress, onRemoveFromGroup }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUri = getRecipeImageUrl(recipe) || '';

  useEffect(() => {
    setImageFailed(false);
  }, [imageUri]);

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.card} onPress={() => onPress(recipe)}>
        {imageUri && !imageFailed ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Sin Foto</Text>
          </View>
        )}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{recipe.title}</Text>
          <Text style={styles.info}>⏱ {recipe.prepTime} | 🌟 {recipe.difficulty}</Text>
          <Text style={styles.author}>Por: {recipe.createdBy}</Text>
        </View>
      </TouchableOpacity>
      {onRemoveFromGroup && (
        <TouchableOpacity style={styles.removeBtn} onPress={() => onRemoveFromGroup(recipe)}>
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: colors.rosa,
    elevation: 3,
    shadowColor: colors.negro,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  image: {
    width: 100,
    height: 100,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    backgroundColor: colors.rosaClarito,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.rosaOscuro,
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Comic Sans MS',
    fontWeight: 'bold',
    fontSize: 18,
    color: colors.negro,
    marginBottom: 5,
  },
  info: {
    fontSize: 14,
    color: colors.fucsiaOscuro,
    marginBottom: 5,
  },
  author: {
    fontSize: 12,
    color: 'gray',
    fontStyle: 'italic',
  },
  removeBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.negro,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  removeBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
