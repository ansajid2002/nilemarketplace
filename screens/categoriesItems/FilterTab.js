import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Entypo } from '@expo/vector-icons';
import { AdminUrl } from '../../constant';

const FilterTab = ({ closeModal, subcategoriesToShow, selectedFunc }) => {
    const [selectedValues, setSelectedValues] = useState([]);
    const [totalCount, setTotalResults] = useState(0);

    // Extracting nested_subcategory_name values
    const nestedSubcategoryNames = subcategoriesToShow.flatMap(subcategory => (
        (subcategory.nested_subcategories || []).map(nestedSubcategory => nestedSubcategory.nested_subcategory_name)
    ));

    // TabView configuration
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'first', title: 'Category' },
    ]);

    const FirstRoute = () => (
        <View className="p-4 space-y-2  ">
            {/* Use the nestedSubcategoryNames array as needed */}
            {
                nestedSubcategoryNames.length === 0 ? 
            
                <Text className="text-center my-10 text-lg italic">No Categories Found !</Text>
            :<ScrollView showsVerticalScrollIndicator={false} className="  h-[60vh] p-4   ">
            <View className="flex-row flex-wrap items-center gap-2 ">
                {nestedSubcategoryNames.filter(Boolean).map((name, index) => (
                    <TouchableOpacity key={index} onPress={() => handleItemClick(name)}>
                        <View className={` my-2 rounded-full border border-gray-400 px-4 py-2 ${selectedValues.includes(name) ? 'bg-blue-500' : ''}`}>
                            <Text className={`font-semibold ${selectedValues.includes(name) ? 'text-white' : 'text-black'}`}>{name}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

            </View>
            </ScrollView>
            }
            {
                nestedSubcategoryNames.length !== 0 && 
            <View className="flex-row justify-end p-4 mt-10">
                <Text className="p-4" onPress={() => setSelectedValues([])}>Reset</Text>

                {/* Show results button with border radius and onPress */}
                <TouchableOpacity onPress={handleSearch} style={{ borderRadius: 50 }}>
                    <Text className={`${parseInt(totalCount) > 0 ? 'bg-orange-500' : 'bg-gray-400'}  p-4 text-white`} >Show {totalCount} results</Text>
                </TouchableOpacity>
            </View> }
        </View>
    );

    const handleSearch = () => {
        if (parseInt(totalCount) === 0) return
        selectedFunc(selectedValues)
    }

    const handleItemClick = (value) => {
        if (selectedValues.includes(value)) {
            // If already selected, remove from the list
            setSelectedValues(selectedValues.filter(item => item !== value));
        } else {
            // If not selected, add to the list
            setSelectedValues([...selectedValues, value]);
        }
    };

    useEffect(() => {
        if (selectedValues?.length > 0) {
            // Replace the URL with your backend endpoint
            const backendEndpoint = `${AdminUrl}/api/fetchCategoryProductsCount`;

            // Example of a POST request
            fetch(backendEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any other headers needed for authentication or other purposes
                },
                body: JSON.stringify({ selectedValues }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Backend response:', data);
                    setTotalResults(data?.totalProductCount)
                    // Add any logic to handle the response from the backend
                })
                .catch(error => {
                    console.error('Error sending request to backend:', error);
                    // Add any logic to handle errors
                });
        } else {
            setTotalResults(0)
        }
    }, [selectedValues]);

    const renderScene = SceneMap({
        first: FirstRoute,
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <TouchableOpacity onPress={closeModal}>
                <View className="flex-row justify-end p-4">
                    <Entypo name="cross" size={28} color={'black'} />
                </View>
            </TouchableOpacity>
          

            {/* TabView */}
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: 300 }}
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        indicatorStyle={{ backgroundColor: 'blue' }}
                        style={{ backgroundColor: 'white' }}
                        labelStyle={{ color: 'black' }}
                    />
                )}
            />
                 



        </SafeAreaView>
    );
};

export default FilterTab;
