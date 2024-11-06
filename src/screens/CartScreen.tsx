import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Animated,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import { useStore } from '../store/store';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { COLORS, SPACING } from '../theme/theme';
import HeaderBar from '../components/HeaderBar';
import EmptyListAnimation from '../components/EmptyListAnimation';
import PaymentFooter from '../components/PaymentFooter';
import CartItem from '../components/CartItem';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const CartScreen = ({ navigation }: any) => {
  const [tradeUrl, setTradeUrl] = useState('');
  const [isTradeUrlEmpty, setIsTradeUrlEmpty] = useState(false);

  const CartList = useStore((state: any) => state.CartList);
  const CartPrice = useStore((state: any) => state.CartPrice) || 0;
  const tabBarHeight = useBottomTabBarHeight();
  const COMMISSION_RATE = 0.17;

  const buttonPressHandler = () => {
    if (!tradeUrl) {
      setIsTradeUrlEmpty(true);
      Alert.alert('Error', 'Por favor, ingrese su TradeUrl antes de continuar.');
      return;
    }
    
    const totalPriceWithCommission = (Number(CartPrice) * (1 + COMMISSION_RATE)).toFixed(2);
    navigation.push('Payment', { amount: totalPriceWithCommission, tradeUrl });
  };

  const removeFromCart = (id: string) => {
    useStore.setState((state: any) => ({
      CartList: state.CartList.filter(item => item.id !== id)
    }));
  };

  const handleSwipeableWillOpen = (id: string) => {
    removeFromCart(id);
  };

  const totalPriceWithCommission = (Number(CartPrice) * (1 + COMMISSION_RATE)).toFixed(2);
  const commissionAmount = (Number(CartPrice) * COMMISSION_RATE).toFixed(2);

  return (
    <View style={styles.ScreenContainer}>
      <StatusBar backgroundColor={COLORS.primaryBlackHex} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ScrollViewFlex}>
        <View style={[styles.ScrollViewInnerView, { marginBottom: tabBarHeight }]}>
          <View style={styles.ItemContainer}>
            <HeaderBar title="Cart" />

            {CartList.length === 0 ? (
              <EmptyListAnimation title={'Cart is Empty'} />
            ) : (
              <View style={styles.ListItemContainer}>
                {CartList.map((data: any) => (
                  <Swipeable
                    key={data.id}
                    onSwipeableWillOpen={() => handleSwipeableWillOpen(data.id)}
                    overshootRight={false}
                    friction={6}
                    renderRightActions={() => (
                      <View style={styles.deleteContainer}>
                        <Text style={styles.deleteText}>
                          Eliminar
                        </Text>
                      </View>
                    )}>
                    <Animated.View style={styles.cartItemContainer}>
                      <CartItem
                        id={data.id}
                        name={data.name}
                        imagelink_square={data.imagelink_square}
                        special_ingredient={data.special_ingredient}
                        roasted={data.roasted}
                        prices={data.prices}
                        type={data.type}
                      />
                    </Animated.View>
                  </Swipeable>
                ))}
              </View>
            )}

            <View style={styles.inputContainer}>
            
              <TextInput
                style={[
                  styles.input,
                  isTradeUrlEmpty && styles.inputError // Cambia el estilo si el campo está vacío
                ]}
                placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                placeholderTextColor={COLORS.secondaryLightGreyHex}
                value={tradeUrl}
                onChangeText={text => {
                  setTradeUrl(text);
                  setIsTradeUrlEmpty(false); // Resetea el mensaje de error si el usuario escribe
                }}
              />
              <Text style={styles.inputLabel}>
                Coloque su TradeUrl a donde se le enviará la oferta de intercambio
              </Text>
            </View>
          </View>

          {CartList.length !== 0 ? (
            <View style={styles.PaymentContainer}>
              <Text style={styles.CommissionText}>
                Tasa por cargo de servicio: ${commissionAmount}
              </Text>
              <Text style={styles.Commissionporcentaje}>
                0,15%
              </Text>
              <PaymentFooter
                buttonPressHandler={buttonPressHandler}
                buttonTitle="Realizar Pedido"
                price={{ price: totalPriceWithCommission, currency: '$' }}
              />
            </View>
          ) : null}
        </View>
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
  },
  ScrollViewInnerView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  ItemContainer: {
    flex: 1,
  },
  ListItemContainer: {
    paddingHorizontal: SPACING.space_20,
    gap: SPACING.space_20,
  },
  PaymentContainer: {
    marginTop: SPACING.space_10,
    backgroundColor: COLORS.primaryDarkGreyHex,
    padding: SPACING.space_20,
    borderRadius: 10,
  },
  CommissionText: {
    color: COLORS.primaryWhiteHex,
    fontSize: 13,
    marginVertical: SPACING.space_10,
    textAlign: 'center',
  },
  Commissionporcentaje: {
    color: COLORS.primaryWhiteHex,
    fontSize: 10,
    textAlign: 'center',
  },
  deleteContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: COLORS.primaryRedHex,
    width: 100,
    height: '100%',
    borderRadius: 10,
  },
  deleteText: {
    color: COLORS.primaryWhiteHex,
    padding: 20,
    fontWeight: 'bold',
  },
  cartItemContainer: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  inputContainer: {
    marginTop: SPACING.space_36,
    padding: SPACING.space_20,
  },
  inputLabel: {
    color: COLORS.primaryWhiteHex,
    fontSize: 12,
    marginTop: SPACING.space_8,
  },
  input: {
    backgroundColor: COLORS.primaryDarkGreyHex,
    padding: SPACING.space_10,
    borderRadius: 8,
    fontSize: 13,
    color: COLORS.primaryWhiteHex,
  },
  inputError: {
    borderColor: COLORS.primaryRedHex,
    borderWidth: 1,
  },
});

export default CartScreen;
