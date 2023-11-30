import { View, Text } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/home/homeScreen';
import SearchScreen from '../screens/search/searchScreen';

const Tab = createBottomTabNavigator();

const BottomTabBarScreen2 = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={<HomeScreen/>} />
      <Tab.Screen name="Settings" component={<SearchScreen/>} />
    </Tab.Navigator>
  )
}

export default BottomTabBarScreen2