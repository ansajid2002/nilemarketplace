import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { AdminUrl, HeaderBar } from '../../constant';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const Inbox = ({ navigation }) => {
    const [conversations, setConversations] = useState(null);
    const [error, setError] = useState('');
    const { customerData } = useSelector((store) => store.userData)
    const { t } = useTranslation()


    const customerId = customerData[0]?.customer_id
    // Fetch conversations from the backend
    const fetchConversations = async () => {
        try {
            const response = await fetch(`${AdminUrl}/api/conversations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include any other headers as needed, such as authorization token
                },
                body: JSON.stringify({ customerId })
            });
            if (!response.ok) {
                throw new Error('Failed to fetch conversations');
            }
            const data = await response.json();
            console.log(data);
            setConversations(data)

            if (data?.error) {
                setError(data?.error)
            }
        } catch (error) {

            console.error('Error fetching conversations:', error.message);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [customerId]);

    useEffect(() => {
        // Define your function

        // Set up a timer to call the function every 3 seconds
        const intervalId = setInterval(() => {
            fetchConversations()
        }, 3000);

        // Cleanup the interval when the component is unmounted
        return () => clearInterval(intervalId);
    }, []); // The empty dependency array ensures that this effect runs only once on mount


    const renderConversationItem = ({ item }) => {

        return (

            <TouchableOpacity onPress={() => navigation.navigate('InboxChatScreen', { data: item.vendorDetails })}>
                <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc', flexDirection: 'row', alignItems: 'center' }}>
                    {/* Display vendor image */}
                    <Image
                        source={{ uri: `${AdminUrl}/uploads/vendorBrandLogo/${item.vendorDetails?.brand_logo?.images?.[0]}` }}  // Replace 'image_url' with the actual key for the vendor image in your data
                        style={{ width: 50, height: 50, borderRadius: 25, marginRight: 16 }}
                    />

                    <View>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.vendorDetails?.brand_name || 'hello'}</Text>
                        <Text>{item.lastMessage?.content || 'hey'}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }




    const renderSkeleton = (index) => {
        return <View key={index} style={{ display: 'flex', flexDirection: 'row' }} className="p-2">
            <View className="w-12 h-12 bg-gray-300 animate-pulse rounded-full"></View>
            <View style={{ flex: 1, padding: 10 }}>
                <View className="w-full h-2 bg-gray-300 animate-pulse rounded-full"></View>
                <View className="w-1/2 my-2 h-2 bg-gray-300 animate-pulse rounded-full"></View>
            </View>
        </View>
    }

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: "white",
        }} >
            <HeaderBar title={t("Inobx")} goback={true} navigation={navigation} searchEnable={false} />
            {
                conversations == null ? (
                    // Handle the case when conversations is null
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item, index) => renderSkeleton(index))

                ) : (
                    // Check the length of conversations
                    conversations.length > 0 ? (
                        // Render the FlatList if conversations has items
                        <FlatList
                            data={conversations}
                            keyExtractor={(item) => item.conversation_id.toString()}
                            renderItem={renderConversationItem}
                        />
                    ) : (
                        // Render a message when there are no conversations
                        <View className="p-6 rounded-lg shadow-md">
                            <Text className="text-[26px] font-bold mb-4 text-center">
                                {error}
                            </Text>
                            <Text className="text-base text-center">
                                Visit Vendor Profile to start conversations
                            </Text>
                        </View>
                    )
                )
            }

        </SafeAreaView>
    );
};

export default Inbox;
