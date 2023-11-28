import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    bottomtabbarIndex: 1,
    searchfocus: false,
    adminurl:"",
    loaderstate:false
}



export const bottomtabbarSlice = createSlice({
    name: "bottomtabbar",
    initialState,
    reducers: {
        changetabbarIndex: (state, action) => {
            state.bottomtabbarIndex = action.payload
        },
        changeSearchFocus: (state, action) => {
            state.searchfocus = action.payload
        },
        changeAdminurl:(state,action) =>{
            state.adminurl = action.payload
        },
        loaderOn:(state,action) => {
            state.loaderstate = true
        },
        loaderOff:(state,action) => {
            state.loaderstate = false
        },
        toggleloader: (state, action) => {
            state.loaderstate = !state.loaderstate;
          },
      

    }
})

export const { changetabbarIndex, changeSearchFocus,changeAdminurl,loaderOn,loaderOff,toggleloader } = bottomtabbarSlice.actions

export default bottomtabbarSlice.reducer 