import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

const BottomSheetProduct = () => {
    // ref
    const bottomSheetRef = useRef(null);

    // variables
    const snapPoints = useMemo(() => ['25%', '50%', '75%'], []);

    // callbacks
    const handleSheetChanges = useCallback((index) => {
        // You can conditionally change container styles based on the index
        // For example, set backgroundColor to 'transparent' when closed (index 1)
        if (index <= 0) {
            setContainerStyles({
            });
        } else {
            setContainerStyles(styles.container);
        }
    }, []);

    // state to dynamically set container styles
    const [containerStyles, setContainerStyles] = useState(styles.container);

    // renders
    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={1} appearsOnIndex={2} />
        ),
        []
    );

    const openBottomSheet = () => {
        if (bottomSheetRef.current) {
            bottomSheetRef.current.openBottomSheet()
        }
    };

    return (
        <View style={containerStyles}>
            <BottomSheet
                ref={bottomSheetRef}
                index={1}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                onChange={handleSheetChanges}
                enablePanDownToClose={true}
            >
                <View style={styles.contentContainer}>
                    <Text>Awesome 🎉</Text>
                </View>
            </BottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.3)',
        position: 'absolute',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
    },
});

export default BottomSheetProduct;
