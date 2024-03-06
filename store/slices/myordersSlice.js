import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  ordersData: []

};


export const ordersSlice = createSlice({
  name: 'ordersdata',
  initialState,

  reducers: {
    addOrders(state, action) {
      const newOrders = action.payload;
      const existingOrderIds = state.ordersData.map(order => order?.order_id);

      // Filter out orders with the same order_id
      const filteredNewOrders = newOrders.filter(newOrder => {
        return !existingOrderIds.includes(newOrder?.order_id);
      });

      // Append the filtered new orders to the existing ordersData array
      state.ordersData = [...state.ordersData, ...filteredNewOrders];
    },
    emptyOrder: (state) => {
      state.ordersData = initialState.ordersData; // Clears the ordersData array
    },

  },
});


export const { addOrders, emptyOrder } = ordersSlice.actions;
export default ordersSlice.reducer;