import { createSlice } from "@reduxjs/toolkit";
import { useState } from "react";

const initialState = {
    locationcountry:"SO",
    locationstate:"GE",
    locationcity:"Garbahaarrey"
}

export const locationSlice = createSlice ({
   name:"locationslice", 
   initialState, 
   reducers : {
    setLocation: (state, action) => {
        const { locationcountry, locationstate, locationcity } = action.payload;
        return {
          ...state,
          locationcountry,
          locationstate,
          locationcity,
        };
      },
   } 
})

export const { setLocation } = locationSlice.actions

export default locationSlice.reducer