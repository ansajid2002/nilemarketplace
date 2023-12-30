import { View, Text } from 'react-native';
import React from 'react';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from 'react-redux';

const Carttab = ({ color }) => {
  const { cartTotal } = useSelector((state) => state.cart);

  // Function to format cartTotal for display
  const formatCartTotal = (total) => {
    if (total >= 1000) {
      return `${Math.floor(total / 1000)}k+`;
    } else if (total >= 100) {
      return '100+';
    } else {
      return total.toString();
    }
  };

  // Calculate the width based on the formatted cartTotal
  const badgeWidth = Math.max(15, 10 + (formatCartTotal(cartTotal).length - 1) * 6);

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
          <Text style={{ color: 'white', fontSize: 12 }}>{formatCartTotal(cartTotal)}</Text>
        </View>
      )}
    </View>
  );
}

export default Carttab;
