import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AdminUrl } from '../constant';
import { useNavigation } from '@react-navigation/native';
import { debounce } from 'lodash';
import { useDispatch } from 'react-redux';

const StarRating = ({ rating, onRatingChange, item, order_id, enable = true, size = '2xl', reviewButton = true, ratingData, color = "#00008b" }) => {
    const [selectedRating, setSelectedRating] = useState(rating);
    const { vendor_id, customer_id, product_uniqueid, label } = item
    const [data, setData] = useState(ratingData || [])
    const navigation = useNavigation()
    const handleRatingPress = async (newRating, type) => {
        setSelectedRating(newRating);
        onRatingChange(newRating);

        try {
            // Create the request data object
            const requestData = {
                vendor_id: vendor_id,
                customer_id: customer_id,
                product_uniqueid: product_uniqueid,
                rating: newRating,
                label: label,
                order_id
            };

            // Send the POST request with the data
            if (enable) {
                const response = await fetch(`${AdminUrl}/api/rateVendorProducts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                if (response.ok) {
                    // If the response status is okay, parse and handle the response data
                    // Alert the response

                    const data = await response.json()
                    setData(data?.data)
                    // dispatch(updateReviewlistener(data?.data))
                } else {
                    // If the response status is not okay, handle the error
                    console.log('Request failed with status:', response.status);
                    // Alert an error message
                }
            }
        } catch (error) {
            // Handle network or other errors
            console.error('Error:', error);
            // Alert an error message
            alert('Error: ' + error.message);
        }
    };

    useEffect(() => {
        setSelectedRating(rating)
        // enable && handleRatingPress(rating, 'nochange')
        // console.log(enable, 're');
    }, [rating])



    return (
        <View>
            <View style={styles.container}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={debounce(() => {
                            enable && handleRatingPress(star)
                        }, 500
                        )}

                        style={[styles.star, star <= selectedRating && styles.selected]}
                    >
                        <Text
                            className={`text-${size}  ${star <= selectedRating ? color : 'text-gray-300'}`}
                        >★</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {
                selectedRating > 0 && reviewButton && (
                    <TouchableOpacity onPress={debounce(() => navigation.navigate("Reviews", { item, vendor_id: vendor_id, selectedRating, data }), 500)}>
                        <Text style={styles.reviewLink}>{data?.review_text?.trim() != '' ? 'Edit Review' : 'Write a Review'}</Text>
                    </TouchableOpacity>
                )
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    star: {
        marginRight: 2,
    },
    selected: {
        color: 'gold',
    },
    selectedText: {
        color: '#00008b',
    },
    reviewLink: {
        marginLeft: 5,
        color: 'blue',
        marginTop: 5
    },
});

export default StarRating;
