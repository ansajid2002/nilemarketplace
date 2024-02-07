import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';

const Progress = ({ orderStatus, pickup, orderData }) => {
    let notPickupProgressData = [
        {
            label: 'Ordered',
            displayStatus: 'Ordered',
            descriptions: [],
        },
        {
            label: 'Shipped',
            displayStatus: 'Shipped',
            descriptions: [],
        },
        {
            label: 'Out for Delivery',
            displayStatus: 'Out for Delivery',
            descriptions: [],
        },
        {
            label: 'Delivered',
            displayStatus: 'Delivered',
            descriptions: [],
        },
    ];

    let returnOrderProgressData = [
        {
            label: 'Return Pending',
            displayStatus: 'Return Pending',
            descriptions: [],
        },
        {
            label: 'Return Processed',
            displayStatus: 'Return Processed',
            descriptions: [],
        },
        {
            label: 'Return Canceled',
            displayStatus: 'Return Canceled',
            descriptions: [],
        },
        {
            label: 'Returned',
            displayStatus: 'Returned',
            descriptions: [],
        },
        // {
        //     label: 'Exchanged',
        //     displayStatus: 'Exchanged',
        //     descriptions: [],
        // },
    ];

    let pickupData = [
        {
            label: 'Ordered',
            displayStatus: 'Ordered',
            descriptions: [],
        },

        {
            label: 'Picked',
            displayStatus: 'Picked',
            descriptions: [],
        },

    ];

    if (orderData?.return_order) {
        notPickupProgressData = notPickupProgressData.concat(returnOrderProgressData);
    } else {

    }

    const currentProgressData = pickup ? orderData?.return_order ? notPickupProgressData : pickupData : notPickupProgressData;

    const currentProgressIndex = currentProgressData.findIndex((step) => step.label?.toLowerCase() === orderStatus?.toLowerCase());

    console.log(orderStatus);
    return (
        <ScrollView style={styles.container}>
            {currentProgressData.map((item, index) => (
                <View key={item.label} style={styles.stepContainer}>
                    <View className="z-50" style={[styles.stepIndicator, index <= currentProgressIndex ? styles.activeStepIndicator : {}]}>
                        <View className={`${index <= currentProgressIndex - 1 && item.label !== 'Delivered' ? 'bg-green-700' : 'bg-[#ddd]'}`} style={[styles.verticalLine, { height: Dimensions.get('window').height }]} />
                    </View>
                    <View style={styles.stepInfo}>
                        <Text style={styles.stepLabel}>{item.label}</Text>
                        {item.descriptions.map((desc, descIndex) => (
                            <View key={descIndex} style={styles.descriptionContainer}>
                                <Text style={styles.descriptionText}>{desc.description}</Text>
                                <Text style={styles.descriptionTime}>{desc.time}, {desc.location}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 2,
    },
    stepContainer: {
        flexDirection: 'row',
        padding: 10,
    },
    stepInfo: {
        flex: 1,
        flexDirection: 'column',
    },
    stepLabel: {
        color: 'black',
        fontWeight: 'bold',
    },
    descriptionContainer: {
        marginTop: 5,
    },
    descriptionTime: {
        fontSize: 12,
        color: 'gray',
    },
    descriptionLocation: {
        fontSize: 12,
        color: 'gray',
    },
    descriptionText: {
        fontSize: 12,
        color: 'gray',
    },
    stepIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderColor: '#ddd',
        borderWidth: 2,
        marginRight: 10,
        marginTop: 3,
        alignItems: 'center',
    },
    activeStepIndicator: {
        backgroundColor: 'green',
        borderColor: 'transparent',
    },
    verticalLine: {
        width: 2,
        position: 'absolute',
        right: 3,
    },
});

export default Progress;
