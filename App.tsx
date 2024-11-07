import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import Toast from 'react-native-toast-message';

// Importa las pantallas
import CustomIcon from './src/components/CustomIcon'; 
import TabNavigator from './src/navigators/TabNavigator';
import DetailsScreen from './src/screens/DetailsScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        CustomIcons: require('../SafeSkinMarket/src/assets/fonts/app_icons.ttf'), // Asegúrate de la ruta
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // O muestra un spinner o mensaje de carga
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            // Si está autenticado, muestra TabNavigator
            <Stack.Screen
              name="Tab"
              component={TabNavigator}
              options={{ animation: 'slide_from_bottom' }}
            />
          ) : (
            // Si no está autenticado, muestra LoginScreen
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ animation: 'slide_from_bottom' }}
              initialParams={{ setIsAuthenticated }} // Pasar la función a LoginScreen
            />
          )}
          <Stack.Screen
            name="Details"
            component={DetailsScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
