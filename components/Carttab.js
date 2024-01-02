import { View, Text } from 'react-native';
import React from 'react';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from 'react-redux';

const Carttab = ({ color }) => {
  const { cartTotal } = useSelector((state) => state.cart);

  console.log(typeof cartTotal, 'cart');

  // Function to format cartTotal for display
  const formatCartTotal = (total) => {
    const numericTotal = parseInt(total, 10); // Convert to number
    console.log(typeof numericTotal, 'num');
    if (numericTotal >= 1000) {
      return `${Math.floor(numericTotal / 1000)}k+`;
    } else if (numericTotal >= 100) {
      return '100+';
    } else {
      return numericTotal.toString();
    }
  };

  // Calculate the width based on the formatted cartTotal
  const badgeWidth = Math.max(15, 10 + (formatCartTotal(parseInt(cartTotal)).length - 1) * 6);


  return (
    <View>
      <MaterialCommunityIcons name="cart-outline" size={25} color={color} />
      {(
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -10,
            backgroundColor: 'red',
            borderRadius: 50,
            width: badgeWidth + 5, // Set the minWidth property
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 12 }}>{formatCartTotal(parseInt(cartTotal))}</Text>
        </View>
      )}
    </View>
  );
}

export default Carttab;
