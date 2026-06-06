import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import { colors } from '../../styles/theme';

const pencilIcon = require('../../../assets/images/pencil.png');
const trashIcon = require('../../../assets/images/trash-can.png');

export default function GroupsScreen({ navigation }) {
  const { groups, addGroup, updateGroup, deleteGroup, recipes } = useData();
  const { currentUser } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');

  const handleSave = () => {
    if (!groupName) {
      Alert.alert('Error', 'El nombre del grupo es obligatorio');
      return;
    }
    
    if (editingGroup) {
      updateGroup(editingGroup.id, { name: groupName, description: groupDesc });
    } else {
      addGroup({ name: groupName, description: groupDesc });
    }
    
    setModalVisible(false);
    setGroupName('');
    setGroupDesc('');
    setEditingGroup(null);
  };

  const openEdit = (group) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupDesc(group.description);
    setModalVisible(true);
  };

  const confirmDelete = (groupId) => {
    Alert.alert(
      'Borrar Grupo',
      'Si borras este grupo, se borrarán de la app TODAS LAS RECETAS que hayas creado en él. Si las recetas no son tuyas, solo se desenlazarán del grupo. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, borrar', 
          style: 'destructive',
          onPress: () => deleteGroup(groupId)
        }
      ]
    );
  };

  const renderGroup = ({ item }) => {
    // Contar cuántas recetas están en este grupo
    const groupRecipesCount = recipes.filter(r => r.groupIds && r.groupIds.includes(item.id)).length;
    const isOwner = currentUser?.email === item.createdBy;

    return (
      <TouchableOpacity 
        style={styles.groupCard} 
        onPress={() => navigation.navigate('GroupRecipes', { group: item })}
      >
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDesc}>{item.description}</Text>
          <Text style={styles.groupCount}>Recetas: {groupRecipesCount}</Text>
        </View>
        
        {isOwner && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
              <Image source={pencilIcon} style={styles.iconImage} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.iconBtn}>
              <Image source={trashIcon} style={styles.iconImage} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <FlatList 
          data={groups.filter(g => g.createdBy === currentUser?.email)}
          keyExtractor={item => item.id}
          renderItem={renderGroup}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No hay grupos creados aún.</Text>}
        />
        
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => {
            setEditingGroup(null);
            setGroupName('');
            setGroupDesc('');
            setModalVisible(true);
          }}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView 
              style={styles.modalOverlay}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{editingGroup ? 'Editar Grupo' : 'Nuevo Grupo'}</Text>
                
                <Text style={styles.label}>Nombre</Text>
                <TextInput style={styles.input} value={groupName} onChangeText={setGroupName} placeholder="Ej: Postres Caseros" />

                <Text style={styles.label}>Descripción</Text>
                <TextInput style={styles.input} value={groupDesc} onChangeText={setGroupDesc} placeholder="Recetas de dulces..." />

                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.button, styles.saveBtn]} onPress={handleSave}>
                    <Text style={styles.buttonText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 15,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    fontStyle: 'italic',
  },
  groupCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: colors.fucsiaClaro,
    elevation: 3,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.fucsiaOscuro,
  },
  groupDesc: {
    fontSize: 14,
    color: colors.negro,
    marginTop: 5,
  },
  groupCount: {
    fontSize: 12,
    color: colors.rosaOscuro,
    marginTop: 8,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
    marginLeft: 5,
    backgroundColor: colors.rosaClarito,
    borderRadius: 8,
  },
  iconImage: {
    width: 18,
    height: 18,
    tintColor: colors.fucsiaOscuro,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: colors.fucsia,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'BiscuitGlitch',
    color: colors.fucsiaOscuro,
    textAlign: 'center',
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    color: colors.fucsia,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: colors.rosaClarito,
    borderWidth: 2,
    borderColor: colors.rosa,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: colors.fucsia,
    marginRight: 5,
  },
  cancelBtn: {
    backgroundColor: 'gray',
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
