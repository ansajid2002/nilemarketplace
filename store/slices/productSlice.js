import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productsList: [

  ]
}
// sa
export const productsSlice = createSlice({
  name: "productsSlice",
  initialState: initialState,
  reducers: {

    toggleFavouriteProductslice: (state, action) => {
      const { uniquepid } = action.payload
      const updatedProductsList = state.productsList.map((item) => {
        if (item.uniquepid === uniquepid) {
          return {
            ...item,
            inFavorite: !item.inFavorite,
          };

        }
        return item;
      });
      return {
        ...state,
        productsList: updatedProductsList,
      };

    },

    updateproductsList: (state, action) => {
      state.productsList = action.payload;
    },
  },
}
)

export const { toggleFavouriteProductslice, updateproductsList } = productsSlice.actions

export default productsSlice.reducer