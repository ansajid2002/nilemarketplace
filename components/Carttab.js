import { View, Text } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from 'react-redux';

const Carttab = ({ color, }) => {


  const {cartTotal} = useSelector((state) => state.cart);
  console.log(cartTotal,"s");
  return (
    <View>
      <MaterialCommunityIcons name="cart-outline" size={25} color={color} />
      {(
        <View
          style={{
            position: 'absolute',
            top: -2, // Adjust the vertical position as needed
            right: -6, // Adjust the horizontal position as needed
            backgroundColor: 'red',
            borderRadius: 50,
            width: 15,
            height: 15,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 12 }} className="">{cartTotal}</Text>
        </View>
      )}
    </View>
  )
}

export default Carttab