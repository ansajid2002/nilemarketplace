import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    reviewItems: [],
};


export const reviewSlice = createSlice({
    name: 'reviewItems',
    initialState,
    reducers: {
        updateReviewlistener: (state, action) => {
            state.reviewItems = action.payload;
        },
    },
});

export const { updateReviewlistener } = reviewSlice.actions;
export default reviewSlice.reducer;