import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useStore } from '../store/store';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import ImageBackgroundInfo from '../components/ImageBackgroundInfo';
import PaymentFooter from '../components/PaymentFooter';

const DetailsScreen = ({ navigation, route }: any) => {
  const { id, skin, price, image, condition, float, userName } = route.params;
  const addToCart = useStore((state: any) => state.addToCart);
  const calculateCartPrice = useStore((state: any) => state.calculateCartPrice);

  const BackHandler = () => {
    navigation.pop();
  };

  const addToCarthandler = () => {
    addToCart({
      id,
      name: skin,
      price,
    });
    calculateCartPrice();
    navigation.navigate('Cart');
  };

  return (
    <View style={styles.ScreenContainer}>
      <StatusBar backgroundColor={COLORS.primaryBlackHex} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ScrollViewFlex}>
        <ImageBackgroundInfo
          EnableBackHandler={true}
          weaponImage={{ uri: image }} // Pasa la imagen del arma aquí
          type="Weapon"
          id={id}
          favourite={false}
          name={skin}
          condition={condition}
          ingredients="Ingredients"
          average_rating={4.5}
          ratings_count="120"
          float={float} // Se agrega el float aquí
          userName={userName} // Agrega el nombre del vendedor aquí
          BackHandler={BackHandler}
        />

        <View style={styles.FooterInfoArea}>
          {/* Información del vendedor */}
          <Text style={styles.InfoTitle}>Vendedor</Text>
          <View style={styles.VendorInfo}>
            <Text style={styles.VendorName}>
              {userName || 'Unknown Seller'}
            </Text>
          </View>
          
          {/* Agregar al carrito */}
          <PaymentFooter
            price={{ price, currency: '$' }} // Aquí pasas el precio y la moneda
            buttonPressHandler={addToCarthandler}
            buttonTitle="Add to Cart"
          />
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
  FooterInfoArea: {
    marginTop: SPACING.space_10,
    marginBottom: SPACING.space_20,
    marginHorizontal: SPACING.space_20,
  },
  InfoTitle: {
    fontFamily: FONTFAMILY.poppins_bold,
    fontSize: FONTSIZE.size_20,
    color: COLORS.primaryWhiteHex,
  },
  DescriptionText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_12,
    color: COLORS.primaryWhiteHex,
  },
  SellerSection: {
    marginTop: SPACING.space_10,
  },

  VendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.space_20,
    backgroundColor: COLORS.primaryDarkGreyHex,
    borderRadius: BORDERRADIUS.radius_20,
  },
  Avatar: {
    width: 90,
    height: 90,
    borderRadius: BORDERRADIUS.radius_20,
    marginRight: SPACING.space_10,
    backgroundColor: COLORS.primaryRedHex,
  },
  VendorName: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.primaryOrangeHex,
  },
});

export default DetailsScreen;
