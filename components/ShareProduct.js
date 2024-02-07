import React from 'react';
import { View, Button, Share, Image, TouchableOpacity } from 'react-native';
import shareimg from "../assets/images/icons/share.png"
import { AdminUrl } from '../constant';

const ShareProduct = ({ product }) => {
    const shareProduct = async () => {
        try {
          
          const result = await Share.share({
            title: product.adtitle,
            message: sharedMessage,
            url: product.productURL, // URL to the product details page on your e-commerce website
          });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // Shared via activity type
                    console.log(`Shared via ${result.activityType}`);
                } else {
                    // Shared
                    console.log('Shared');
                }
            } else if (result.action === Share.dismissedAction) {
                // Dismissed
                console.log('Share dismissed');
            }
        } catch (error) {
            console.error('Error sharing:', error.message);
        }
    };

    return (
        <TouchableOpacity onPress={shareProduct}>
            {/* <Image
                source={shareimg}
                style={{ width: 30.0, height: 30.0, borderRadius: 20.0 }}
            />     */}
        </TouchableOpacity>
    );
};

export default ShareProduct;