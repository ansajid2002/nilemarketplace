
import Icon from 'react-native-vector-icons/Ionicons'; // You may need to install this package
import { changeSearchFocus, changetabbarIndex } from '../store/slices/counterslice';
import { useDispatch, useSelector } from 'react-redux';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';

// import Config from "react-native-config";
// export const AdminUrl = "https://admin.nilegmp.com";
export const AdminUrl = "http://192.168.1.38:3001";
// export const AdminUrl = "http://172.20.10.5:3001"; 
export const productUrl = "https://ngmp-products.s3.us-east-005.backblazeb2.com"

export async function getVariantsOfCatSubcat(category, subcategory, uniquepid) {
    try {
        const apiUrl = `${AdminUrl}/api/getvariantsofcatsubcat?category=${category}&subcategory=${subcategory}&uniquepid=${uniquepid}`;
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json', // Adjust headers as needed
                // Add any other headers you may need, such as authentication headers
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const responseData = await response.json();
        return responseData; // This will be the response data from your API
    } catch (error) {
        console.error('Error:', error);
        throw error; // Rethrow the error for handling in your application
    }
}

export function HeaderBar({ navigation, title, goback, size = 20, searchEnable = true, cartEnable = true }) {
    const dispatch = useDispatch()
    const { cartTotal } = useSelector((state) => state.cart);
    const { t } = useTranslation()
    const handleGoBack = () => {
        navigation.pop();
    };

    return <>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: 'white' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {
                    goback && <TouchableOpacity onPress={debounce(handleGoBack, 500)}>
                        <Icon name="arrow-back" size={30} color="black" />
                    </TouchableOpacity>
                }
                <Text
                    style={{
                        marginLeft: 10,
                        fontSize: size,
                        fontWeight: 600,
                        width: 200, // Set the desired width
                        overflow: 'hidden',
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {t(`${title}`)}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {
                    searchEnable && <TouchableOpacity onPress={debounce(() => {
                        dispatch(changeSearchFocus(true))
                        navigation.navigate("Search")
                    }, 500)}>
                        <Icon name="search" size={28} color="black" style={{ marginRight: 10 }} />
                    </TouchableOpacity>
                }
                {
                    cartEnable && <TouchableOpacity onPress={() => {
                        navigation.navigate("Cart")
                    }
                    }>
                        <Icon name="cart-outline" size={28} color="black" />
                        {cartTotal > 0 && (
                            <View style={{ position: 'absolute', top: -5, right: -8, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: 'white' }}>{cartTotal}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                }
            </View>
        </View>
    </>
}
