import { createSlice } from "@reduxjs/toolkit";
import { useState } from "react";



const initialState = {
  currentAddress: {

  },
  customerAddressData: [
    // {
    //   "address_id": 1,
    //   "given_name": "John",
    //   "family_name": "Doe",
    //   "email": "maria@example.es",
    //   "phone_number": "+34 91 234 5678",
    //   //old
    //   "name": "Calle de la Rosa, 7",
    //   "street": "Piso 3A",
    //   "postalCode": "28001",
    //   "country": "Spain",
    //   "region": "Madrid",
    //   "city": "Madrid",
    // },



  ]

};


export const customerAddressSlice = createSlice({
  name: 'customerdata',
  initialState,

  reducers: {
    addAddress: (state, action) => {
      const newItem = action.payload;
      const index = state.customerAddressData.findIndex(item => item.address_id === newItem.address_id);
      if (index !== -1) {
        // If an item with the same customer_id exists, update it
        state.customerAddressData[index] = newItem;
      } else {
        // If not, add the new item to the array
        state.customerAddressData.unshift(newItem);
      }


    },
    removeAddress: (state, action) => {
      const itemIdToRemove = action.payload.address_id;
      state.customerAddressData = state.customerAddressData.filter(item => item.address_id !== itemIdToRemove);

    },
    emptyAddress: (state, action) => {
      state.customerAddressData = []
    },
    changeCurrentAddress: (state, action) => {
      state.currentAddress = action.payload
    },
    loadAddress: (state, action) => {
      state.customerAddressData = action.payload
    }

  },
});

export const { addAddress, removeAddress, emptyAddress, changeCurrentAddress, loadAddress } = customerAddressSlice.actions;
export default customerAddressSlice.reducer;