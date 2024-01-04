import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  cartTotal: 0,
  callcartTotal:false
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const newItemId = action.payload?.uniquepid;
      const label = action.payload?.label;

      // Filter the items based on the label condition
      const filteredItems = state.cartItems.find(item => {
        if (label != null && label !== undefined) {
          return item?.uniquepid === newItemId && item?.label === label;
        }
        return item?.uniquepid === newItemId;
      });

      // Use the find method on the filtered array
      if (filteredItems) {
        filteredItems.added_quantity++;
      } else {
        state.cartItems.push(action.payload);
      }
    },

    removeItem(state, action) {
      const { label, uniquepid } = action.payload;

      // Use filter to create a new array without the matching item
      state.cartItems = state.cartItems.filter(item => (
        item.label !== label || item.uniquepid !== uniquepid
      ));
    },
    calloncartTotal() {
      state.callcartTotal= true
    },

    incrementItem(state, action) {
      state.cartItems = state.cartItems.map(item => {
        if (item.uniquepid === action.payload?.uniquepid && (item.label === null || item.label === undefined || item.label === action.payload?.label)) {
          item.added_quantity++;
        }
        return item;
        // // if (item.uniquepid === action.payload?.uniquepid || (item.label === null || item.label === undefined || item.label === action.payload?.label)) {
        // if (
        //   item.uniquepid === action.payload?.uniquepid &&
        //   (item.label === action.payload?.label || action.payload?.label === null)
        // ) {
        //   item.added_quantity++;
        // }

        // return item;

      }).filter(item => item.added_quantity !== 0);
    },


    decrementItem(state, action) {
      state.cartItems = state.cartItems.map(item => {
        if (item.uniquepid === action.payload?.uniquepid && (item.label === null || item.label === undefined || item.label === action.payload?.label)) {
          item.added_quantity--;
        }
        return item;
      }).filter(item => item.added_quantity !== 0);
    },

    emptyCart: (state) => {
      state.cartTotal = 0
      state.cartItems = []; // Clears the cartItems array
    },

    fetchcart(state, action) {
      state.cartItems = action.payload
    },

    addCarts(state, action) {
      const newItems = action.payload;
      const existingUniqueIds = state.cartItems.map(item => item?.uniquepid);
      // Filter out items with the same uniqueid and label if it exists
      const filteredNewItems = newItems.filter(newItem => {
        return (
          !existingUniqueIds.includes(newItem?.uniquepid)
        );
      });

      // Append the filtered new items to the existing cartItems array
      state.cartItems = [...state.cartItems, ...filteredNewItems];
    },

    ////////////////////////FOR CartTotal///////////////////////////////////////////
    getCartTotal(state, action) {
      state.cartTotal = action.payload
    },

    incrementCartTotal: (state, action) => {
      state.cartTotal += 1;
    },
    decrementCartTotal: (state, action) => {
      state.cartTotal -= 1;
    },
    decrementCartTotalremove: (state, action) => {
      console.log(action.payload, "payload");
      state.cartTotal -= action.payload
    }



  },
});

console.log(initialState.callcartTotal,"initialState");

export const { addItem, removeItem, calloncartTotal,fetchcart, incrementItem, decrementCartTotalremove, decrementItem, updateproductsListcart, emptyCart, addCarts, getCartTotal, incrementCartTotal, decrementCartTotal } = cartSlice.actions;
export default cartSlice.reducer;