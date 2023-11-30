import { View, Text } from 'react-native'
import React from 'react'
import { Link } from '@react-navigation/native'

const NoLogin = () => {
    return (
        <View className="flex-row justify-between items-center px-3 py-3" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
            <Text className="text-white font-bold tracking-wide">Sign in for the best experience</Text>
            <View className="W-1/2 bg-orange-600 rounded-full px-3 py-1">
                <Link to={'/Login'}>
                    <Text className="text-white font-bold tracking-wide">
                        Signin
                    </Text>
                </Link>
            </View>
        </View>
    )
}

export default NoLogin