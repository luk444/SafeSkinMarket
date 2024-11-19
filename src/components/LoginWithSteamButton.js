import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { useStore } from '../store/store';

function LoginWithSteamButton() {
  const user = useStore((state) => state.user);
  
  const handleLogin = async() => {
    await Linking.openURL(`http://192.168.1.41:5001/auth/steam?uid=${user?.uid}`);

    async function fetchInventory() {
      try {
        console.log('fetchInventory')
        const token = await AsyncStorage.getItem("token");
          if (token) {
            // Enviar el token al backend
            // REEMPLAZAR POR IP PRIVADA DE LA COMPUTADORA EJECUTANDO
          const response = await axios.get("http://192.168.1.41:5001/api/inventory", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("response /api/inventory backend: ", response);
          Alert.alert("Perfil", `¡Bienvenido ${response.data.user.email}!`);
        }
      } catch (error) {
        console.error('Error al obtener inventario:', error?.toString());
        Alert.alert("Error", "Error al obtener inventario");
      }
    }
    // fetchInventory()

    async function fetchSteamId() {
      try {
        // Aquí hacemos la solicitud para obtener el steamId después de la autenticación
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const response = await axios.get("http://192.168.1.41:5001/auth/steam/return", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('response.data.steamId',response.data.steamId)
          // Redirigimos a la pantalla de dashboard con el steamId
          if (response.data.steamId) {
            // navigation.navigate('Dashboard', { steamId: response.data.steamId });
          } else {
            Alert.alert("Error", "No se pudo obtener el Steam ID.");
          }
        }
      } catch (error) {
        console.error('Error al obtener Steam ID:', error);
        Alert.alert("Error", "Error al obtener el Steam ID.");
      }
    }

    fetchSteamId();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Iniciar sesión con Steam</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginWithSteamButton;
