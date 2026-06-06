import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Modal } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useData } from '../../context/DataContext';
import * as ImagePicker from 'expo-image-picker';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import { colors } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';

const DIFFICULTY_OPTIONS = ['Fácil', 'Media', 'Difícil'];

export default function RecipeFormScreen({ route, navigation }) {
  const { recipe } = route.params || {};
  const { addRecipe, updateRecipe, groups } = useData();
   const { currentUser } = useAuth();

  const [title, setTitle] = useState(recipe?.title || '');
  const [photo, setPhoto] = useState(recipe?.photo || null);
  const [ingredients, setIngredients] = useState(recipe?.ingredients || '');
  const [prepTime, setPrepTime] = useState(recipe?.prepTime || '');
  const [difficulty, setDifficulty] = useState(recipe?.difficulty || 'Media');
  const [steps, setSteps] = useState(recipe?.steps || '');
  const [observations, setObservations] = useState(recipe?.observations || '');
  const [selectedGroups, setSelectedGroups] = useState(recipe?.groupIds || []);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [photo]);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const toggleGroup = (groupId) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  };

  const handleSave = async () => {
    if (!title || !ingredients || !steps || !prepTime || !difficulty) {
      Alert.alert('Error', 'Por favor llena los campos principales (Título, Ingredientes, Tiempo, Dificultad, Pasos)');
      return;
    }

    const recipeData = {
      title,
      photo,
      ingredients,
      prepTime,
      difficulty,
      steps,
      observations,
      groupIds: selectedGroups
    };

    if (recipe) {
      await updateRecipe(recipe.id, recipeData);
    } else {
      await addRecipe(recipeData);
    }

    navigation.goBack();
  };

  return (
    <BackgroundWrapper>
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps='handled'
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraHeight={150}
        extraScrollHeight={100}
      >
        <View style={styles.card}>
          <Text style={styles.label}>Título</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ej: Tarta de Manzana" />

          <Text style={styles.label}>Foto</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            {photo && !imageFailed ? (
              <Image
                source={{ uri: photo }}
                style={styles.imagePreview}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <Text style={styles.imagePickerText}>Seleccionar Imagen</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Ingredientes</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={ingredients} 
            onChangeText={setIngredients} 
            placeholder="1 taza de harina..."
            multiline 
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Tiempo</Text>
              <TextInput style={styles.input} value={prepTime} onChangeText={setPrepTime} placeholder="Ej: 30 min" />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Dificultad</Text>
              <TouchableOpacity
                style={[styles.input, styles.dropdownButton]}
                onPress={() => setShowDifficultyDropdown(true)}
              >
                <Text style={styles.dropdownText}>{difficulty || 'Selecciona dificultad'}</Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Modal
            visible={showDifficultyDropdown}
            transparent={true}
            animationType="fade"
          >
            <TouchableWithoutFeedback onPress={() => setShowDifficultyDropdown(false)}>
              <View style={styles.dropdownOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.dropdownMenu}>
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setDifficulty(option);
                          setShowDifficultyDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <Text style={styles.label}>Pasos</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={steps} 
            onChangeText={setSteps} 
            placeholder="1. Mezclar todo..."
            multiline 
          />

          <Text style={styles.label}>Observaciones</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={observations} 
            onChangeText={setObservations} 
            placeholder="Opcional..."
            multiline 
          />

             {groups.filter(g => g.createdBy === currentUser?.email).length > 0 && (
            <View style={styles.groupsSection}>
              <Text style={styles.label}>Asignar a Grupos:</Text>
              <View style={styles.groupsRow}>
                   {groups.filter(g => g.createdBy === currentUser?.email).map(g => (
                  <TouchableOpacity 
                    key={g.id} 
                    style={[styles.groupPill, selectedGroups.includes(g.id) && styles.groupPillActive]}
                    onPress={() => toggleGroup(g.id)}
                  >
                    <Text style={[styles.groupText, selectedGroups.includes(g.id) && styles.groupTextActive]}>
                      {g.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Guardar Receta</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: colors.fucsia,
  },
  label: {
    color: colors.fucsia,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: colors.rosaClarito,
    borderWidth: 2,
    borderColor: colors.rosa,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  half: {
    width: '48%',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: colors.negro,
    fontSize: 16,
  },
  dropdownIcon: {
    color: colors.fucsiaOscuro,
    fontSize: 12,
    fontWeight: 'bold',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dropdownMenu: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.fucsia,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.rosaClarito,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: colors.fucsiaOscuro,
    fontWeight: 'bold',
  },
  imagePicker: {
    backgroundColor: colors.rosaClarito,
    borderWidth: 2,
    borderColor: colors.rosa,
    borderStyle: 'dashed',
    borderRadius: 10,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePickerText: {
    color: colors.fucsiaOscuro,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  groupsSection: {
    marginTop: 10,
  },
  groupsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  groupPill: {
    backgroundColor: colors.rosaClarito,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.rosa,
  },
  groupPillActive: {
    backgroundColor: colors.fucsia,
    borderColor: colors.fucsiaOscuro,
  },
  groupText: {
    color: colors.fucsiaOscuro,
  },
  groupTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: colors.fucsia,
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  }
});
