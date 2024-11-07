import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const LoginScreen = ({ route, navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      route.params.setIsAuthenticated(true);
      navigation.replace('Tab');
    } catch (error) {
      Alert.alert('Error', 'Credenciales incorrectas');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.registertitle} >
        SKIN MARKET
      </Text>
      <Text style={styles.LoginParrafo} >
        CounterStrike2
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
      <Button title="Iniciar Sesión" onPress={handleLogin} color="#fff" />
      <Text style={styles.registerText} onPress={() => navigation.navigate('Register')}>
        ¿No tienes cuenta? Regístrate
      </Text>
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
    color: '#FF6347',
    textAlign: 'center',
    fontSize: 20,
  },
  registerText: {
    marginTop: 20,
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default LoginScreen;