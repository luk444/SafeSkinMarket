import {create} from 'zustand';
import {produce} from 'immer';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStore = create(
  persist(
    (set) => ({
      CartPrice: 0,
      FavoritesList: [],
      CartList: [],
      OrderHistoryList: [],
      user: undefined,
      setUser: (user: any) =>
        set(
          produce(state => {
              state.user = user;
          }),
        ),
      addToCart: (cartItem: any) =>
        set(
          produce(state => {
            const itemExists = state.CartList.some((item: any) => item.id === cartItem.id);
            if (!itemExists) {
              state.CartList.push(cartItem);
            }
          }),
        ),
      removeFromCart: (id: number) =>
        set(
          produce(state => {
            state.CartList = state.CartList.filter((el:any)=> el.id !== id);
          }),
        ),
      calculateCartPrice: () =>
        set(
          produce(state => {
            const cart = state.CartList;
            const totalPrice = cart.reduce((total: number, product: any) => {
              return total + product.price;
            }, 0);
            state.CartPrice = totalPrice.toFixed(2).toString();
          }),
        ),

      addToFavoriteList: (data: any) =>
        set(
          produce(state => {
          const itemExists = state.FavoritesList.some((item: any) => item.id === data.id);
            if (!itemExists) {
              state.FavoritesList.push(data);
            }
          }),
        ),
      deleteFromFavoriteList: (id: number) =>
        set(
          produce(state => {
            state.FavoritesList.filter((el:any) => el.id !== id)
          }),
        ),
      addToOrderHistoryListFromCart: () =>
        set(
          produce(state => {
            let temp = state.CartList.reduce(
              (accumulator: number, currentValue: any) =>
                accumulator + parseFloat(currentValue.ItemPrice),
              0,
            );
            if (state.OrderHistoryList.length > 0) {
              state.OrderHistoryList.unshift({
                OrderDate:
                  new Date().toDateString() +
                  ' ' +
                  new Date().toLocaleTimeString(),
                CartList: state.CartList,
                CartListPrice: temp.toFixed(2).toString(),
              });
            } else {
              state.OrderHistoryList.push({
                OrderDate:
                  new Date().toDateString() +
                  ' ' +
                  new Date().toLocaleTimeString(),
                CartList: state.CartList,
                CartListPrice: temp.toFixed(2).toString(),
              });
            }
            state.CartList = [];
          }),
        ),
      }),
    {
      name: 'coffee-app',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);


