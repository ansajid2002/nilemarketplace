import React, { useState, useEffect, useRef } from 'react';
import { View, Text, BackHandler, TouchableOpacity, TextInput, StyleSheet, FlatList, Image, TouchableWithoutFeedback, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminUrl } from '../../constant';
import { useDispatch, useSelector } from 'react-redux';
import { formatCurrency } from './Wallet';
import { getwalletTotal } from '../../store/slices/walletSlice';
import { useNavigation } from '@react-navigation/native';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import ProtectedTransaction from './ProtectedTransaction';

const SearchUsertoSend = ({ goback, amount }) => {
    const [searchText, setSearchText] = useState('');
    const [showLoader, setShowloader] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreData, setHasMoreData] = useState(true);

    const [filteredData, setFilteredData] = useState(null); // Filtered user data based on search
    const [selectedUser, setSelectedUser] = useState(null); // Selected user for sending money
    const [buttonloader, setButtonLoader] = useState(false); // Transaction summary
    const [modalVisible, setModalVisible] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const { t } = useTranslation()

    const { customerData } = useSelector((store) => store.userData)
    const { given_name, family_name, customer_id, email, picture } = customerData[0]

    const dispatch = useDispatch()
    const inputRef = useRef(null);

    const navigation = useNavigation()

    // useEffect(() => {
    //     // Your existing code...

    //     const cleanup = () => {
    //         // Reset selected user and transaction summary when component is unmounted
    //         setSelectedUser(null);
    //     };

    //     return cleanup;
    // }, []);

    useEffect(() => {
        const handleBackPress = () => {
            goback();
            console.log('Back button pressed or back handler triggered');
            // Add any additional logic or navigation handling if needed
            return true; // Return true to prevent the default behavior (exit the app)
        };

        // Add event listener for hardware back press
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        return () => {
            // Remove the event listener when the component is unmounted
            backHandler.remove();
        };
    }, [goback]);

    const handleSearch = async (text, page = 1, pageSize = 20) => {
        setSearchText(text);
        // Reset page state when a new search is initiated
        if (page === 1) {
            setShowloader(true)
            setCurrentPage(1);
            setHasMoreData(true);
        }

        // Check if the entered text has at least three characters
        if (text.trim().length < 1) {
            setShowloader(false);
            setFilteredData(null);
            return;
        }

        try {
            const response = await fetch(`${AdminUrl}/api/usersList?search=${text}&page=${page}&pageSize=${pageSize}`);
            const data = await response.json();

            console.log(data);
            if (response.ok) {
                // Check if there is more data in the response
                setHasMoreData(data.length === pageSize);
                // Append data to the existing list for pagination
                setFilteredData((prevData) => (page === 1 ? data : [...prevData, ...data]));
            } else {
                console.error('Error fetching user data:', data);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setShowloader(false);
        }
    };

    const handleContainerPress = () => {
        // Manually blur the TextInput when the container is pressed
        if (inputRef.current) {
            inputRef.current.blur();
        }
    };

    const renderUserItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleUserMoney(item)} style={styles.userItem}>
            {item.picture && item.picture.startsWith('https') ? (
                // If the picture starts with 'https', use it directly
                <Image source={{ uri: item.picture }} style={styles.userImage} />
            ) : item.picture ? (
                // If the picture exists but doesn't start with 'https', use the AdminUrl
                <Image source={{ uri: `${AdminUrl}/uploads/customerProfileImages/${item.picture}` }} style={styles.userImage} />
            ) : (
                // If there's no picture, display the default image
                <Image source={require('../../assets/noimage.jpg')} style={styles.userImage} />
            )}

            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.given_name} {item.family_name}</Text>
                {item.phone_number ? (
                    <Text style={styles.userContact}>{item.phone_number}</Text>
                ) : (
                    <Text style={styles.userContact}>{item.email}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    const handleUserMoney = (user) => {
        // Set the selected user when a user is clicked
        setSelectedUser(user);
        // Show the modal
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        // Close the modal and reset the selected user
        setModalVisible(false);
        setSelectedUser(null);
    };


    // Calculate the total amount including charges
    const charges = 0; // Replace with your actual charges calculation logic
    const totalAmount = parseFloat(amount) + charges;

    const processTransaction = async () => {
        const currentDatetime = new Date().toISOString();
        setButtonLoader(true)
        try {
            const response = await fetch(`${AdminUrl}/api/transfertofriend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerData: customerData[0], selectedUser, totalAmount, datetime: currentDatetime, // Include the generated datetime
                }),
            });

            if (response.ok) {
                const data = await response.json()
                const { status, message, remaining_balance } = data
                if (status === 200) {
                    setModalVisible(false)
                    navigation.navigate("Wallet")
                    dispatch(getwalletTotal(remaining_balance))
                } else if (status === 401) {
                    Alert.alert('Error', message);
                }
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Something wen wrong, try again in few minutes...');

        } finally {
            setButtonLoader(false)

        }
    }

    const handleTransfer = async () => {
        // setButtonLoader(true)
        console.log('hello');
        setModalVisible(false)
        setShowPin(true)
    }

    console.log(showPin, 'pn');

    const hanelCLose = () => {
        setShowPin(false)
    }

    const validPin = async (otp) => {
        try {
            // Construct the request payload
            const payload = {
                customer_id, // Assuming customer_id is available in the scope
                otp
            };

            // Make a POST request to your backend endpoint
            const response = await fetch(`${AdminUrl}/api/checkCustomerNilePin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include any additional headers if needed
                },
                body: JSON.stringify(payload),
            });

            // Check the response status
            if (response.ok) {
                await response.json();
                processTransaction()
            } else {
                const errorMessage = await response.json(); // Extract error message from response
                Alert.alert('Error', errorMessage.error); // Display error message in an Alert
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to verify OTP. Please try again.'); // Display a generic error message for other errors
        }
    };


    return (
        <TouchableWithoutFeedback onPress={handleContainerPress}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={goback}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <View style={styles.searchContainer}>
                    <TextInput
                        ref={inputRef}
                        placeholder="Search..."
                        value={searchText}
                        onChangeText={handleSearch}
                        style={styles.searchInput}
                        blurOnSubmit={false}
                    />
                    <Text className="text-sm text-gray-400 mt-1">{t("Enter at least three letter to search user.")}</Text>
                </View>
                {
                    showLoader ? <Text>{t("Loading")}</Text> : <FlatList
                        data={filteredData}
                        keyExtractor={(item) => item.customer_id}
                        renderItem={renderUserItem}
                        ListEmptyComponent={() => (
                            filteredData?.length > 0 && <View style={styles.noUserContainer}>
                                <Text style={styles.noUserText}>{t("No users found")}</Text>
                            </View>
                        )}
                        onEndReached={() => {
                            // Load more data when reaching the end of the list
                            if (hasMoreData) {
                                handleSearch(searchText, currentPage + 1);
                                setCurrentPage((prevPage) => prevPage + 1);
                            }
                        }}
                        onEndReachedThreshold={0.1}
                    />
                }


                {
                    selectedUser && <Modal
                        animationType="slide"
                        transparent={modalVisible}
                        visible={modalVisible}
                        onRequestClose={handleCloseModal}
                    >
                        <View style={styles.overlay}>
                            <View style={styles.modalContainer}>
                                <View className="p-4">
                                    <View className="flex-row justify-between">
                                        <Text className="text-xl font-bold">{t("Summary")}</Text>
                                        <TouchableOpacity onPress={handleCloseModal} >
                                            <Ionicons name="close" style={{ fontSize: 27 }} />
                                        </TouchableOpacity>
                                    </View>
                                    <View className="p-4">
                                        {/* <Text className="text-lg font-semibold">From</Text> */}
                                        <View className="flex-row justify-center">
                                            {picture && picture.startsWith('https') ? (
                                                // If the picture starts with 'https', use it directly
                                                <Image source={{ uri: picture }} style={styles.userImage} />
                                            ) : picture ? (
                                                // If the picture exists but doesn't start with 'https', use the AdminUrl
                                                <Image source={{ uri: `${AdminUrl}/uploads/customerProfileImages/${picture}` }} style={styles.userImage} />
                                            ) : (
                                                // If there's no picture, display the default image
                                                <Image source={require('../../assets/noimage.jpg')} style={styles.userImage} />
                                            )}

                                            <View style={{ justifyContent: 'center' }}>
                                                <Text>{given_name} {family_name}</Text>
                                                <Text>{email}</Text>
                                            </View>

                                        </View>
                                    </View>
                                    <View className="flex-row justify-center">
                                        <Ionicons name="arrow-down" style={{ fontSize: 27 }} />
                                    </View>
                                    <View className="p-4">
                                        {/* <Text className="text-lg font-semibold">To</Text> */}
                                        <View className="flex-row justify-center">
                                            {selectedUser?.picture && selectedUser?.picture.startsWith('https') ? (
                                                // If the selectedUser?.picture starts with 'https', use it directly
                                                <Image source={{ uri: selectedUser?.picture }} style={styles.userImage} />
                                            ) : selectedUser?.picture ? (
                                                // If the selectedUser?.picture exists but doesn't start with 'https', use the AdminUrl
                                                <Image source={{ uri: `${AdminUrl}/uploads/customerProfileImages/${selectedUser?.picture}` }} style={styles.userImage} />
                                            ) : (
                                                // If there's no selectedUser?.picture, display the default image
                                                <Image source={require('../../assets/noimage.jpg')} style={styles.userImage} />
                                            )}

                                            <View style={{ justifyContent: 'center' }}>
                                                <Text>{selectedUser?.given_name} {selectedUser?.family_name}</Text>
                                                <Text>{selectedUser?.email}</Text>
                                            </View>

                                        </View>
                                    </View>

                                    <View className="w-full h-1 bg-gray-200 my-4"></View>
                                    <View className="border mt-2 rounded-xl border-gray-200 ">
                                        <Text className="text-lg font-semibold text-gray-500 mt-2 px-4">{t("Transaction Details")}</Text>
                                        <View className="p-4" >
                                            <View className="flex-row justify-between py-2">
                                                <Text>{t("Token to be sent")}</Text>
                                                <Text>{formatCurrency(amount)}</Text>
                                            </View>
                                            <View className="flex-row justify-between py-2">
                                                <Text>{t("Charges")}</Text>
                                                <Text>$0</Text>
                                            </View>
                                            <View className="border-b border-gray-200"></View>
                                            <View className="flex-row justify-between py-2">
                                                <Text className="font-semibold text-xl">{t("Total Payable ")}</Text>
                                                <Text className="text-xl">{formatCurrency(totalAmount)}</Text>
                                            </View>

                                        </View>
                                        <View className="bg-blue-400  w-full h-3"></View>
                                        <View className="bg-[#013766] rounded-b-lg w-full h-2"></View>
                                    </View>
                                    {
                                        buttonloader ? <View className="p-4 bg-blue-400 justify-center flex-row rounded-md mt-5" >
                                            <ActivityIndicator color={'white'} />
                                        </View> : <TouchableOpacity onPress={() => handleTransfer()}>
                                            <View className="p-4 bg-blue-400 justify-center flex-row rounded-md mt-5" >
                                                <Text className="text-white font-semibold text-lg tracking-wider">{t("Proceed")}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    }
                                </View>


                            </View>


                        </View>
                    </Modal>
                }


                {
                    showPin && <Modal
                        animationType="slide"
                        transparent={true}
                        visible={true}
                        onRequestClose={() => setShowPin(false)}
                    >
                        <View style={styles.overlay}>
                            <View style={styles.modalContainer}>
                                <View className="p-4">
                                    <ProtectedTransaction close={hanelCLose} buttonloader={buttonloader} validPin={validPin} />
                                </View>


                            </View>


                        </View>
                    </Modal>
                }

            </View>


        </TouchableWithoutFeedback >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    searchInput: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        paddingLeft: 10,
        fontSize: 16,
        height: 40,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    userMobile: {
        fontSize: 16,
        color: 'gray',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        justifyContent: 'center'
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    transactionDirection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    arrow: {
        marginHorizontal: 10,
    },
    transactionDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    userDetails: {
        flex: 1,
    },
    modalSubtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 10,
    },
    payButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    payButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalCloseButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    modalCloseButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default SearchUsertoSend;
