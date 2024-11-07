import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { COLORS, FONTFAMILY, FONTSIZE, SPACING } from '../theme/theme';
import GradientBGIcon from './GradientBGIcon';
import ProfilePic from './ProfilePic';
import { auth } from '../firebase';

interface HeaderBarProps {
  title?: string;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ title }) => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Obtener el nombre del usuario autenticado desde Firebase
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.displayName) {
      setUsername(currentUser.displayName); // Establecer el nombre del usuario
    }
  }, []);

  return (
    <View style={styles.HeaderContainer}>
      <GradientBGIcon
        name="grid-outline"
        color={COLORS.primaryLightGreyHex}
        size={FONTSIZE.size_16}
      />
      <Text style={styles.HeaderText}>
        {username ? `Bienvenido, ${username}` : title} {/* Mostrar nombre de usuario si está disponible */}
      </Text>
      <ProfilePic />
    </View>
  );
};

const styles = StyleSheet.create({
  HeaderContainer: {
    padding: SPACING.space_30,
    marginTop: SPACING.space_36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  HeaderText: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_20,
    color: COLORS.primaryWhiteHex,
  },
});

export default HeaderBar;
