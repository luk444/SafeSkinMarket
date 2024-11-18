import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const auth = getAuth();
const db = getFirestore();

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const checkIfEmailExists = async (email) => {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      return signInMethods.length > 0;
    } catch (error) {
      console.error('Error verificando email:', error);
      return false;
    }
  };

  const handleRegister = async () => {
    try {
      const emailInUse = await checkIfEmailExists(email);
      if (emailInUse) {
        Alert.alert('Error', 'Este correo electrónico ya está en uso. Por favor, usa otro.');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username: username,
        email: email,
        uid: userCredential.user.uid,
        createdAt: new Date(),
      });

      Alert.alert('Éxito', 'Usuario registrado exitosamente');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error durante el registro:', error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'Este correo electrónico ya está en uso. Por favor, usa otro.');
      } else {
        Alert.alert('Error', `Hubo un problema al registrar la cuenta: ${error.message}`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.registertitle} >
        SKIN MARKET
      </Text>
      <Text style={styles.LoginParrafo} >
      Que estas esperando para registrarte?
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={setUsername}
      />
      <Button title="Registrarme" onPress={handleRegister} color="#fff" />
      <Text style={styles.desliza} >
      Desliza para retroceder
      </Text>
        <Ionicons
         style={styles.iconn}
         name="arrow-back-outline"
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#041219',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingLeft: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  registertitle: {
    marginBottom: 0,
    color: '#ffff',
    textAlign: 'center',
    fontSize: 50,
  },
  LoginParrafo: {
    marginBottom: 80,
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
  },
  desliza: {
    marginTop: 170,
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
  },
  iconn: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
  },
});

export default RegisterScreen;
