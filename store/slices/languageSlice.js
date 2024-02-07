
//////////no use //////////////////////////////////////////////
import { createSlice } from "@reduxjs/toolkit";
import { useState } from "react";

const initialState = {
  selectedLangcode: "en",
  selectedLangname: "English",
  availablecountries: [
    { name: "India" }, { name: "Somalia" }, { name: "Kenya" }, { name: "Nigeria" }, { name: "Ethiopia" }, { name: "France" }
  ]
}

export const languageSlice = createSlice({
  name: "languageslice",
  initialState,
  reducers: {
    setLang: (state, action) => {
      const { newLanguagecode, newLanguagename } = action.payload;

      return {
        ...state,
        selectedLangcode: newLanguagecode,
        selectedLangname: newLanguagename
      };
    }
  }
})

export const { setLang } = languageSlice.actions

export default languageSlice.reducer