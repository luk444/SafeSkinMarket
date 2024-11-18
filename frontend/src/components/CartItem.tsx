import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BORDERRADIUS, COLORS, FONTFAMILY, FONTSIZE, SPACING } from '../theme/theme';
import { useStore } from '../store/store';

const CartItem = ({ item }: any) => {
  const { id, skin, price, image, condition, float, userName } = item;
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  return (
    <View style={styles.CartItemContainer}>
      <View style={styles.ImageContainer}>
        <Image source={{ uri: image }} style={styles.ItemImage} />
      </View>

      <View style={styles.ItemInfo}>
        <Text style={styles.ItemName}>{skin}</Text>
        <Text style={styles.ItemPrice}>${price}</Text>
        <Text style={styles.ItemCondition}>Condition: {condition}</Text>
        <Text style={styles.ItemFloat}>Float: {float}</Text>
        <Text style={styles.ItemSeller}>Sold by: {userName || 'Unknown Seller'}</Text>
        
        <View style={styles.ItemActions}>
          <TouchableOpacity onPress={()=>removeFromCart(id)}>
            <Ionicons name="trash-bin-outline" size={24} color={COLORS.primaryRedHex} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  CartItemContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryBlackHex,
    borderRadius: BORDERRADIUS.radius_10,
    padding: SPACING.space_10,
    marginVertical: SPACING.space_4,
    alignItems: 'center',
  },
  ImageContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDERRADIUS.radius_10,
    overflow: 'hidden',
    marginRight: SPACING.space_10,
  },
  ItemImage: {
    width: '100%',
    height: '100%',
  },
  ItemInfo: {
    flex: 1,
  },
  ItemName: {
    fontFamily: FONTFAMILY.poppins_bold,
    fontSize: FONTSIZE.size_16,
    color: COLORS.primaryWhiteHex,
  },
  ItemPrice: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.primaryWhiteHex,
  },
  ItemCondition: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_12,
    color: COLORS.primaryWhiteHex,
  },
  ItemFloat: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_12,
    color: COLORS.primaryWhiteHex,
  },
  ItemSeller: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_12,
    color: COLORS.primaryOrangeHex,
  },
  ItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.space_4,
  },
});

export default CartItem;
