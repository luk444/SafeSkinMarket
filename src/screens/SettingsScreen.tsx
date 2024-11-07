import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTFAMILY, FONTSIZE, SPACING, BORDERRADIUS } from '../theme/theme';
import { useNavigation } from '@react-navigation/native'; // Importa useNavigation
import { getAuth } from 'firebase/auth'; // Importa getAuth desde Firebase

const SettingsScreen = () => {
  const [user, setUser] = useState(null); // Estado para almacenar los datos del usuario
  const navigation = useNavigation();

  useEffect(() => {
    // Obtén el usuario autenticado
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      // Si hay un usuario autenticado, guarda sus datos en el estado
      setUser({
        name: currentUser.displayName || "Nombre no disponible",  // Si no hay displayName, muestra un valor predeterminado
        email: currentUser.email || "Email no disponible",  // Si no hay email, muestra un valor predeterminado
      });
    } else {
      // Si no hay usuario autenticado, redirige al login
      navigation.navigate('Login');
    }
  }, []);

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    const auth = getAuth();
    auth.signOut(); // Cierra sesión en Firebase

    // Navegar a la pantalla de Login
    navigation.navigate('Login');
  };

  // Si el usuario no ha sido cargado aún, muestra un loading
  if (!user) {
    return <Text style={styles.loadingText}>Cargando...</Text>;
  }

  return (
    <View style={styles.ScreenContainer}>
      <StatusBar backgroundColor={COLORS.primaryBlackHex} />
      <ScrollView contentContainerStyle={styles.ScrollViewFlex} showsVerticalScrollIndicator={false}>
        <Text style={styles.ScreenTitle}>Settings</Text>

        {/* Subtítulo Información del usuario */}
        <Text style={styles.SubTitle}>Información del usuario</Text>

        {/* Información del usuario */}
        <View style={styles.UserInfoContainer}>
          <Text style={styles.UserInfoUser}>Nombre de usuario:</Text>
          <Text style={styles.UserInfoText}>{user.name}</Text>
          <Text style={styles.UserInfoEmail}>Email:</Text>
          <Text style={styles.UserInfoText}>{user.email}</Text>
        </View>

        {/* Espaciado para que el botón esté en la parte inferior */}
        <View style={{ flex: 1 }} />

        {/* Botón de Cerrar sesión */}
        <TouchableOpacity style={styles.SaveButton} onPress={handleLogout}>
          <Text style={styles.SaveButtonText}>Cerrar sesión</Text>
          <Ionicons
            name="log-out-outline"
            size={FONTSIZE.size_20}
            color={COLORS.primaryWhiteHex}
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  ScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBlackHex,
  },
  ScrollViewFlex: {
    flexGrow: 1,
    paddingHorizontal: SPACING.space_30,
  },
  ScreenTitle: {
    fontSize: FONTSIZE.size_28,
    fontFamily: FONTFAMILY.poppins_semibold,
    textAlign: 'center',
    color: COLORS.primaryWhiteHex,
    marginTop: '20%', // 20% de margen superior
    marginBottom: '20%',
  },
  SubTitle: {
    fontSize: FONTSIZE.size_20,
    fontFamily: FONTFAMILY.poppins_semibold,
    color: COLORS.primaryWhiteHex,
    marginTop: SPACING.space_30,
  },
  UserInfoContainer: {
    marginTop: SPACING.space_20,
  },
  UserInfoUser: {
    fontSize: FONTSIZE.size_16,
    fontFamily: FONTFAMILY.poppins_regular,
    color: COLORS.primaryWhiteHex,
    marginTop: SPACING.space_36,
  },
  UserInfoEmail: {
    fontSize: FONTSIZE.size_16,
    fontFamily: FONTFAMILY.poppins_regular,
    color: COLORS.primaryWhiteHex,
    marginTop: SPACING.space_20,
  },
  UserInfoText: {
    fontSize: FONTSIZE.size_16,
    fontFamily: FONTFAMILY.poppins_regular,
    color: COLORS.primaryWhiteHex,
    marginBottom: SPACING.space_10,
  },
  SaveButton: {
    backgroundColor: COLORS.primaryOrangeHex,
    marginTop: SPACING.space_40,
    paddingVertical: SPACING.space_12,
    borderRadius: BORDERRADIUS.radius_20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.space_37, // Agregar espacio inferior
  },
  SaveButtonText: {
    color: COLORS.primaryWhiteHex,
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_16,
    marginRight: SPACING.space_10,
  },
  loadingText: {
    color: COLORS.primaryWhiteHex,
    fontSize: FONTSIZE.size_16,
    textAlign: 'center',
    marginTop: '50%',
  },
});

export default SettingsScreen;
