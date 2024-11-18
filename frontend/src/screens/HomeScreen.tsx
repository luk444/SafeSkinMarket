import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { db, collection, getDocs } from '../firebase'; // Importa Firebase
import HeaderBar from '../components/HeaderBar';
import CoffeeCard from '../components/CoffeeCard';
import { BORDERRADIUS, COLORS, FONTFAMILY, FONTSIZE, SPACING } from '../theme/theme';

// Firestore query to get products
const fetchProductsFromFirestore = async () => {
  const querySnapshot = await getDocs(collection(db, 'products'));
  let products = [];
  querySnapshot.forEach((doc) => {
    products.push({ ...doc.data(), id: doc.id });
  });
  return products;
};

const HomeScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [categoryIndex, setCategoryIndex] = useState({ index: 0, category: 'All' });
  const [sortedProducts, setSortedProducts] = useState([]);

  const tabBarHeight = useBottomTabBarHeight();

  // Fetch products from Firestore
  useEffect(() => {
    const loadProducts = async () => {
      const products = await fetchProductsFromFirestore();
      setProducts(products);
      setSortedProducts(products);
      setCategories(getCategoriesFromData(products));
    };
    loadProducts();
  }, []);

  const getCategoriesFromData = (data) => {
    let temp = {};
    for (let i = 0; i < data.length; i++) {
      if (temp[data[i].category] == undefined) {
        temp[data[i].category] = 1;
      } else {
        temp[data[i].category]++;
      }
    }
    let categories = Object.keys(temp);
    categories.unshift('All');
    return categories;
  };

  const searchCoffee = (search) => {
    if (search !== '') {
      setSortedProducts(products.filter((item) => item.skin.toLowerCase().includes(search.toLowerCase())));
    } else {
      setSortedProducts(products);
    }
  };

  const resetSearchCoffee = () => {
    setSearchText('');
    setSortedProducts(products);
  };

  const handleCategorySelect = (category) => {
    setCategoryIndex({ index: categories.indexOf(category), category });
    if (category === 'All') {
      setSortedProducts(products);
    } else {
      setSortedProducts(products.filter((item) => item.category === category));
    }
  };

  return (
    <View style={styles.ScreenContainer}>
      <StatusBar backgroundColor={COLORS.primaryBlackHex} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.ScrollViewFlex}>
        <HeaderBar />

        <Text style={styles.ScreenTitle}>Find the best{'\n'}Skin for you</Text>

        {/* Search Input */}
        <View style={styles.InputContainerComponent}>
          <TouchableOpacity onPress={() => searchCoffee(searchText)}>
            <Ionicons
              style={styles.InputIcon}
              name="search"
              size={24}
              color={searchText.length > 0 ? COLORS.primaryOrangeHex : COLORS.primaryLightGreyHex}
            />
          </TouchableOpacity>
          <TextInput
            placeholder="Find Your Skin..."
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              searchCoffee(text);
            }}
            placeholderTextColor={COLORS.primaryLightGreyHex}
            style={styles.TextInputContainer}
          />
          {searchText.length > 0 ? (
            <TouchableOpacity onPress={resetSearchCoffee}>
              <Ionicons style={styles.InputIcon} name="close" size={FONTSIZE.size_16} color={COLORS.primaryLightGreyHex} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Scroller */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.CategoryScrollViewStyle}>
          {categories.map((category, index) => (
            <View key={index.toString()} style={styles.CategoryScrollViewContainer}>
              <TouchableOpacity
                style={styles.CategoryScrollViewItem}
                onPress={() => handleCategorySelect(category)}>
                <Text style={[styles.CategoryText, categoryIndex.index === index ? { color: COLORS.primaryOrangeHex } : {}]}>
                  {category}
                </Text>
                {categoryIndex.index === index ? <View style={styles.ActiveCategory} /> : null}
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Coffee Flatlist */}
        <FlatList
          horizontal
          data={sortedProducts}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() =>
              navigation.push('Details', {
                id: item.id,
                skin: item.skin,
                condition: item.condition,
                float: item.float,
                price: item.price,
                category: item.category,
                userName: item.userName,
                image: item.weaponImage
              })
            }>
              <CoffeeCard
                id={item.id}
                skin={item.skin}
                condition={item.condition}
                float={item.float}
                price={item.price}
                category={item.category}
                userName={item.userName}
                image={item.weaponImage}
              />
            </TouchableOpacity>
            
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.EmptyListText}>No skins available</Text>}
        />
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  ScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBlackHex,
  },
  ScrollViewFlex: {
    flexGrow: 1,
  },
  ScreenTitle: {
    fontSize: FONTSIZE.size_28,
    fontFamily: FONTFAMILY.poppins_semibold,
    color: COLORS.primaryWhiteHex,
    paddingLeft: SPACING.space_30,
    paddingTop: SPACING.space_20,
  },
  InputContainerComponent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryLightGreyHex,
    paddingVertical: SPACING.space_10,
    paddingHorizontal: SPACING.space_15,
    marginTop: SPACING.space_20,
    borderRadius: BORDERRADIUS.radius_20,
  },
  InputIcon: {
    marginRight: SPACING.space_10,
  },
  TextInputContainer: {
    flex: 1,
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.primaryDarkGreyHex,
  },
  CategoryScrollViewStyle: {
    paddingVertical: SPACING.space_20,
    marginLeft: SPACING.space_30,
  },
  CategoryScrollViewContainer: {
    marginRight: SPACING.space_30,
  },
  CategoryScrollViewItem: {
    paddingBottom: SPACING.space_10,
    paddingHorizontal: SPACING.space_20,
  },
  CategoryText: {
    fontSize: FONTSIZE.size_14,
    color: COLORS.primaryLightGreyHex,
    fontFamily: FONTFAMILY.poppins_regular,
  },
  ActiveCategory: {
    width: '100%',
    height: 3,
    backgroundColor: COLORS.primaryOrangeHex,
    marginTop: SPACING.space_10,
  },
  EmptyListText: {
    fontSize: FONTSIZE.size_16,
    color: COLORS.primaryWhiteHex,
    fontFamily: FONTFAMILY.poppins_regular,
    textAlign: 'center',
    marginTop: SPACING.space_20,
  },
  CategoryTextSelected: {
    color: COLORS.primaryOrangeHex,
  },
  CardContainer: {
    marginTop: SPACING.space_30,
    paddingLeft: SPACING.space_30,
  },
  CoffeeCardContainer: {
    marginRight: SPACING.space_20,
  },
  CoffeeCardImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: BORDERRADIUS.radius_15,
    marginBottom: SPACING.space_10,
  },
  CoffeeCardTextContainer: {
    alignItems: 'center',
  },
  CoffeeCardTitle: {
    fontSize: FONTSIZE.size_16,
    fontFamily: FONTFAMILY.poppins_semibold,
    color: COLORS.primaryWhiteHex,
  },
  CoffeeCardPrice: {
    fontSize: FONTSIZE.size_14,
    fontFamily: FONTFAMILY.poppins_regular,
    color: COLORS.primaryWhiteHex,
  },
  ButtonAddToCart: {
    marginTop: SPACING.space_10,
    backgroundColor: COLORS.primaryOrangeHex,
    paddingVertical: SPACING.space_8,
    paddingHorizontal: SPACING.space_15,
    borderRadius: BORDERRADIUS.radius_10,
  },
  ButtonText: {
    fontSize: FONTSIZE.size_14,
    fontFamily: FONTFAMILY.poppins_semibold,
    color: COLORS.primaryWhiteHex,
  },
});

export default HomeScreen;