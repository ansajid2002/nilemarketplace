import React, { useState, useRef, useEffect, } from 'react';
import { Fonts, Colors, Sizes, } from "../../constants/styles";
import {
    Text,
    View,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Animated,
    Dimensions,
    ScrollView,
} from "react-native";

import { SwipeListView } from 'react-native-swipe-list-view';

import { debounce } from 'lodash';
import { changeAdminurl, changetabbarIndex } from '../../store/slices/counterslice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // You may need to install this package
import { TextInput } from 'react-native';
import { HeaderBar } from '../../constant';
import { AdminUrl } from '../../constant';
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

// const notificationList = [
//     {
//         key: '1',
//         notification: 'Your ad just went online!',
//         receiveTime: '2 days ago',
//     },
//     {
//         key: '2',
//         notification: 'Your ad has been rejected, because duplic-ate ads are not allowed...',
//         receiveTime: '3 days ago',
//     },
//     {
//         key: '3',
//         notification: 'Your ad just went online!',
//         receiveTime: '1 week ago',
//     },
// ];




const rowTranslateAnimatedValues = {};

const NotificationsScreen = ({ navigation }) => {


    const { customerData } = useSelector((store) => store.userData);
    const customerId = customerData[0]?.customer_id;
  
    const [listData, setListData] = useState([]);
    const dispatch = useDispatch();
  
 
  
  
    const fetchNotifications = async() => {
        try {
            const response = await fetch(`${AdminUrl}/api/getNotifications?customerId=${customerId}`)
            if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                
            }
            const data = await  response.json()
            console.log(data,'data from norifications');
            setListData(data)
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() =>{
        if (listData.length === 0) {
            fetchNotifications()
        }
    })
  

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
        <StatusBar backgroundColor={Colors.primaryColor} />
        <View style={{ backgroundColor: Colors.whiteColor, flex: 1 }}>
          <HeaderBar title="Notifications" navigation={navigation} goback={true} />
          {listData?.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialIcons name="notifications-off" size={26} color={Colors.grayColor} />
              <Text style={{ ...Fonts.grayColor16SemiBold, marginTop: Sizes.fixPadding }}>
                No new notifications
              </Text>
            </View>
          ) : (
            <ScrollView className="px-2">
            {
                listData?.map((single,key) => {
                    return (
                        <TouchableOpacity
                        onPress={() => navigation.navigate("Cart")}
                         key={key} className=" border-b border-gray-300 pb-24 py-2 my-2 mx-2 flex-row items-center space-x-2" >
                        <MaterialIcons name="notifications" size={24} color="#00008b" />
                            <Text className="text-base">{single.message}</Text>

                        </TouchableOpacity>
                    )
                })
            }
            </ScrollView>
          )}
          
        </View>
      </SafeAreaView>
    );
  };

const styles = StyleSheet.create({
    headerWrapStyle: {
        padding: Sizes.fixPadding * 2.0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryColor,
        borderBottomLeftRadius: Sizes.fixPadding + 5.0,
        borderBottomRightRadius: Sizes.fixPadding + 5.0,
    },
    notificationIconWrapStyle: {
        height: 50.0,
        width: 50.0,
        backgroundColor: Colors.primaryColor,
        borderRadius: 25.0,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: Colors.whiteColor,
        borderWidth: 2.0,
        elevation: 3.0,
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: Colors.primaryColor,
        flex: 1,
        marginBottom: Sizes.fixPadding,
    },
 
});

export default NotificationsScreen;