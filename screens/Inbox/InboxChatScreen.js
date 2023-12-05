import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { AdminUrl, HeaderBar } from '../../constant';
import { useSelector } from 'react-redux';
import moment from 'moment/moment';

const InboxChatScreen = ({ route, navigation }) => {
    const vendorData = route.params?.data || null;
    const { customerData } = useSelector((store) => store.userData)

    const customerId = customerData[0]?.customer_id

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const flatListRef = useRef(null);



    useEffect(() => {
        fetchConversations();
    }, [customerId, vendorData?.id]);

    const fetchConversations = async () => {
        try {
            const response = await fetch(`${AdminUrl}/api/getConversationMessages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId,
                    vendorId: vendorData?.id,
                    type: 'customer',

                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const responseData = await response.json();

            // Update the state with the fetched messages
            setMessages(responseData.messages);

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        // Define your function

        // Set up a timer to call the function every 3 seconds
        const intervalId = setInterval(() => {
            fetchConversations()
        }, 3000);

        // Cleanup the interval when the component is unmounted
        return () => clearInterval(intervalId);
    }, []); // The empty dependency array ensures that this effect runs only once on mount




    const handleSendMessage = async () => {
        if (newMessage.trim() === '') {
            return; // Do not send empty messages
        }

        try {
            // Send message to backend
            const response = await fetch(`${AdminUrl}/api/sendInboxMessages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include any other headers as needed, such as authorization token
                },
                body: JSON.stringify({
                    senderId: customerId, // the sender ID,
                    recipientId: vendorData?.id,// the recipient ID,
                    content: newMessage,
                    timestamp: moment().format(),
                    userType: 'customer'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Parse the response or handle success as needed
            const responseData = await response.json();
            console.log('Message sent successfully:', responseData);

            // Update the local state or trigger a reload of messages if needed
            const updatedMessages = [...messages, { text: newMessage, sender: 'customer', timestamp: moment().format() }];
            setMessages(updatedMessages);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error.message);
            // Handle the error (show a notification, etc.)
        }
    };

    useEffect(() => {
        // Auto-scroll to the end when a new message is added
        flatListRef.current.scrollToEnd({ animated: true });
    }, [newMessage]);

    return (
        <View style={{ flex: 1 }}>
            {vendorData && <HeaderBar title={vendorData?.brand_name || ''} goback={true} navigation={navigation} cartEnable={false} searchEnable={false} />}
            <View style={{ flex: 1, padding: 10 }}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={{ flexDirection: item.sender === 'customer' ? 'row-reverse' : 'row', marginBottom: 10 }}>
                            <View
                                className={`flex-row p-4 ${item.sender === 'customer' ? 'bg-green-300' : 'bg-white'} rounded-md`}
                            >
                                <Text className="mr-2">{item.text}</Text>
                                <Text className="relative -bottom-2 items-end" style={{ color: '#000', fontSize: 12 }}>{moment(item.timestamp.toLocaleString()).format('LT')}</Text>
                            </View>
                        </View>
                    )}
                    onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
                />

                {/* Input for typing new messages */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                    <TextInput
                        style={{ flex: 1, borderWidth: 1, borderRadius: 5, padding: 8 }}
                        placeholder="Type your message..."
                        value={newMessage}
                        keyboardType='web-search'
                        onChangeText={(text) => setNewMessage(text)}
                    />
                    <TouchableOpacity onPress={handleSendMessage} style={{ marginLeft: 10, padding: 8, backgroundColor: '#5cb85c', borderRadius: 5 }}>
                        <Text style={{ color: 'white' }}>Send</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default InboxChatScreen;
