import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { ProfileBody, ProfileButtons } from './ProfileBody';
import Entypo from 'react-native-vector-icons/Entypo';
import { AdminUrl } from '../../constant';
import ProductListing from '../../components/ProductList';
import FullPageLoader from '../../components/FullPageLoader';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native';
import { Colors } from '../../constants/styles';
import { ProductSkeleton } from '../../components/Skeleton';


const UserProfileScreen = ({ navigation, route }) => {
    let circuls = [];
    let numberofcircels = 10;
    const item = route.params.item;
    const vendorInfo = item.vendorInfo
    const { currencyCode } = useSelector((store) => store.selectedCurrency)



  const [page, setPage] = useState(1);
  const [pageloading, setPageloading] = useState(true);
  const [VendorProductList, setVendorProductList] = useState(null);
  const [hasMore, setHasMore] = useState(true);



    let imageUrl // Default to the placeholder image URL

    if (vendorInfo?.vendor_profile_picture_url?.images[0]) {
        // If brand logo image exists, use its URL
        imageUrl = `${AdminUrl}/uploads/vendorProfile/${vendorInfo?.vendor_profile_picture_url?.images[0]}`;
    }

    const [loading, setLoading] = useState(true)
    useEffect(() => {
        VendorProductList && setLoading(false)
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
              if (data.length > 0) {
                setVendorProductList(prevProducts => {
                  if (prevProducts) {
                    return [...prevProducts, ...data];
                  } else {
                    return [...data];
                  }
                });
                setHasMore(true); // If data is fetched and not an empty array, set hasMore to true
              } else {
                setHasMore(false); // If response is an empty array, set hasMore to false
              }
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

      const loadMoreProducts = () => {
          setLoading(true);
          if (hasMore) { // Check if there is more data to fetch
            console.log("LOADING MRE PRODUCTS=============================================================================");
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
      
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>

                
                    <View style={{ width: '100%', height: '100%', backgroundColor: 'white' }}>
                 

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
                        </View>
                    

                        <View className="">
                        {
                            VendorProductList ? 
                            <ProductListing loading={pageloading || false} loadMoreProducts={loadMoreProducts} title={'All Products'} productList={VendorProductList || []} /> :
                            
                            <View className="flex-row flex-wrap gap-y-4">
                            {
                                [1, 2, 3, 4,5,6,7,8].map(item =>
                        <View key={item} className="w-1/2 relative right-[1px]">
                            <ProductSkeleton />
                        </View>
                    ) 
                            }
                            </View>
                        }
                        </View>
                    </View>
                </SafeAreaView> 
    );


};

export default UserProfileScreen;