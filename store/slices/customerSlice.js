import { createSlice } from "@reduxjs/toolkit";
import { useState } from "react";



const initialState = {
  currentAddress: {

  },
  customerAddressData: [

  ],
  somalian_district: "WARTA NABADA",
  enable_districtselection: false

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
    },
    changeSomaliandistrict: (state, action) => {
      state.somalian_district = action.payload
    },
    changeEnabledistrictselection: (state, action) => {
      state.enable_districtselection = action.payload
    }

  },
});

export const { addAddress, removeAddress, emptyAddress, changeEnabledistrictselection, changeCurrentAddress, loadAddress, changeSomaliandistrict } = customerAddressSlice.actions;
export default customerAddressSlice.reducer;