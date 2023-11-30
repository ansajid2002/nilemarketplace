import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";
import { Text } from "react-native";
import { View } from "react-native";
import { createShimmerPlaceHolder } from 'expo-shimmer-placeholder'
import { LinearGradient } from 'expo-linear-gradient'

const ShimmerPlaceHolder = createShimmerPlaceHolder(LinearGradient)

const windowWidth = Dimensions.get('window').width;


export const ProductSkeleton = () => {
    return (
        <View style={styles.productContainer} >
            <View style={{ width: '100%', height: 200, borderRadius: 8, backgroundColor: '#e0e0e0' }}></View>
            <View style={{ flexDirection: 'column', marginLeft: 2, justifyContent: 'center', marginTop: 10 }}>
                <Text style={{ width: '70%', height: 10, backgroundColor: '#e0e0e0' }}></Text>
                <Text style={{ width: '50%', height: 10, marginTop: 4, backgroundColor: '#e0e0e0' }}></Text>
            </View>
        </View>
    );
};

export const CategoryPlaceholder = () => {
    return (
        <View>
            <ShimmerPlaceHolder className="w-1/2 mb-4 ml-4 h-4 rounded-sm" shimmerColors={['#ffcf87', '#ddd', '#ddd']} />
            <View className="flex flex-row flex-wrap justify-center gap-4">
                {
                    [1, 2, 3, 4, 5, 6,].map((item, i) => {
                        return <View key={i} style={{ padding: 10 }}>
                            {/* Text Placeholder */}
                            <ShimmerPlaceHolder width={100} height={100} style={{ borderRadius: 50 }} shimmerColors={['#ffcf87', '#ddd', '#ffcf87']} />
                            <ShimmerPlaceHolder width={80} height={8} style={{ marginTop: 10 }} className="mx-auto rounded-sm" shimmerColors={['#ffcf87', '#ddd', '#ffcf87']} />
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
        marginBottom: 3, // Adjust spacing as needed
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