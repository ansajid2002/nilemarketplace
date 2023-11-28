import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { updateproductsList } from '../store/slices/productSlice'
import { updateproductsListwishlist } from '../store/slices/wishlistSlice'
import { addCarts, addItem, updateproductsListcart } from '../store/slices/cartSlice'
import { AdminUrl, getVariantsOfCatSubcat } from '../constant'
import { updatecategoriesList } from '../store/slices/categoriesSlice'
import { updateCustomerData } from '../store/slices/customerData'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { addOrders } from '../store/slices/myordersSlice'


const conversionratesfrombackend = [
  {
    old_currency: "USD",
    new_currency: "INR",
    conversionRate: 85
  },
  {
    old_currency: "USD",
    new_currency: "SOS",
    conversionRate: 8
  },
  {
    old_currency: "USD",
    new_currency: "ETB",
    conversionRate: 20
  },
  {
    old_currency: "USD",
    new_currency: "KSH",
    conversionRate: 0.5
  },
  {
    old_currency: "USD",
    new_currency: "EUR",
    conversionRate: 100
  },
]


const Currencyconvertedfile = () => {
  const [filterdata, setFilterData] = useState([])
  const [a, setA] = useState(0)
  const dispatch = useDispatch()
  const { productsList } = useSelector((store) => store.products)
  const { currencyCode } = useSelector((store) => store.selectedCurrency)
  const { customerData } = useSelector((store) => store.userData)

  const customerId = customerData[0]?.customer_id


  const fetchCategoriesAndSubcategories = async () => {
    try {
      const categoryResponse = await fetch(`${AdminUrl}/api/getAllProductCatgeory`);
      const subcategoryResponse = await fetch(
        `${AdminUrl}/api/getAllSubcategories`
      );

      if (categoryResponse.ok && subcategoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        const subcategoryData = await subcategoryResponse.json();

        // Map each category to add a 'subcategories' array containing its associated subcategories
        const categoriesWithSubcategories = categoryData.map((cat) => ({
          ...cat,
          subcategories: subcategoryData.filter(
            (subcat) => subcat.parent_category_id === cat.category_id
          ),
        }));

        // Sort the categories by their 'category_id' before updating the state
        const sortedCategories = categoriesWithSubcategories.sort(
          (a, b) => a.category_id - b.category_id
        );
        dispatch(updatecategoriesList(sortedCategories))
      } else {
        // Handle error responses
        console.error(
          "Error fetching categories:",
          categoryResponse.statusText
        );
        console.error(
          "Error fetching subcategories:",
          subcategoryResponse.statusText
        );
      }
    } catch (error) {
      // Handle error
      console.error("Error fetching data:", error);
    }
  };

  const getAllProducts = async () => {
    try {
      const response = await fetch(`${AdminUrl}/api/AllProductsVendors?currency=${currencyCode}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // Log the data
      dispatch(updateproductsList(data));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getAllCustomerOrder = async () => {
    if (customerId === null || customerId === undefined) {
      // Handle the case when customerId is null or undefined, such as displaying an error message or taking appropriate action.
      return;
    }
    try {
      const response = await fetch(`${AdminUrl}/api/getAllCustomerOrder/${customerId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // Log the data
      dispatch(addOrders(data))
      // You can dispatch or process the data here as needed.
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getCustomerWishlist = async () => {
    if (customerId === null || customerId === undefined) {
      // Handle the case when customerId is null or undefined, such as displaying an error message or taking appropriate action.
      return;
    }
    try {
      const response = await fetch(`${AdminUrl}/api/wishlistdata?customer_id=${customerId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // Log the data
      dispatch(updateproductsListwishlist(data))
      // dispatch(addOrders(data))
      // You can dispatch or process the data here as needed.
    } catch (error) {
      console.error('Error:', error);
    }
  };


  useEffect(() => {
    // Check if loggedid and customerData are available in AsyncStorage
    async function checkAuthentication() {
      // const loggedid = await AsyncStorage.getItem('loggedid');
      const storedCustomerData = await AsyncStorage.getItem('customerData');

      // If both loggedid and customerData are available, set isAuthenticated to true
      if (storedCustomerData) {
        dispatch(updateCustomerData(JSON.parse(storedCustomerData)))
      }
    }

    checkAuthentication();
  }, []);

  // Call the function to fetch and log the data

  useEffect(() => {
    fetchCategoriesAndSubcategories()
    getAllProducts();
    getAllCustomerOrder()
    getCustomerWishlist()
  }, [customerId, currencyCode])



  const [dataFetched, setDataFetched] = useState(false);

  async function fetchCartData() {
    try {
      if (!customerId) return
      const urlWithCustomerId = `${AdminUrl}/api/cart?customer_id=${customerId}`;
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };
      // Send the GET request and await the response
      const response = await fetch(urlWithCustomerId, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Parse the response data as JSON
      const cartData = await response.json();
      const matchingProducts = [];

      cartData.forEach((cartItem) => {
        const productMatch = productsList.find(
          (product) => product.uniquepid === parseInt(cartItem.product_uniqueid)
        );
        if (productMatch) {
          // Create a new product for each matching cart item
          const newProduct = { ...productMatch };
          newProduct.mrp = cartItem.mrp; // Change 'mrp' based on cartItem
          newProduct.sellingprice = cartItem.sellingprice; // Change 'sellingprice' based on cartItem
          newProduct.label = cartItem.variantlabel; // Change 'label' based on cartItem
          newProduct.added_quantity = parseInt(cartItem.total_quantity, 10); // Change 'label' based on cartItem
          matchingProducts.push(newProduct);
        }
      });

      // Filter out null values
      setFilterData(matchingProducts);
      if (cartData?.length > 0 && matchingProducts?.length > 0 && !dataFetched) {
        dispatch(addCarts(matchingProducts));
        setDataFetched(true)
      }

      setTimeout(() => {
        matchingProducts?.length === 0 && setDataFetched(true)
      }, 5000);
      // filteredData.length > 0 && setA(1)
    } catch (error) {
      // Handle any errors here
      console.error('Error fetching cart sdata:', error);
    }
  }

  useEffect(() => {
    // Call the async function to fetch cart data if filterData is empty
    if (!dataFetched) {
      fetchCartData()
    }
  }, [customerId, filterdata, dataFetched, customerData]);

  // useEffect(() => {
  //   // convertCategoryProducts(productsList)
  //   // convertCartProducts(cartItems)
  //   // convertWishlistProducts(wishlistItems)
  //   // fetchData()

  // }, [currencyCode])


}

export default Currencyconvertedfile

export const getReviewData = async (product_id) => {
  if (product_id === null || product_id === undefined) {
    // Handle the case when customerId or product_id is null or undefined, such as displaying an error message or taking appropriate action.
    return;
  }

  try {
    const response = await fetch(`${AdminUrl}/api/fetchRatings?product_id=${product_id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    // Log the data
    return data;
    // dispatch(addOrders(data))
    // You can dispatch or process the data here as needed.
  } catch (error) {
    console.error('Error:', error);
  }
};

