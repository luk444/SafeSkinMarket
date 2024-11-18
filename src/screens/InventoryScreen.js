import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as Linking from 'expo-linking';
import { getFirestore, doc, updateDoc } from 'firebase/firestore'; // Importa Firestore
import LoginWithSteamButton from '../components/LoginWithSteamButton';
import { useStore } from '../store/store';

const db = getFirestore();

function InventoryScreen() {
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const [apiKey, setApiKey] = useState('');
  const [inventory, setInventory] = useState(null);
  const navigation = useNavigation();
  console.log('user',user);
  
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

  useEffect(() => {
    if (user.steamApiKey) {
      axios.get('http://localhost:5001/api/inventory', { withCredentials: true })
        .then(response => setInventory(response.data))
        .catch(error => console.error('Error al obtener inventario:', error));
    }
  }, [user]);

  const handleSaveApiKey = async () => {
    if (!apiKey) {
      Alert.alert('Error', 'Por favor ingrese su API key.');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { apiKey });
      Alert.alert('Éxito', 'API key guardada exitosamente.');
    } catch (error) {
      console.error('Error al guardar API key:', error);
      Alert.alert('Error', 'Hubo un problema al guardar su API key.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a la Steam Login App</Text>
      {!user.steamApiKey ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su API key"
            value={apiKey}
            onChangeText={setApiKey}
          />
          <Button title="Guardar API Key" onPress={handleSaveApiKey} />
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
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
