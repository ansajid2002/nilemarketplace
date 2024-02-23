import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";
import { Text } from "react-native";
import { View } from "react-native";
import { createShimmerPlaceHolder } from 'expo-shimmer-placeholder'
import { LinearGradient } from 'expo-linear-gradient'

const ShimmerPlaceHolder = createShimmerPlaceHolder(LinearGradient)

const windowWidth = Dimensions.get('window').width;
const screenWidth = Dimensions.get('screen').width;


export const ProductSkeleton = () => {
    return (
        <View style={styles.productContainer} className="mb-4" >
            <View className="animate-pulse" style={{ width: '100%', height: 250, borderRadius: 5, backgroundColor: '#e0e0e0' }}></View>
            <View style={{ flexDirection: 'column', marginLeft: 2, justifyContent: 'center', marginTop: 10 }}>
                <Text className="rounded-md my-0.5 animate-pulse" style={{ width: '90%', height: 15, backgroundColor: '#e0e0e0' }}></Text>
                <Text className="rounded-md my-0.5 animate-pulse" style={{ width: '60%', height: 10, marginTop: 4, backgroundColor: '#e0e0e0' }}></Text>
                <Text className="rounded-md animate-pulse" style={{ width: '50%', height: 20, marginTop: 4, backgroundColor: '#e0e0e0' }}></Text>
            </View>
        </View>
    );
};

export const CategorysidebarPlaceholder = () => {
    return (
        <View>
            {/* <ShimmerPlaceHolder className="w-1/2 mb-4 ml-4 h-4 rounded-sm" shimmerColors={['#ffcf87', '#ddd', '#ddd']} /> */}
            <View className="flex flex-row flex-wrap justify-center ">
                {
                    [1, 2, 3, 4, 5, 6, 7, 8].map((item, i) => {
                        return <View key={i} style={{ padding: 4 }}>
                            {/* Text Placeholder */}
                            <ShimmerPlaceHolder width={90} height={90} style={{ borderRadius: 1 }} shimmerColors={['#ffcf87', '#ddd', '#ffcf87']} />
                        </View>
                    })
                }
            </View>
        </View>
    )
}

export const TransactionSkeleton = () => {
    return (
        <View>
            {/* <ShimmerPlaceHolder className="w-1/2 mb-4 ml-4 h-4 rounded-sm" shimmerColors={['#ffcf87', '#ddd', '#ddd']} /> */}
            <View className="">
                {
                    [1, 2, 3, 4, 5, 6, 7, 8].map((item, i) => {
                        return <View key={i} style={{ padding: 10 }} className="w-full">
                            {/* Text Placeholder */}
                            <ShimmerPlaceHolder width={screenWidth - 20} height={70} style={{ borderRadius: 10 }} shimmerColors={['#eee', '#ddd', '#eee']} />
                        </View>
                    })
                }
            </View>
        </View>
    )
}

export const CategoryPlaceholder = () => {
    return (
        <View>
            <ShimmerPlaceHolder className="w-1/2 mb-4 ml-4 h-4 rounded-md" shimmerColors={['#ffcf87', '#ddd', '#ddd']} />
            <View className="flex flex-row flex-wrap justify-center gap-2 ">
                {
                    [1, 2, 3, 4, 5, 6,].map((item, i) => {
                        return <View key={i} style={{ padding: 4 }}>
                            {/* Text Placeholder */}
                            <ShimmerPlaceHolder width={90} height={90} style={{ borderRadius: 50 }} shimmerColors={['#ffcf87', '#ddd', '#ffcf87']} />
                            <ShimmerPlaceHolder width={80} height={8} style={{ marginTop: 10 }} className="mx-auto rounded-md" shimmerColors={['#ffcf87', '#ddd', '#ffcf87']} />
                        </View>
                    })
                }
            </View>
        </View>
    );
};
export const PickinterestPlaceholder = () => {
    return (
        <View>
            <View className="flex flex-row flex-wrap justify-center gap-4 mt-2">
                {
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item, i) => {
                        return <View key={i} style={{ padding: 10 }}>
                            {/* Text Placeholder */}
                            <ShimmerPlaceHolder width={80} height={80} style={{ borderRadius: 50 }} shimmerColors={['#ffcf87', '#ddd', '#ffcf87']} />
                            <ShimmerPlaceHolder width={70} height={8} style={{ marginTop: 10 }} className="mx-auto rounded-sm" shimmerColors={['#ffcf87', '#ddd', '#ffcf87']} />
                        </View>
                    })
                }
            </View>
        </View>
    );
};
export const ServicesPlaceholder = () => {
    return (
      
        <View>
            <ShimmerPlaceHolder className="w-1/2 mb-4 ml-4 h-4 rounded-md" shimmerColors={['#ffcf87', '#ddd', '#ddd']} />
            <View className="flex flex-row flex-wrap justify-center gap-2 ">
                {
                    [1, 2, 3].map((item, i) => {
                        return <View key={i} style={{ padding: 4 }}>
                            {/* Text Placeholder */}
                            <ShimmerPlaceHolder width={90} height={90} style={{ borderRadius: 50 }} shimmerColors={['#ffcf87', '#ddd', '#ffcf87']} />
                            <ShimmerPlaceHolder width={80} height={8} style={{ marginTop: 10 }} className="mx-auto rounded-md" shimmerColors={['#ffcf87', '#ddd', '#ffcf87']} />
                        </View>
                    })
                }
            </View>
        </View>
    );
};



export const SubcategoryPlaceholder = () => {
    return (
        <View>
            <View className="flex flex-row flex-wrap justify-center ">
                {
                    [1, 2, 3, 4, 5].map((item, i) => {
                        return <View key={i} style={{ padding: 10 }}>
                            {/* Text Placeholder */}
                            <ShimmerPlaceHolder width={80} height={80} style={{ borderRadius: 50 }} shimmerColors={['#ffcf87', '#ddd', '#ffcf87']} />
                        </View>
                    })
                }
            </View>
        </View>
    );
};
export const ProductcategoryPlaceholder = () => {
    return (
        <View>
            <View className="flex flex-row flex-wrap justify-center  gap-x-12 gap-y-4 mb-20 ">
                {
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item, i) => {
                        return <View key={i} style={{ padding: 10 }}>
                            {/* Text Placeholder */}
                            <ShimmerPlaceHolder width={120} height={120} style={{ borderRadius: 5 }} shimmerColors={['#ffcf87', '#ddd', '#ffcf87']} />
                            <ShimmerPlaceHolder width={100} height={8} style={{ marginTop: 10 }} className="mx-auto rounded-sm" shimmerColors={['#ffcf87', '#ddd', '#ffcf87']} />

                        </View>
                    })
                }
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    productContainer: {
        width: windowWidth / 2 - 10, // Adjust spacing as needed
        backgroundColor: 'white',
        borderColor: 'lightgray',
        borderRadius: 5,
        margin: 5

    },
    container: {
        flexDirection: 'column',
        marginVertical: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    item: {
        width: '22%',
        marginBottom: 10,
    },
})