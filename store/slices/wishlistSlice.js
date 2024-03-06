import { createSlice } from "@reduxjs/toolkit";
import { useState } from "react";



const initialState = {
  wishlistItems: [

  ],

};


export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,

  reducers: {
    addItemToWishlist: (state, action) => {

      const newItem = action.payload;
      const existingItem = state.wishlistItems.find(item => item.uniqueid === newItem.uniquepid);

      if (existingItem) {
        // Item already exists in the wishlist, you can handle it as needed
        // For example, you might want to update its quantity or show a message
        // existingItem.quantity++;
        // Show a message that the item is already in the wishlist
      } else {
        state.wishlistItems.push(newItem);
      }

    },
    removeItemFromWishlist: (state, action) => {

      const itemIdToRemove = action.payload.uniquepid;
      state.wishlistItems = state.wishlistItems.filter(item => item.uniquepid !== itemIdToRemove);

    },
    updateproductsListwishlist: (state, action) => {
      state.wishlistItems = action.payload;
    },

    emptyWishlist: (state, action) => {
      state.wishlistItems = []
    }

  },
});

export const { addItemToWishlist, removeItemFromWishlist, updateproductsListwishlist, emptyWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;