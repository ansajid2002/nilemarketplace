import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, FlatList, ActivityIndicator, Image } from 'react-native';
import { ProfileBody, ProfileButtons } from './ProfileBody';
import Entypo from 'react-native-vector-icons/Entypo';
import { AdminUrl, HeaderBar } from '../../constant';
import { renderItemOrSkeleton } from '../../components/ProductList2';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native';
import { ProductSkeleton } from '../../components/Skeleton';
import { useTranslation } from 'react-i18next';



const UserProfileScreen = ({ navigation, route }) => {
    let circuls = [];
    let numberofcircels = 10;
    const item = route.params.item;
    const vendorInfo = item.vendorInfo
    // console.log(vendorInfo,"VENDORINFO");

    const { currencyCode } = useSelector((store) => store.selectedCurrency)
    const {t} = useTranslation()

    const [page, setPage] = useState(1);
    const [pageloading, setPageloading] = useState(true);
    const [VendorProductList, setVendorProductList] = useState(null);
    const [vendorTotalProduct, setVendorTotalProduct] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [businesspolicies,setBusinesspolicies] = useState(null)


    let imageUrl // Default to the placeholder image URL

    if (vendorInfo?.vendor_profile_picture_url?.images[0]) {
        // If brand logo image exists, use its URL
        imageUrl = `${AdminUrl}/uploads/vendorProfile/${vendorInfo?.vendor_profile_picture_url?.images[0]}`;
    }

    useEffect(() => {
        VendorProductList && setPageloading(false)
    }, [VendorProductList])

    useEffect(() => {
        const fetchVendorProducts = async () => {
            setPageloading(true);
            try {
                const vendorId = item.vendorid;

                if (!vendorId) {
                    return;
                }

                const response = await fetch(`${AdminUrl}/api/getVendorProducts?vendorid=${vendorId}&currency=${currencyCode}&pageNumber=${page}&pageSize=10`);

                if (response.ok) {
                    const data = await response.json();
                    if (data?.AllProducts.length > 0) {
                        setVendorProductList(prevProducts => {
                            if (prevProducts) {
                                return [...prevProducts, ...data?.AllProducts];
                            } else {
                                return [...data?.AllProducts];
                            }
                        });
                        setHasMore(true); // If data is fetched and not an empty array, set hasMore to true
                    } else {
                        !VendorProductList && setVendorProductList([])
                        setHasMore(false); // If response is an empty array, set hasMore to false
                    }
                    setVendorTotalProduct(data?.total?.[0]?.totalvendorproducts || 0)
                } else {
                    console.error("Error fetching vendor products data:", response.status);
                }
            } catch (error) {
                console.error("Error fetching vendor products data:", error);
            } finally {
                setPageloading(false);
            }
        };

        fetchVendorProducts();
    }, [page]);

    // useEffect(() => {
    //     const fetchvendorpolicies = async() => {
    //         const response = await fetch(`${AdminUrl}/api/getpoliciesofAppbyVendorid?vendor_id=${vendorInfo?.id}`)
    //         if (response.ok) {
    //          const data = await response.json()
    //         //  console.log(data,"DATA COMING FROM USEEFFECT");
    //          setBusinesspolicies(data[0].business_policy)
    //         }
    //     }
    //     if (!businesspolicies) {
    //         fetchvendorpolicies()
    //     }
    // },[businesspolicies])

    const loadMoreProducts = () => {
        setPageloading(true);
        if (hasMore) { // Check if there is more data to fetch
            setPage(prevPage => prevPage + 1);
        }
        else {
            console.log("##################### NO MORE PRODUCTS TO BE FETCHED ####################################################");
        }
    };

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
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            {vendorInfo ? (
                <HeaderBar goback={true} title={vendorInfo?.brand_name} navigation={navigation} />
            ) : null}
            {
                VendorProductList ?
                    <FlatList
                        data={VendorProductList}
                        renderItem={renderItemOrSkeleton}
                        keyExtractor={(item, index) => index.toString()}
                        numColumns={2} // Adjust as needed
                        onEndReached={VendorProductList?.length > 9 && loadMoreProducts}
                        onEndReachedThreshold={0.1}
                        ListFooterComponent={() => (
                            <View className="">
                                {

                                    (pageloading && hasMore) &&
                                    <View className="my-8">
                                        <ActivityIndicator size="large" color={"#00008b"} />
                                    </View>
                                }
                                {
                                    (!hasMore && VendorProductList.length !== 0) &&
                                    <View className="flex-row items-center justify-center">
                                        <Text className="text-xl my-10 text-gray-300 font-bold">{t("No More Products!")}</Text>
                                    </View>
                                }
                                {
                                    VendorProductList?.length === 0 &&
                                    <View className="">
                                        <Image resizeMode="contain" className="h-[150px] w-[150px] mx-auto" source={require('../../assets/images/empty-folder.png')} />
                                        <Text className="text-center text-xl ">{t("No Product Found !")}</Text>
                                    </View>
                                }
                            </View>
                        )}
                        ListHeaderComponent={() => (
                            <View style={{ width: '100%' }}>
                                <ProfileBody
                                    name={`${vendorInfo?.vendorname}`}
                                    accountName={`${vendorInfo?.brand_name} - Brand`}
                                    profileImage={imageUrl}
                                    followers={vendorInfo?.followers}
                                    reviews={35131}
                                    post={vendorTotalProduct}
                                    
                                />
                                <ProfileButtons
                                    id={`${vendorInfo?.id}`}
                                    name={`${vendorInfo?.vendorname}`}
                                    accountName={`${vendorInfo?.brand_name} - Brand`}
                                    profileImage={imageUrl || null}
                                    data={vendorInfo || {}}
                                    phone={`${vendorInfo?.country_code} ${vendorInfo?.mobile_number}`}
                                    // policyContent={businesspolicies}
                                />
                                <Text className="text-2xl font-medium m-4" >All Products</Text>
                            </View>
                        )}
                    /> :
                    <FlatList
                        data={[1, 2, 3, 4, 5, 6, 7, 8]}
                        renderItem={() => (


                            <View style={{ width: '50%' }}>
                                <ProductSkeleton />
                            </View>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                        numColumns={2} // Adjust as needed

                        ListHeaderComponent={() => (
                            <View style={{ width: '100%' }}>
                                <ProfileBody
                                    name={`${vendorInfo?.vendorname}`}
                                    accountName={`${vendorInfo?.brand_name} - Brand`}
                                    profileImage={imageUrl}
                                    followers={vendorInfo?.followers}
                                    reviews={35131}
                                    post={VendorProductList && VendorProductList?.length}
                                />
                                <ProfileButtons
                                    id={0}
                                    name={`${vendorInfo?.vendorname}`}
                                    accountName={`${vendorInfo?.brand_name} - Brand`}
                                    profileImage={imageUrl || null}
                                    data={vendorInfo || {}}
                                    phone={`${vendorInfo?.country_code} ${vendorInfo?.mobile_number}`}
                                />
                                <Text className="text-2xl font-medium m-4" >All Products</Text>
                            </View>
                        )}
                    />}
        </SafeAreaView>


    );


};

export default UserProfileScreen;

