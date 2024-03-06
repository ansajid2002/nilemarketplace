import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    walletTotal: 0,
};

export const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {

        getwalletTotal(state, action) {
            state.walletTotal = action.payload;
        },

    },
});

export const { getwalletTotal } = walletSlice.actions;
export default walletSlice.reducer;
