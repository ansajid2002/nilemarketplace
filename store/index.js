import { configureStore } from "@reduxjs/toolkit";
import bottomtabbarSlice from "./slices/counterslice";
import Locationslice from "./slices/Locationslice";
import ProductsSlice from "./slices/productSlice";
import categoriesSlice from "./slices/categoriesSlice";
import languageSlice from "./slices/languageSlice";
import currencySlice from "./slices/currencySlice";
import cartSlice from "./slices/cartSlice";
import wishlistSlice from "./slices/wishlistSlice";
import customerAddressSlice from "./slices/customerSlice";
import ordersSlice from "./slices/myordersSlice";
import customerDataSlice from "./slices/customerData";
import reviewSlice from "./slices/reviewSlice";
import walletSlice from "./slices/walletSlice";


export const store = configureStore({
        reducer: {
                bottomtabbar: bottomtabbarSlice,
                locations: Locationslice,
                products: ProductsSlice,
                categories: categoriesSlice,
                selectedLang: languageSlice,
                selectedCurrency: currencySlice,
                cart: cartSlice,
                wishlist: wishlistSlice,
                customerAddress: customerAddressSlice,
                ordersdata: ordersSlice,
                userData: customerDataSlice,
                reviews: reviewSlice,
                wallet: walletSlice
        },
})
