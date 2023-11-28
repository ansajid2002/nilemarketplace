import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { debounce } from 'lodash';

const CategoryList = ({ data, index }) => {
    const [activeCategory, setActiveCategory] = useState(null);

    useEffect(() => {
        // Update the active category based on the index prop
        if (index >= 0 && index < data.length) {
            setActiveCategory(data[index].category_name);
        }
    }, [index, data]);

    const handleCategoryClick = (categoryName) => {
        setActiveCategory(categoryName);
    };

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
        >
            <View style={styles.container}>
                {data.map((item, idx) => (
                    <TouchableOpacity
                        key={idx.toString()}
                        style={[
                            styles.categoryContainer,
                            activeCategory === item.category_name && styles.activeCategory,
                        ]}
                        onPress={debounce(() => handleCategoryClick(item.category_name),500)}
                    >
                        <Text
                            style={[
                                styles.categoryText,
                                activeCategory === item.category_name && styles.activeCategoryText,
                            ]}
                        >
                            {item.category_name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

export default CategoryList;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryContainer: {
        marginLeft: 8, // Adjust the spacing between category names
    },
    categoryText: {
        fontSize: 16,
        color: '#313131', // Default text color
    },

    activeCategoryText: {
        color: '#000', // Change the text color for active category
        fontWeight: 'bold'
    },
});
