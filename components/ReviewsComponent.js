import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import StarRating from './FiveStarRating';
import SlideItem from './Slider/SlideItem';
import { FlatList } from 'react-native';
// import { getReviewData } from '../screens/Currencyconvertedfile';
import { getReviewData } from './getReviewData';
import { AdminUrl } from '../constant';
import { useTranslation } from 'react-i18next';

export function calculateAverageRating(data) {
    if (data && data?.length > 0) {
        const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
        return totalRating / data?.length;
    }
    return 0; // Default to 0 if there are no ratings
}

export function countNonEmptyReviews(data) {
    return data?.filter((review) => review.review_text && review.review_text.trim() !== '')?.length;
}


const ReviewComponent = ({ review, item }) => {
    const { t } = useTranslation()
    const [reviewData, setReviewData] = useState([]);
    const [averageRating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState(0);
    const [imagesData, setImages] = useState([]);

    const images = (reviewData || []).flatMap((review) =>
        (review.medias || []).map((item, index) => ({
            id: index.toString(),
            url: item ? `${AdminUrl}/uploads/ReviewImages/${item}` : '' // Handle null or undefined items
        }))?.filter((item) => item.url)
    );


    const fetchReviewData = useCallback(async () => {
        try {
            const data = await getReviewData(item.uniquepid);
            setReviewData(data?.ratingsData);

            // Calculate the average rating
            const averageRating = calculateAverageRating(data?.ratingsData);
            const nonEmptyReviewCount = countNonEmptyReviews(data?.ratingsData);
            setRating(averageRating);
            setReviewText(nonEmptyReviewCount);
        } catch (error) {
            console.error('Error:', error);
        }
    }, [item.uniquepid]);

    useEffect(() => {
        reviewData?.length === 0 && fetchReviewData();
    }, [reviewData?.length, fetchReviewData]);

    return (
        <View style={{ marginTop: 2 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 20 }}>{t("Rating & Reviews")}</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <StarRating enable={false} reviewButton={false} size="2xl" rating={averageRating || 0} onRatingChange={() => { }} item={item} />
                <Text>{reviewData?.length} {t("ratings and")} {reviewText} {t("reviews")}</Text>
            </View>

            {
                images?.length > 0 && <View className="mt-3 border border-t-3 border-b-0 border-l-0 border-r-0 border-gray-200">
                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 10 }}>Photos ({images?.length})</Text>
                    <View style={{ marginTop: 2 }}>
                        <FlatList
                            data={images}
                            horizontal
                            renderItem={({ item }) => <SlideItem item={item} singleData={images} width={100} redirect="ImageSldier" heightCheck={100} />}
                        />
                    </View>
                </View>
            }

            <View>
                {
                    reviewData && reviewData?.map((iterate, index) => {
                        return <View key={iterate?.id + `${index}`} className="border border-b-3 border-t-0 border-l-0 border-r-0 border-gray-200">
                            <View className="mt-2">
                                <StarRating enable={false} reviewButton={false} size="2xl" rating={iterate?.rating || 0} onRatingChange={() => { }} item={item} />
                            </View>
                            {
                                iterate?.label && <Text className="leading-5 font-bold text-gray-500">Review for :  {iterate?.label}</Text>
                            }
                            <Text className="leading-5 mt-2 font-semibold tracking-wider">{iterate?.review_text}</Text>
                            <Text className="leading-5 mt-2 text-[16px] mb-3">{iterate?.customerData && `${iterate?.customerData?.given_name} ${iterate?.customerData?.family_name} ${iterate?.customerData?.city !== "" ? ',' : ''} ${iterate?.customerData?.city} ${iterate?.customerData?.state}`}</Text>
                        </View>

                    })
                }

            </View>
        </View>
    );
};

export default ReviewComponent;
