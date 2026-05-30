import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import { colors } from '../../styles/theme';

export default function ProfileScreen() {
  const { currentUser, updateProfile, deleteAccount, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState(currentUser?.nombre || '');
  const [apellido, setApellido] = useState(currentUser?.apellido || '');

  const handleUpdate = async () => {
    if (!nombre || !apellido) {
      Alert.alert('Error', 'Nombre y apellido son obligatorios');
      return;
    }
    await updateProfile({ nombre, apellido });
    setIsEditing(false);
    Alert.alert('Éxito', 'Perfil actualizado');
  };

  const handleDeleteSequence = () => {
    Alert.alert(
      'Borrar Cuenta',
      '¿Estás seguro de que quieres borrar tu cuenta? Esta acción es irreversible.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, borrar', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmación 2/3',
              'Perderás todas tus recetas y grupos creados. ¿Continuar?',
              [
                { text: 'Mejor no', style: 'cancel' },
                {
                  text: 'Estoy seguro',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert(
                      'Última Confirmación',
                      '¡Cuidado! Esta es la última advertencia. ¿Realmente quieres eliminar tu cuenta para siempre?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: '¡Borrar todo!',
                          style: 'destructive',
                          onPress: () => {
                            deleteAccount();
                          }
                        }
                      ]
                    )
                  }
                }
              ]
            )
          }
        }
      ]
    )
  };

  return (
    <BackgroundWrapper>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 80}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
            <Text style={styles.title}>Mi Perfil</Text>

            <View style={styles.infoGroup}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.valueText}>{currentUser?.email}</Text>
            </View>

            <View style={styles.infoGroup}>
              <Text style={styles.label}>Nombre</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                />
              ) : (
                <Text style={styles.valueText}>{currentUser?.nombre}</Text>
              )}
            </View>

            <View style={styles.infoGroup}>
              <Text style={styles.label}>Apellido</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={apellido}
                  onChangeText={setApellido}
                />
              ) : (
                <Text style={styles.valueText}>{currentUser?.apellido}</Text>
              )}
            </View>

            {isEditing ? (
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleUpdate}>
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => {
                  setNombre(currentUser?.nombre);
                  setApellido(currentUser?.apellido);
                  setIsEditing(false);
                }}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
                <Text style={styles.buttonText}>Editar Perfil</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={logout}>
              <Text style={styles.buttonText}>Cerrar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteSequence}>
              <Text style={styles.buttonText}>Borrar Cuenta</Text>
            </TouchableOpacity>

          </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 25,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.fucsia,
    shadowColor: colors.rosa,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  title: {
    fontFamily: 'BiscuitGlitch',
    fontSize: 35,
    color: colors.rosaOscuro,
    textAlign: 'center',
    marginBottom: 20,
  },
  infoGroup: {
    marginBottom: 15,
  },
  label: {
    color: colors.fucsia,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  valueText: {
    fontSize: 18,
    color: colors.negro,
    backgroundColor: colors.rosaClarito,
    padding: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: colors.fucsiaClaro,
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: colors.fucsia,
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    marginRight: 5,
    backgroundColor: colors.verde,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 5,
    backgroundColor: 'gray',
  },
  logoutButton: {
    backgroundColor: colors.azul,
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: colors.rojo,
    marginTop: 30,
    borderWidth: 2,
    borderColor: 'darkred',
  }
});
