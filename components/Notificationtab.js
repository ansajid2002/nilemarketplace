import { View, Text } from 'react-native'
import React from 'react'
import { FontAwesome5 } from "@expo/vector-icons";

const Notificationtab = ({ color, size, count }) => {

  return (
    <View>
      <FontAwesome5 name="bell" size={22} color={color} />
      {count > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 0, // Adjust the vertical position as needed
            right: -6, // Adjust the horizontal position as needed
            backgroundColor: 'red',
            borderRadius: 20,
            width: 17,
            height: 17,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 12 }} className="">{count}</Text>

        </View>
      )}
    </View>
  )
}

export default Notificationtab