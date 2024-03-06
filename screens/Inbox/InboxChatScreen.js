import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { AdminUrl, HeaderBar } from '../../constant';
import { useSelector } from 'react-redux';
import moment from 'moment/moment';
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native';

const InboxChatScreen = ({ route, navigation }) => {
    const vendorData = route.params?.data || null;
    const chat_data = route.params?.chats || '';
    const { customerData } = useSelector((store) => store.userData)

    const customerId = customerData[0]?.customer_id

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState(chat_data || '');
    const flatListRef = useRef(null);
    const { t } = useTranslation()


    // console.log(messages,"messages");
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
            // console.log('Message sent successfully:', responseData);

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


    // Function to get relative date
    const getFormattedDate = (messageDate) => {
        const date = moment(messageDate);
        return date.format('MMMM DD, YYYY');
    };

    // Function to get relative date
    const getRelativeDate = (messageDate) => {
        const currentDate = moment();
        const date = moment(messageDate);

        if (currentDate.isSame(date, 'day')) {
            return 'Today';
        } else if (currentDate.clone().subtract(1, 'day').isSame(date, 'day')) {
            return 'Yesterday';
        } else if (currentDate.diff(date, 'days') < 7) {
            return date.format('dddd'); // Display day of the week
        } else {
            return getFormattedDate(messageDate); // Display formatted date
        }
    };

    // Group messages by date
    const groupedMessages = messages.reduce((grouped, message) => {
        const relativeDate = getRelativeDate(message.timestamp);
        if (!grouped[relativeDate]) {
            grouped[relativeDate] = [];
        }
        grouped[relativeDate].push(message);
        return grouped;
    }, {});

    // Output the grouped messages
    //   console.log(groupedMessages);


    const messageGroups = Object.entries(groupedMessages).map(([date, messages], index) => ({
        id: index.toString(),
        date,
        messages,
    }));

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height mt-10'}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
                {vendorData && <HeaderBar title={vendorData?.brand_name || ''} goback={true} navigation={navigation} cartEnable={false} searchEnable={false} />}
                <View style={{ flex: 1, padding: 10 }}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        ref={flatListRef}
                        data={messageGroups}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View>
                                <Text style={{ textAlign: 'center', marginVertical: 10, fontSize: 18 }}>{item.date}</Text>
                                {item.messages.map((message, index) => (
                                    <View key={index.toString()} style={{ flexDirection: message.sender === 'customer' ? 'row-reverse' : 'row', marginBottom: 10 }}>
                                        <View style={{ backgroundColor: message.sender === 'customer' ? '#25D366' : 'rgb(230,230,230)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6 }}>
                                            <Text style={{ marginRight: 2 }}>{message.text}</Text>
                                            <Text style={{ textAlign: message.sender === 'customer' ? 'right' : 'left', fontSize: 12, color: 'gray' }}>{moment(message.timestamp).format('LT')}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
                    />
                    {/* Input for typing new messages */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.contentContainer}
                            showsVerticalScrollIndicator={true}
                        >
                            <TextInput
                                style={styles.textInput}
                                multiline={true}
                                placeholder="Type your message..."
                                value={newMessage}
                                onChangeText={(text) => setNewMessage(text)}
                                className="border px-2 border-gray-500"
                            />
                        </ScrollView>

                        <TouchableOpacity onPress={handleSendMessage} style={{ marginLeft: 10, padding: 8, backgroundColor: '#25D366', borderRadius: 5 }}>
                            {/* <Text style={{ color: 'white' }}>Send</Text> */}
                            <MaterialIcons
                                name="send"
                                color="white"
                                size={25}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({

    scrollView: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
    },
    textInput: {
        flex: 1,
        borderWidth: 0, // Remove border from TextInput, as it's wrapped by ScrollView
    },
});

export default InboxChatScreen;
