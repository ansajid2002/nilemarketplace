import { View, Text, TouchableOpacity, Dimensions, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { debounce } from 'lodash';
import { AdminUrl } from '../../../constant';

const AfterDeliverProcess = ({ status = "Return", uniqueid, callBACKBuySimilar, productName, orderID, orderData }) => {
    const windowWidth = Dimensions.get('window').width;
    const itemWidth = windowWidth / 3; // Divide window width by number of items
    const navigation = useNavigation();
    const [loading, setLoader] = useState(false)
    const [similarProducts, setSimilarProduct] = useState(null)
    const [product, setProduct] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Send a request to the backend to fetch product details based on uniqueid
                const response = await fetch(`${AdminUrl}/api/productDetailsByUniqueId/${uniqueid}`);
                const productDetails = await response.json();

                setProduct(productDetails?.product)

                setSimilarProduct(productDetails?.similarProducts)
                // Navigate to the 'ProductDetail' screen with the fetched product details
            } catch (error) {
                console.error('Error fetching product details:', error);
                // Handle error (display error message, etc.)
            } finally {
                setLoader(false)
            }
        }

        !similarProducts && fetchData()
    }, [similarProducts])

    const handleBuyAgain = debounce(async () => {
        setLoader(true)
        if (loading) return
        try {
            // Send a request to the backend to fetch product details based on uniqueid
            const response = await fetch(`${AdminUrl}/api/productDetailsByUniqueId/${uniqueid}`);
            const productDetails = await response.json();

            const item = productDetails?.product
            // Navigate to the 'ProductDetail' screen with the fetched product details
            navigation.push('ProductDetail', item);
        } catch (error) {
            console.error('Error fetching product details:', error);
            // Handle error (display error message, etc.)
        } finally {
            setLoader(false)
        }
    }, 500);


    // callbacks
    const handlePresentModalPress = useCallback(() => {
        callBACKBuySimilar(similarProducts || []);
    }, [similarProducts]);

    const handlePress = () => {
        if (!orderData?.return_order) {
            if (status === 'Delivered' || status === 'Picked') {
                // Navigate to the Return screen
                navigation.navigate('Returns', orderData);
            } else {
                // Navigate to the Cancel screen
                // navigation.navigate('CancelOrder', orderData);
            }
        }
    };

    return (
        <View className="flex-row flex-wrap border-b border-gray-300">
            <TouchableOpacity onPress={handlePress}>
                <View className="flex items-center p-4 border-r border-gray-300" style={[{ width: itemWidth }]}>
                    <Text className="mr-2 uppercase tracking-widest text-center">
                        {
                            orderData?.return_order ?
                                orderData?.order_status : status === 'Delivered' || status === 'Picked' ? 'Return' : ''
                        }
                    </Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center space-x-1"
                onPress={debounce(() => {
                    let message = '';

                    if (status === 'Ordered') {
                        message = `Hello ${product?.vendorInfo?.vendorname}, ${product?.vendorInfo?.brand_name},
                        
                        I have recently placed an order for the product "${productName}" with the order ID ${orderID}. I would like to inquire about the estimated delivery date. Could you please provide me with more information regarding the shipping status?
                        
                        Thank you,
                        `;
                    } else if (status === 'Shipped') {
                        message = `Hello ${product?.vendorInfo?.vendorname}, ${product?.vendorInfo?.brand_name},
                        
                        I am writing to inquire about the status of my order with the ID ${orderID} for the product "${productName}". Could you please provide me with the tracking details and expected delivery date?
                        
                        Looking forward to your response.
                        Best regards,
                        `;
                    } else if (status === 'Confirmed') {
                        message = `Hello ${product?.vendorInfo?.vendorname}, ${product?.vendorInfo?.brand_name},
                        
                        I am writing to confirm the receipt of my order with the ID ${orderID} for the product "${productName}". Thank you for processing my order. 
                        
                        Looking forward to receiving the product soon.
                        Best regards,
                        `;
                    } else if (status === 'Out for Delivery') {
                        message = `Hello ${product?.vendorInfo?.vendorname}, ${product?.vendorInfo?.brand_name},
                    
                    I hope this message finds you well. My order with the ID ${orderID} for the product "${productName}" is currently out for delivery. Could you please ensure a smooth delivery process and confirm the expected arrival time?
                    
                    Thank you for your assistance.
                    Regards,
                   `;
                    } else if (status === 'Delivered') {
                        message = `Hello ${product?.vendorInfo?.vendorname}, ${product?.vendorInfo?.brand_name},
                    
                    I wanted to inform you that I have received the product "${productName}" as part of order ID ${orderID}. I am pleased with the product and the timely delivery. Thank you for your excellent service.
                    
                    Best regards,
                   `;
                    } else if (status === 'Picked') {
                        message = `Hello ${product?.vendorInfo?.vendorname}, ${product?.vendorInfo?.brand_name},
                    
                    I have successfully picked up the product "${productName}" from the specified location. I am satisfied with the product and the pickup process. Thank you for your assistance.
                    
                    Best regards,
                   `;
                    } else if (status === 'Returned') {
                        message = `Hello ${product?.vendorInfo?.vendorname}, ${product?.vendorInfo?.brand_name},
                    
                    I am contacting you regarding the return of the product "${productName}" from order ID ${orderID}. Could you please provide me with the necessary instructions for the return process?
                    
                    Thank you for your cooperation.
                    Regards,
                   `;
                    } else if (status === 'Canceled') {
                        message = `Hello ${product?.vendorInfo?.vendorname}, ${product?.vendorInfo?.brand_name},
                    
                    I regret to inform you that I have canceled the order with the ID ${orderID} for the product "${productName}". Could you please confirm the cancellation and arrange for the refund as per your policies?
                    
                    Thank you for your attention to this matter.
                    Best regards,
                   `;
                    } else if (status === 'Exchanged') {
                        message = `Hello ${product?.vendorInfo?.vendorname}, ${product?.vendorInfo?.brand_name},
                    
                    I am reaching out to discuss the exchange of the product "${productName}" from order ID ${orderID}. Could you please provide me with the exchange process details and any additional information required?
                    
                    Looking forward to your prompt response.
                    Best regards,
                   `;
                    }
                    product && navigation.navigate('InboxChatScreen', { data: product?.vendorInfo, chats: message });
                }, 300)}
            >
                <View className="flex items-center p-4 border-r border-gray-300" style={{ width: itemWidth }}>
                    <Text className="mr-2 uppercase tracking-widest text-center">
                        Contact Seller
                    </Text>
                </View>
            </TouchableOpacity>

            {
                (status === 'Delivered' || status === 'Picked') && <>
                    <TouchableOpacity onPress={handleBuyAgain} style={{ width: itemWidth }}>
                        <View className="flex items-center p-4 border-r border-gray-300">
                            {loading ? <ActivityIndicator /> : <Text className="mr-2 uppercase tracking-widest text-center">Buy Again</Text>}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handlePresentModalPress}>
                        <View className="flex items-center p-4 " style={{ width: itemWidth }}>
                            <Text className="mr-2 uppercase tracking-widest text-center">Buy Similar </Text>
                        </View>
                    </TouchableOpacity>
                </>
            }




        </View>
    );
};



export default AfterDeliverProcess;
