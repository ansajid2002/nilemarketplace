import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import noInternet from "../assets/images/icons/no-internet.png"
import { useTranslation } from 'react-i18next';

export default function NoInternet() {
  const [isConnected, setIsConnected] = useState(true);
  const {t} = useTranslation()
 
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View className=" flex-1 flex-row mt-10 justify-center" >
      {isConnected ? (
        <View className="flex-row items-center justify-center">
          <Text className="text-green-500 text-3xl font-bold">
            {t("You are online!")}
          </Text>
        </View>
      ) : (
        <View className=" p-6  rounded-lg ">
          <View className="flex-row items-center justify-center mb-4">
            <Image
              source={noInternet}
              style={{ tintColor: "gray", width: 200.0, height: 200.0, borderRadius: 20.0 }}
            />
          </View>
          <Text className=" text-[26px] font-bold mb-4 text-center">
           {t(" No internet connection")}
          </Text>
          <Text className=" text-base text-justify">
            {t("Please check your network settings and ensure you are connected to the internet to continue shopping.")}
          </Text>
        </View>
      )}
    </View>
  );
}
