import React, { useState, useEffect, forwardRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, FlatList } from 'react-native';
import Toast from 'react-native-toast-message';

// Solución al error de refs: envolver el componente Toast con forwardRef
const ToastComponent = forwardRef((props, ref) => {
  return <Toast {...props} ref={ref} />;
});

const SellScreen = () => {
  const [weaponOptions, setWeaponOptions] = useState([]);
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [selectedSkin, setSelectedSkin] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [showWeaponDropdown, setShowWeaponDropdown] = useState(false);  // Estado para mostrar/ocultar dropdown de armas
  const [showSkinDropdown, setShowSkinDropdown] = useState(false);      // Estado para mostrar/ocultar dropdown de skins
  const [showConditionDropdown, setShowConditionDropdown] = useState(false); // Estado para mostrar/ocultar dropdown de condiciones

  // Listado de condiciones de skins
  const skinConditions = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];

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
    if (!selectedSkin || !selectedCondition) {
      Alert.alert('Error', 'Debes seleccionar una skin y su condición para publicar.');
      return;
    }

    try {
      const response = await fetch('YOUR_API_ENDPOINT_FOR_PUBLISHING', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skinId: selectedSkin.id,
          weapon: selectedWeapon.name,
          skinName: selectedSkin.name,
          condition: selectedCondition,
        }),
      });

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Skin publicada con éxito.',
        });
      } else {
        throw new Error('Error al publicar la skin.');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error.message,
      });
    }
  };

  return (
    <View style={styles.container}>
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
        <Text style={styles.previewText}>Your item</Text>
      {/* Previsualización */}
      {selectedSkin && selectedCondition && (
        
        <View style={styles.previewContainer}>
          <View style={styles.previewContent}>
            <Image source={{ uri: selectedSkin.image }} style={styles.weaponImage} />
            <View style={styles.previewDetails}>
              <Text style={styles.skinName}>{selectedSkin.name}</Text>
              <Text style={styles.skinCondition}>{selectedCondition}</Text>
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
    </View>
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
    textAlign: 'center'
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
    textAlign:'center'
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
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
    textAlign:'center'
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
