import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import { colors } from '../../styles/theme';

const pencilIcon = require('../../../assets/images/pencil.png');
const trashIcon = require('../../../assets/images/trash-can.png');

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipes, deleteRecipe, updateRecipe, groups } = useData();
  const currentRecipe = recipes.find(r => r.id === route.params.recipe.id) || route.params.recipe;
  
  const { currentUser } = useAuth();
  const [showGroupModal, setShowGroupModal] = useState(false);

  const isOwner = currentUser?.email === currentRecipe.createdBy;

  const handleDelete = () => {
    Alert.alert(
      'Borrar Receta',
      '¿Estás seguro de que quieres borrar esta receta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, borrar', 
          style: 'destructive',
          onPress: async () => {
            await deleteRecipe(currentRecipe.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const toggleGroup = async (groupId) => {
    let newGroups = currentRecipe.groupIds ? [...currentRecipe.groupIds] : [];
    if (newGroups.includes(groupId)) {
      newGroups = newGroups.filter(id => id !== groupId);
    } else {
      newGroups.push(groupId);
    }
    await updateRecipe(currentRecipe.id, { groupIds: newGroups });
  };

  return (
    <BackgroundWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {currentRecipe.photo ? (
            <Image source={{ uri: currentRecipe.photo }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>Sin Foto</Text>
            </View>
          )}

          <Text style={styles.title}>{currentRecipe.title}</Text>
          <Text style={styles.author}>Publicado por: {currentRecipe.createdBy}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoBadge}>⏱ {currentRecipe.prepTime}</Text>
            <Text style={styles.infoBadge}>🌟 Dificultad: {currentRecipe.difficulty}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredientes</Text>
            <Text style={styles.text}>{currentRecipe.ingredients}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pasos</Text>
            <Text style={styles.text}>{currentRecipe.steps}</Text>
          </View>

          {currentRecipe.observations ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Observaciones</Text>
              <Text style={styles.text}>{currentRecipe.observations}</Text>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.button, styles.groupsButton]} 
              onPress={() => setShowGroupModal(true)}
            >
              <Text style={styles.buttonText}>Añadir a Grupos</Text>
            </TouchableOpacity>
          </View>

          {isOwner && (
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.button, styles.buttonRow, styles.editButton]} 
                onPress={() => navigation.navigate('RecipeForm', { recipe: currentRecipe })}
              >
                <Image source={pencilIcon} style={styles.buttonIcon} resizeMode="contain" />
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.buttonRow, styles.deleteButton]} 
                onPress={handleDelete}
              >
                <Image source={trashIcon} style={styles.buttonIcon} resizeMode="contain" />
                <Text style={styles.buttonText}>Borrar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal para grupos */}
      <Modal visible={showGroupModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mis Grupos</Text>
            {groups.filter(g => g.createdBy === currentUser?.email).length === 0 ? (
              <Text style={styles.text}>No has creado ningún grupo todavía.</Text>
            ) : (
              <FlatList
                data={groups.filter(g => g.createdBy === currentUser?.email)}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                  const isSelected = currentRecipe.groupIds?.includes(item.id);
                  return (
                    <TouchableOpacity 
                      style={styles.groupToggleRow} 
                      onPress={() => toggleGroup(item.id)}
                    >
                      <Text style={styles.groupToggleName}>{item.name}</Text>
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowGroupModal(false)}>
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    elevation: 5,
    shadowColor: colors.rosa,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.rosaClarito,
    borderRadius: 15,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.rosaOscuro,
    fontSize: 16,
  },
  title: {
    fontFamily: 'BiscuitGlitch',
    fontSize: 30,
    color: colors.fucsiaOscuro,
    textAlign: 'center',
    marginBottom: 5,
  },
  author: {
    textAlign: 'center',
    color: 'gray',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  infoBadge: {
    backgroundColor: colors.rosaClaro,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    color: colors.fucsiaOscuro,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: colors.fucsia,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.rosaClarito,
    paddingBottom: 5,
  },
  text: {
    fontSize: 16,
    color: colors.negro,
    lineHeight: 24,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: colors.rosaClarito,
    paddingTop: 15,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.fucsia,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: colors.negro,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  groupsButton: {
    backgroundColor: colors.fucsiaOscuro,
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: 18,
    height: 18,
    tintColor: 'white',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    color: colors.fucsiaOscuro,
    fontFamily: 'BiscuitGlitch',
    marginBottom: 15,
    textAlign: 'center',
  },
  groupToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rosaClarito,
  },
  groupToggleName: {
    fontSize: 16,
    color: colors.negro,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.fucsia,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.fucsia,
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeModalButton: {
    backgroundColor: colors.rosa,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  }
});
