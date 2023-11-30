import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { ProfileBody, ProfileButtons } from './ProfileBody';
import Entypo from 'react-native-vector-icons/Entypo';
import { AdminUrl } from '../../constant';
import ProductListing from '../../components/ProductList';
import FullPageLoader from '../../components/FullPageLoader';
import { useSelector } from 'react-redux';

const UserProfileScreen = ({ navigation, route }) => {
    let circuls = [];
    let numberofcircels = 10;

    const item = route.params.item;
    const vendorInfo = item.vendorInfo
    const { currencyCode } = useSelector((store) => store.selectedCurrency)

    const placeholderImageUrl = 'https://www.sfb1425.uni-freiburg.de/wp-content/uploads/2021/05/dummy-profile-pic-360x360.png';
    let imageUrl = placeholderImageUrl; // Default to the placeholder image URL

    if (vendorInfo?.vendor_profile_picture_url?.images[0]) {
        // If brand logo image exists, use its URL
        imageUrl = `${AdminUrl}/uploads/vendorProfile/${vendorInfo?.vendor_profile_picture_url?.images[0]}`;
    }

    const [VendorProductList, setVendorProductList] = useState(null);
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        VendorProductList && setLoading(false)
    }, [VendorProductList])

    useEffect(() => {
        // Fetch vendor products data
        const fetchVendorProducts = async () => {
            try {
                const vendorId = item.vendorid; // Extract vendorId from the item

                if (!vendorId) {
                    return; // If vendorId is not available, don't make the request
                }

                const response = await fetch(`${AdminUrl}/api/getVendorProducts?vendorid=${vendorId}&currency=${currencyCode}`);
                if (response.ok) {
                    const data = await response.json();
                    setVendorProductList(data); // Update the state with the received data
                } else {
                    console.error("Error fetching vendor products data:", response.status);
                }
            } catch (error) {
                console.error("Error fetching vendor products data:", error);
            }
        };

        fetchVendorProducts(); // Call the function when the component mounts
    }, []);
    for (let index = 0; index < numberofcircels; index++) {
        circuls.push(
            <View key={index}>
                {index === 0 ? (
                    <View
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 100,
                            borderWidth: 1,
                            opacity: 0.7,
                            marginHorizontal: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <Entypo name="plus" style={{ fontSize: 40, color: 'black' }} />
                    </View>
                ) : (
                    <View
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 100,
                            backgroundColor: 'black',
                            opacity: 0.1,
                            marginHorizontal: 5,
                        }}></View>
                )}
            </View>,
        );
    }


    return (
        VendorProductList ? <ScrollView>
            <View style={{ width: '100%', height: '100%', backgroundColor: 'white' }}>
                <View style={{ width: '100%' }}>
                    <ProfileBody
                        name={`${vendorInfo?.vendorname}`}
                        accountName={`${vendorInfo?.brand_name} - Brand`}
                        profileImage={imageUrl || null}
                        followers={vendorInfo?.followers}
                        reviews={35131}
                        post={VendorProductList && VendorProductList?.length}
                    />
                    <ProfileButtons
                        id={0}
                        name={`${vendorInfo?.vendorname}`}
                        accountName={`${vendorInfo?.brand_name} - Brand`}
                        profileImage={imageUrl || null}
                        phone={`${vendorInfo?.country_code} ${vendorInfo?.mobile_number}`}
                    />
                </View>
                <View className="mt-4">
                    <ProductListing title={'All Products'} productList={VendorProductList || []} />
                </View>
            </View>
        </ScrollView> : <FullPageLoader />
    );


};

export default UserProfileScreen;