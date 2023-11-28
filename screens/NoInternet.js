import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export default function NoInternet() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style="flex: 1; justify-content: center; items-center">
      {isConnected ? (
        <Text class="text-green-500 text-xl font-bold">
          You are online!
        </Text>
      ) : (
        <View class="p-6 bg-red-500 rounded-lg shadow-md">
          <Text class="text-white text-xl font-bold mb-2">
            No internet connection
          </Text>
          <Text class="text-white">
            Please check your network settings and ensure you are connected to
            the internet to continue shopping.
          </Text>
        </View>
      )}
    </View>
  );
}
