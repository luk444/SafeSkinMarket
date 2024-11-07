import React, { useState, useEffect, forwardRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, FlatList, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { db } from '../firebase'; // Asegúrate de tener tu archivo de configuración de Firebase
import { collection, addDoc } from 'firebase/firestore'; // Funciones de Firestore para agregar documentos
import { getAuth } from 'firebase/auth'; // Importar para obtener el usuario autenticado

// Solución al error de refs: envolver el componente Toast con forwardRef
const ToastComponent = forwardRef((props, ref) => {
  return <Toast {...props} ref={ref} />;
});

const SellScreen = () => {
  const [weaponOptions, setWeaponOptions] = useState([]);  // Lista de armas
  const [selectedWeapon, setSelectedWeapon] = useState(null);  // Arma seleccionada
  const [selectedSkin, setSelectedSkin] = useState(null);  // Skin seleccionada
  const [selectedCondition, setSelectedCondition] = useState(null);  // Condición de la skin
  const [selectedPrice, setSelectedPrice] = useState('');  // Precio ingresado por el usuario
  const [selectedFloat, setSelectedFloat] = useState('');  // Float ingresado por el usuario
  const [showWeaponDropdown, setShowWeaponDropdown] = useState(false);  // Estado para mostrar/ocultar dropdown de armas
  const [showSkinDropdown, setShowSkinDropdown] = useState(false);  // Estado para mostrar/ocultar dropdown de skins
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);  // Estado para mostrar/ocultar dropdown de condiciones

  // Listado de condiciones de skins
  const skinConditions = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];

  // Estados para manejar si el precio y el float están completos
  const [priceCompleted, setPriceCompleted] = useState(false);
  const [floatCompleted, setFloatCompleted] = useState(false);

  useEffect(() => {
    const fetchWeaponsAndSkins = async () => {
      try {
        const response = await fetch('https://bymykel.github.io/CSGO-API/api/en/skins.json');
        const data = await response.json();

        // Agrupar skins por arma
        const weaponsMap = {};
        data.forEach(skin => {
          const weaponId = skin.weapon.id;
          if (!weaponsMap[weaponId]) {
            weaponsMap[weaponId] = {
              id: weaponId,
              name: skin.weapon.name,
              skins: []
            };
          }
          weaponsMap[weaponId].skins.push(skin);
        });

        setWeaponOptions(Object.values(weaponsMap));
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error al cargar armas y skins.',
        });
      }
    };

    fetchWeaponsAndSkins();
  }, []);

  const handleWeaponSelect = (weapon) => {
    setSelectedWeapon(weapon);
    setSelectedSkin(null); // Resetea skin seleccionada al cambiar de arma
    setSelectedCondition(null); // Resetea la condición
    setShowWeaponDropdown(false); // Cierra el dropdown de armas
  };

  const handleSkinSelect = (skin) => {
    setSelectedSkin(skin);
    setShowSkinDropdown(false); // Cierra el dropdown de skins
  };

  const handleConditionSelect = (condition) => {
    setSelectedCondition(condition);
    setShowConditionDropdown(false); // Cierra el dropdown de condiciones
  };

  const handlePublish = async () => {
    if (!selectedSkin || !selectedCondition || !selectedPrice || !selectedFloat) {
      Alert.alert('Error', 'Debes completar todos los campos para publicar.');
      return;
    }

    // Validación del precio (solo números positivos)
    if (isNaN(selectedPrice) || parseFloat(selectedPrice) <= 0) {
      Alert.alert('Error', 'El precio debe ser un número positivo válido.');
      return;
    }

    // Validación del float (debe ser un número válido con hasta 9 decimales)
    if (isNaN(selectedFloat) || parseFloat(selectedFloat) < 0 || parseFloat(selectedFloat) > 1 || !/^\d*\.?\d{0,9}$/.test(selectedFloat)) {
      Alert.alert('Error', 'El float debe ser un número entre 0 y 1, con hasta 9 decimales.');
      return;
    }

    // Obtener el UID del usuario actual
    const user = getAuth().currentUser;
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para publicar un producto.');
      return;
    }

    // Construir el objeto del producto con los datos seleccionados
    const newProduct = {
      weapon: selectedWeapon.name,  // Nombre del arma seleccionada
      skin: selectedSkin.name,      // Nombre de la skin seleccionada
      condition: selectedCondition, // Condición de la skin
      weaponImage: selectedSkin.image, // Imagen de la skin (URL)
      price: parseFloat(selectedPrice), // Precio en formato numérico
      float: parseFloat(selectedFloat), // Float del desgaste
      createdAt: new Date(), // Fecha de creación del producto (opcional)
      userId: user.uid, // ID del usuario que publica el producto
      userName: user.displayName || 'Usuario Anónimo', // Nombre del usuario, puedes usar displayName si lo has configurado
    };

    try {
      // Agregar el producto a la colección 'products' en Firestore
      await addDoc(collection(db, 'products'), newProduct);

      Toast.show({
        type: 'success',
        text1: 'Skin publicada con éxito.',
      });

      // Limpiar los campos después de publicar
      setSelectedWeapon(null);
      setSelectedSkin(null);
      setSelectedCondition(null);
      setSelectedPrice('');
      setSelectedFloat('');
      setPriceCompleted(false); // Reset estado de precio
      setFloatCompleted(false); // Reset estado de float
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error al publicar la skin.',
      });
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Publica tu articulo</Text>

        {/* Dropdown de Armas */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowWeaponDropdown(!showWeaponDropdown)}>
            <Text style={styles.dropdownButtonText}>
              {selectedWeapon ? selectedWeapon.name : 'Selecciona un Arma'}
            </Text>
          </TouchableOpacity>

          {showWeaponDropdown && (
            <FlatList
              data={weaponOptions}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleWeaponSelect(item)}>
                  <Text style={styles.dropdownOption}>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          )}
        </View>

        {/* Dropdown de Skins */}
        {selectedWeapon && (
          <View style={styles.dropdownContainer}>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowSkinDropdown(!showSkinDropdown)}>
              <Text style={styles.dropdownButtonText}>
                {selectedSkin ? selectedSkin.name : 'Selecciona una Skin'}
              </Text>
            </TouchableOpacity>

            {showSkinDropdown && (
              <FlatList
                data={selectedWeapon.skins}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSkinSelect(item)}>
                    <Text style={styles.dropdownOption}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
              />
            )}
          </View>
        )}

        {/* Dropdown de Condiciones (Estado del arma) */}
        {selectedSkin && (
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>Selecciona la Condición de la Skin:</Text>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowConditionDropdown(!showConditionDropdown)}>
              <Text style={styles.dropdownButtonText}>
                {selectedCondition ? selectedCondition : 'Selecciona una Condición'}
              </Text>
            </TouchableOpacity>

            {showConditionDropdown && (
              skinConditions.map((condition, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleConditionSelect(condition)}
                  style={[
                    styles.conditionOption,
                    selectedCondition === condition && styles.selectedCondition,
                  ]}
                >
                  <Text style={styles.conditionText}>{condition}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Input para Precio */}
        {selectedCondition && !priceCompleted && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Precio ($)"
              placeholderTextColor="#888"
              value={selectedPrice}
              onChangeText={(text) => setSelectedPrice(text)}
              onEndEditing={() => setPriceCompleted(true)} // Marca como completado
            />
          </View>
        )}

        {/* Input para Float */}
        {selectedPrice && !floatCompleted && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Float (desgaste)"
              placeholderTextColor="#888"
              value={selectedFloat}
              onChangeText={(text) => setSelectedFloat(text)}
              onEndEditing={() => setFloatCompleted(true)} // Marca como completado
            />
          </View>
        )}

        <Text style={styles.previewText}>Tu item:</Text>
        {/* Previsualización */}
        {selectedSkin && selectedCondition && selectedPrice && selectedFloat && (
          <View style={styles.previewContainer}>
            <View style={styles.previewContent}>
              <Image source={{ uri: selectedSkin.image }} style={styles.weaponImage} />
              <View style={styles.previewDetails}>
                <Text style={styles.skinName}>{selectedSkin.name}</Text>
                <Text style={styles.skinCondition}>{selectedCondition}</Text>
                <Text style={styles.skinPrice}>Precio: ${selectedPrice}</Text>
                <Text style={styles.skinFloat}>Float: {selectedFloat}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Botón de Publicar */}
        <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
          <Text style={styles.publishButtonText}>Publicar Skin</Text>
        </TouchableOpacity>

        {/* Componente de Toast */}
        <ToastComponent ref={(ref) => Toast.setRef(ref)} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#222',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 40,
    marginTop: 30,
    textAlign: 'center',
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownOption: {
    color: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    textAlign: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  conditionOption: {
    color: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  selectedCondition: {
    backgroundColor: '#007bff',  // Resaltamos la opción seleccionada con un fondo azul
    color: '#fff',
  },
  conditionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  previewContainer: {
    marginTop: 10,
    padding: 20,
    backgroundColor: '#333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  previewText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 40,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  weaponImage: {
    width: 100,
    height: 100,
    marginRight: 20,
  },
  previewDetails: {
    flex: 1,
  },
  skinName: {
    color: '#fff',
    fontSize: 18,
  },
  skinCondition: {
    color: '#aaa',
    fontSize: 14,
  },
  skinPrice: {
    color: '#fff',
    fontSize: 16,
    marginTop: 5,
  },
  skinFloat: {
    color: '#fff',
    fontSize: 16,
    marginTop: 5,
  },
  publishButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginTop: 40,
    alignItems: 'center',
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default SellScreen;
