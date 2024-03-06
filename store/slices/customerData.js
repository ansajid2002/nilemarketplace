import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    customerData: [],
};


export const customerDataSlice = createSlice({
    name: 'customer',
    initialState,

    reducers: {
        updateCustomerData: (state, action) => {
            state.customerData = [action.payload];
        },
        emptyCustomer: (state, action) => {
            state.customerData = []
        }
    },
});


export const { updateCustomerData, emptyCustomer } = customerDataSlice.actions;
export default customerDataSlice.reducer;