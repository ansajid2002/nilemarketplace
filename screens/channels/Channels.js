import { View, Text, SafeAreaView } from 'react-native'
import React, { useCallback, useEffect,useState } from 'react'
import { useSelector } from 'react-redux';
import { AdminUrl } from '../../constant';

const Channels = ({navigation,route}) => {
 const [recommendedProdutcs, setRecommendedProducts] = useState(null)
 const [newArrivals, setNewArrivals] = useState(null)
 const [recommendedProductsFetched, setRecommendedProductsFetched] = useState(false);
 const [newArrivalsFetched, setNewArrivalsFetched] = useState(false);
 const [error, setError] = useState(null);

 const { customerData } = useSelector((store) => store.userData)
 const customerId = customerData[0]?.customer_id


 const fetchRecommendedProducts = useCallback(async () => {
    try {
        const recommendedResponse = await fetch(`${AdminUrl}/api/recommendedProducts/${customerId}`);
        if (!recommendedResponse.ok) {
            throw new Error(`HTTP error! Status: ${recommendedResponse.status}`);
        }
        const recommendedData = await recommendedResponse.json();
        console.log(recommendedData);
        setRecommendedProducts(recommendedData);

    } catch (error) {
        console.log(error);
    }
}, [customerId, setRecommendedProducts]);

const fetchNewArrivals = useCallback(async () => {
    try {
        const newArrivalsResponse = await fetch(`${AdminUrl}/api/newArrivals/${customerId}`);
        if (!newArrivalsResponse.ok) {
            throw new Error(`HTTP error! Status: ${newArrivalsResponse.status}`);
        }
        const newArrivalsData = await newArrivalsResponse.json();
        console.log(newArrivalsData,"newarrivalsdata");
        setNewArrivals(newArrivalsData);
    } catch (error) {
        setError(error.message || 'An error occurred while fetching new arrivals.');
    }
}, [customerId, setNewArrivals, setError]);

useEffect(() => {
    if (!newArrivals && route.params.arrivals) {
        console.log("ARRIVALS DATA COMING");
        fetchNewArrivals()
    }
    if (!recommendedProdutcs && route.params.recommended) {
        console.log("RECOMMENDED DATA COMING");
        fetchRecommendedProducts()
    }
},[newArrivals,recommendedProdutcs])




    return (
    <SafeAreaView className="flex-1" >

    <View>
      <Text>Channels</Text>
    </View>
    </SafeAreaView>
  )
}

export default Channels