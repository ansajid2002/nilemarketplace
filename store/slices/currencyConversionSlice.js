import { createSlice } from '@reduxjs/toolkit';

const conversionSlice = createSlice({
  name: 'conversion',
  initialState: {
    cachedConversionRates: {},
  },
  reducers: {
    cacheConversionRate: (state, action) => {
      // const { key, conversionRate } = action.payload;

      const { cachedKey,conversionRate } = action.payload;
      if (!state.cachedConversionRates[cachedKey]) {
        state.cachedConversionRates[cachedKey] = conversionRate;
      }
    },
  },
});

export const { cacheConversionRate } = conversionSlice.actions;

export default conversionSlice.reducer;

////////////////////////////////
