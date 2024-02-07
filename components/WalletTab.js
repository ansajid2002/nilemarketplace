import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AdminUrl } from '../constant';
import { getwalletTotal } from '../store/slices/walletSlice';
import { useNavigation } from '@react-navigation/native';

const WalletTab = ({ color, size, customerId, showLabel = true }) => {
    const walletTotal = useSelector(state => state.wallet.walletTotal);
    const dispatch = useDispatch();
    useEffect(() => {
        if (customerId) {
            // Fetch totalBalance from the API only if customerId is provided
            fetchWalletToken();
        }
    }, [customerId]);

    const fetchWalletToken = async () => {
        try {
            const response = await fetch(`${AdminUrl}/api/fetchWalletToken?customer_id=${customerId}`);
            const data = await response.json();

            if (response.ok) {
                // Dispatch the getwalletTotal action to update the walletTotal state
                dispatch(getwalletTotal(data.totalBalance || 0));
            } else {
                console.error('Error fetching wallet token:', data.error);
            }
        } catch (error) {
            console.error('Error fetching wallet token:', error);
        }
    };

    const formatCount = (count) => {
        if (count >= 1000000000) {
            return '$' + (count / 1000000000)?.toFixed(0) + 'B';
        } else if (count >= 1000000) {
            return '$' + (count / 1000000)?.toFixed(0) + 'M';
        } else if (count >= 1000) {
            return '$' + (count / 1000)?.toFixed(0) + 'K';
        } else {
            return '$' + count?.toString();
        }
    };

    const calculateBadgeWidth = (formattedCount) => {
        const baseWidth = 22;
        const additionalWidth = formattedCount.length * 2;

        return baseWidth + additionalWidth;
    };

    const formattedCount = formatCount(walletTotal);
    const badgeWidth = calculateBadgeWidth(formattedCount);

    return (
        <View>
            <Ionicons name="wallet-outline" size={size} color={color} />
            {walletTotal > 0 && showLabel && (
                <View
                    style={{
                        position: 'absolute',
                        top: -10,
                        right: -3,
                        backgroundColor: 'red',
                        borderRadius: 20,
                        width: badgeWidth,
                        height: 17,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: 'white', fontSize: 12 }}>{formattedCount}</Text>
                </View>
            )}
        </View>
    );
};

export default WalletTab;
