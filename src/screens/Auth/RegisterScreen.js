import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import { colors } from '../../styles/theme';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!nombre || !apellido || !email || !password) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    
    // validación básica de email
    const emailRegex = /\S+@\S+\.\S+/;
    if(!emailRegex.test(email)){
      Alert.alert('Error', 'El correo no tiene un formato válido');
      return;
    }

    const result = await register({ nombre, apellido, email, password });
    if (!result.success) {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <BackgroundWrapper>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 80}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps='handled'>
            <View style={styles.card}>
            <Text style={styles.title}>Registro</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput 
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Tu nombre"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Apellido</Text>
              <TextInput 
                style={styles.input}
                value={apellido}
                onChangeText={setApellido}
                placeholder="Tu apellido"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput 
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="tu@email.com"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput 
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="******"
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchMode} onPress={() => navigation.goBack()}>
              <Text style={styles.switchText}>¿Ya tienes cuenta? <Text style={styles.switchBold}>Inicia Sesión</Text></Text>
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
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 30,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: colors.fucsia,
    shadowColor: colors.rosa,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontFamily: 'BiscuitGlitch',
    fontSize: 40,
    color: colors.rosaOscuro,
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: colors.fucsiaOscuro,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: colors.fucsia,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.rosaClarito,
    borderWidth: 3,
    borderColor: colors.fucsia,
    borderRadius: 15,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.fucsia,
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
    shadowColor: colors.fucsia,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    textTransform: 'uppercase',
  },
  switchMode: {
    marginTop: 15,
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 2,
    borderColor: colors.rosaClarito,
  },
  switchText: {
    color: colors.fucsia,
    fontSize: 16,
  },
  switchBold: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  }
});
