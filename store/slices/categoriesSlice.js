import { createSlice } from "@reduxjs/toolkit";

//   Now, the updatedData array will contain the modified objects with the category_name and subcategory_name properties populated based on the categoriesObject mapping.

// require('../../assets/images/mobiles/mobile3.png'),
const categoryData = [
]


let subcategoryIdCounter = 1;

const newArr = categoryData.map((singleobj, index) => {
    return {
        "category_id": index + 1,
        "category_name": singleobj.category,
        "category_description": "asddas dasdasdasd",
        category_image_url: singleobj.category_img,
        "category_status": true,
        "created_at": "2023-07-27T04:56:21.153Z",
        "updated_at": "2023-07-27T04:56:21.153Z",
        "category_type": singleobj.category_type,
        "subcategories": singleobj.subcategories.map((subcategory, subIndex) => {
            const subcategoryId = subcategoryIdCounter++;
            return {
                "subcategory_id": subcategoryId,
                "subcategory_name": subcategory,
                "subcategory_description": "as",
                "subcategory_image_url": "as",
                "parent_category_id": index + 1,
                "created_at": "2023-08-01T07:25:17.886Z",
                "updated_at": "2023-08-01T11:58:44.644Z"
            };
        })
    };
});



const initialState = {
    categoriesData: newArr
}


export const categoriesSlice = createSlice({
    name: "categoriesSlice",
    initialState: initialState,
    reducers: {
       

        toggleFavourite: (state, action) => {
            const { id } = action.payload;
            const item = state.productsList.find((item) => item.uniquepid === id);
            if (item) {
                item.inFavorite = !item.inFavorite;
            }
        },
        updatecategoriesList: (state, action) => {
            state.categoriesData = action.payload;
        },
    },
}
)

export const { toggleFavourite, updatecategoriesList } = categoriesSlice.actions

export default categoriesSlice.reducer

///////////////////////////////////////////


