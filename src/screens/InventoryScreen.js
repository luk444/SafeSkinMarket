import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as Linking from 'expo-linking';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoginWithSteamButton from '../components/LoginWithSteamButton';
import { useStore } from '../store/store';
import { getAuth } from '@firebase/auth';

const db = getFirestore();

function InventoryScreen() {
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const [apiKey, setApiKey] = useState('');
  const [inventory, setInventory] = useState(null);
  const navigation = useNavigation();

  // Check if we have the apiKeySteam from sellers table
  useEffect(async()=>{
    if (user) {
      const sellerDocRef = doc(db, "sellers", user.uid);
      try {
        const sellerDoc = await getDoc(sellerDocRef);
        if (sellerDoc.exists()) {
          const sellerData = sellerDoc.data();
          console.log("API Key Steam:", sellerData.apiKeySteam);
          setUser({...user, apiKeySteam: sellerData.apiKeySteam})
        }
      } catch (error) {
        console.error("Error al leer los datos del vendedor:", error);
      }
    } else {
      Alert.alert("Usuario no autenticado");
    }
},[])

  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      const { queryParams } = Linking.parse(url);

      if (queryParams && queryParams.userData) {
        const userData = JSON.parse(decodeURIComponent(queryParams.userData));
        setUser(userData);
        navigation.replace('Dashboard');
      }
    };

    Linking.addEventListener('url', handleDeepLink);
    return () => {
      Linking.removeEventListener('url', handleDeepLink);
    };
  }, [navigation]);

  useEffect(()=>{
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
    fetchInventory()
  }, [user]);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Por favor ingrese su API key.');
      return;
    }

    if (user) {
      const sellerDocRef = doc(db, "sellers", user.uid);
      try {
        await setDoc(sellerDocRef, { apiKeySteam: apiKey, uid: user.uid });
        Alert.alert('Éxito', 'API key guardada exitosamente.');
        setUser({...user, apiKeySteam: apiKey})
      } catch (error) {
        console.error("Error al guardar la API Key:", error);
        Alert.alert('Error', 'Hubo un problema al guardar su API key.');
    }
    } else {
      Alert.alert("Usuario no autenticado");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quieres vender tus skins?</Text>
      <Text style={styles.subtitle}>Para que puedas seleccionar una skin dentro de tu inventario, necesitamos que nos des
        tu API KEY para tener acceso a ella. No te preocupes, es para lo único que la utilizaremos.
      </Text>
      {!user.apiKeySteam ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su API key"
            value={apiKey}
            onChangeText={setApiKey}
          />
          <Button title={`${user.apiKeySteam ? 'Actualizar' : 'Guardar'} API Key`} onPress={handleSaveApiKey} />
          <LoginWithSteamButton />
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.centerContent}>
          <Text style={styles.message}>{user.message}</Text>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.subtitle}>Inventario:</Text>
          {inventory ? (
            <View style={styles.inventoryContainer}>
              {inventory.descriptions.map((item, index) => (
                <View key={index} style={styles.itemContainer}>
                  <Image
                    source={{ uri: `https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url}` }}
                    style={styles.itemImage}
                  />
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <ActivityIndicator color="#0000ff" />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    marginTop: 34,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'left',
    marginBottom: 20,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 20,
  },
  inventoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  itemContainer: {
    width: 80,
    height: 100,
    backgroundColor: '#1f2937',
    borderRadius: 10,
    padding: 5,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: 50,
    height: 50,
    marginBottom: 5,
    borderRadius: 5,
  },
  itemName: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
  },
  centerContent: {
    alignItems: 'center',
  },
});

export default InventoryScreen;
