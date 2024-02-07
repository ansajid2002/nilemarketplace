import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  appLangcode: "en",
  appLangname: "English",
    defaultCurrency : "US Dollar",
    currencyCode : "USD",
    c_symbol : "$",
    availablecountries: [
     
      {
        name: "Somalia",
        image:require("../../assets/images/flags/somalia.png"),
       
       
      },
      {
        name: "Kenya", 
        image:require("../../assets/images/flags/kenya.png"),
        
        
      },
      {
        name: "Ethiopia",
        image:require("../../assets/images/flags/ethiopia.png"),
        
      },
      {
        name: "India",
        image:require("../../assets/images/flags/india.png"),
        
      },
      {
        name: "France",
        image:require("../../assets/images/flags/france.png"),
       
      },
      {
        name: "Saudi Arabia",
        image:require("../../assets/images/flags/saudi-arabia.png"),
       
      },
      {
        name: "Yemen",
        image:require("../../assets/images/flags/yemen.png"),
       
      },
      {
        name: "United Arab Amirates",
        image:require("../../assets/images/flags/united-arab-emirates.png"),
       
      },
      {
        name: "Bangladesh",
        image:require("../../assets/images/flags/bangladesh.png"),
       
      },
      {
        name: "Mali",
        image:require("../../assets/images/flags/mali.png"),
       
      },
      {
        name: "Senegal",
        image:require("../../assets/images/flags/senegal.png"),
       
       
      }
    ],
    languages: [ 
      { name: "English", langcode: "en" },
      { name: "Somali", langcode: "so" },   
      { name: "Arabic", langcode: "ar" },
      { name: "Swahili", langcode: "sw" },
      { name: "Amharic", langcode: "am" },
      { name: "French", langcode: "fr" },
      { name: "Hindi", langcode: "hi" },
    ] ,
    appcountry:"Somalia"
    
}




export const currencySlice = createSlice ({
   name:"currencyslice",
   initialState,
   reducers : {
    setCurrency: (state, action) => {
       
        const {name,code ,symbol} = action.payload;
    

        return {
          ...state,
          defaultCurrency : name,
          currencyCode : "USD",
          c_symbol:symbol
        };
      },
      setAppcountry : (state,action) => {
        return {
          ...state,
          appcountry:action.payload
        }
      },
      setAppLang : (state,action) => {
        state.appLangcode = action.payload
      },
      setAppLangname : (state,action) => {
        state.appLangname = action.payload
      },
   } 
})

export const { setCurrency ,setAppcountry,setAppLang,setAppLangname} = currencySlice.actions

export default currencySlice.reducer