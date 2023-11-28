import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';

const Progress = ({ orderStatus }) => {
    const progressData = [
        {
            label: 'Ordered',
            descriptions: [
                {
                    time: '10:00 AM',
                    location: 'Your location',
                    description: 'Order placed successfully.',
                },
                {
                    time: '11:00 AM',
                    location: 'Warehouse',
                    description: 'Processing your order.',
                },
            ],
        },
        {
            label: 'Shipped',
            descriptions: [
                {
                    time: '12:00 PM',
                    location: 'Warehouse',
                    description: 'Your order is on its way.',
                },
            ],
        },
        {
            label: 'Out for Delivery',
            descriptions: [
                {
                    time: '01:00 PM',
                    location: 'Near your area',
                    description: 'Order out for delivery in your area.',
                },
            ],
        },
        {
            label: 'Delivered',
            descriptions: [
                {
                    time: '03:00 PM',
                    location: 'Your location',
                    description: 'Your order has been delivered.',
                },
                {
                    time: '03:30 PM',
                    location: 'Your location',
                    description: 'Thank you for shopping with us.',
                },
            ],
        },
    ];

    const currentProgressIndex = progressData.findIndex((step) => step.label === orderStatus);

    return (
        <ScrollView style={styles.container}>
            {progressData.map((item, index) => (
                <View key={item.label} style={styles.stepContainer}>
                    <View className="z-50" style={[styles.stepIndicator, index <= currentProgressIndex ? styles.activeStepIndicator : {}]}>
                        <View
                            className={`${index <= currentProgressIndex - 1 && item.label != 'Deliveredsa' ? 'bg-green-700' : 'bg-[#ddd]'}`}
                            style={[styles.verticalLine, { height: Dimensions.get('window').height }]}
                        />
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
