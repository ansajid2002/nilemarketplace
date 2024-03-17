import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar, ScrollView, RefreshControl, Alert, SafeAreaView } from 'react-native';
import { AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import mainlogovertical from "../../assets/images/mainlogo.png";
import notranscation from "../../assets/no-transaction.png";
import WalletTab from '../../components/WalletTab';
import { BottomSheet } from '@rneui/base';
// import BottomSheet from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet';
import moment from 'moment';
import { AdminUrl } from '../../constant';
import { useDispatch, useSelector } from 'react-redux';
import { TransactionSkeleton } from '../../components/Skeleton';
import { useFocusEffect } from '@react-navigation/native';
import { getwalletTotal } from '../../store/slices/walletSlice';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};


const Wallet = ({ navigation }) => {
    const { customerData } = useSelector((store) => store.userData)
    const customerId = customerData[0]?.customer_id
    const dispatch = useDispatch()
    const [refreshing, setRefreshing] = useState(false);
    const [recentTransactions, setRecentTransactions] = useState(null);
    const [filteredTransactionsData, setFilteredTransactions] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalTransaction, setTotalTranasaction] = useState(0);
    const { walletTotal } = useSelector((store) => store.wallet)
    const { t } = useTranslation()


    useFocusEffect(
        React.useCallback(() => {
            // Put the logic to reload the screen here, e.g., fetching data
            customerId && fetchData(1, 10);
        }, [])
    );

    const fetchData = async (page, pageSize) => {
        try {
            const response = await fetch(`${AdminUrl}/api/fetchCustomerTransaction?customer_id=${customerId}&page=${page}&pageSize=${pageSize}`); // Replace with your actual API endpoint
            const data = await response.json();
            setRecentTransactions(data?.transactions);
            setFilteredTransactions(data?.transactions);
            setTotalTranasaction(data?.total);
            dispatch(getwalletTotal(data?.totalBalance));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        // Simulate a delay before updating the balance
        setLoading(true)
        setRefreshing(true);
        setTimeout(() => {
            fetchData(1, 10)
            setRefreshing(false);
        }, 1000);
    }, [])


    const applyFilter = (filter) => {
        setSelectedCategory(filter);
        setBottomSheetVisible(false);

        // Simulate a loading state
        setLoading(true);

        // Simulate an asynchronous data fetching
        let filteredData = [];

        if (filter === 'All') {
            filteredData = recentTransactions
        } else if (filter === 'Paid') {
            filteredData = recentTransactions.filter(transaction => transaction.amount < 0);
        } else if (filter === 'Received') {
            filteredData = recentTransactions.filter(transaction => transaction.amount > 0);
        } else if (filter === 'Added') {
            filteredData = recentTransactions.filter(transaction => transaction.amount > 0);
        } else if (filter === 'On Hold') {
            filteredData = recentTransactions.filter(transaction => transaction.amount < 0);
        }

        // Set the filtered data and update the loading state
        setFilteredTransactions(filteredData);
        setLoading(false);
    };

    const navigationOptions = [
        { label: 'Add Money to Wallet', screen: 'AddMoney', icon: 'pluscircleo' },
        { label: 'Send Money from Wallet', screen: 'SendMoney', icon: 'arrowright' },
        { label: 'View Transaction History', screen: 'TransactionHistory', icon: 'barschart' },
        { label: 'Request Wallet Statement', screen: 'DownloadStatement', icon: 'download' },
    ];

    // Function to categorize transactions by date
    const categorizeByDate = (transactionDate) => {
        const today = moment().startOf('day');
        const yesterday = moment().subtract(1, 'days').startOf('day');
        const transactionMoment = moment(transactionDate);

        if (transactionMoment.isSame(today, 'day')) {
            return 'Today';
        } else if (transactionMoment.isSame(yesterday, 'day')) {
            return 'Yesterday';
        } else {
            return transactionMoment.format('MMMM D, YYYY');
        }
    };

    const categorizedTransactions = {};

    filteredTransactionsData && filteredTransactionsData.forEach((transaction) => {
        const category = categorizeByDate(transaction.datetime);
        if (!categorizedTransactions[category]) {
            categorizedTransactions[category] = [];
        }
        categorizedTransactions[category].push(transaction);
    });

    const openDetailsModal = (transaction) => {
        setSelectedTransaction(transaction);
        setBottomSheetVisible(true);
    };

    const checkPaidStatus = async (invoiceId, type_added, cid) => {
        try {
            setLoading(true)
            // Make an API request to check the paid status based on invoiceId
            const response = await fetch(`${AdminUrl}/api/check-invoice-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ invoiceId, type_added, cid }),
            });

            // Dismiss the loading message after a short delay
            const data = await response.json();

            // Check if the response indicates a successful status
            if (type_added === 'Evc') {
                if (response.ok && data.status) {
                    fetchData(page, pageSize);
                    // Show an alert indicating that the payment has been received
                    Alert.alert('Payment Status', 'The payment has been received. Your transaction is now paid.');
                } else {
                    // Handle cases where the payment is not successful or other errors
                    Alert.alert('Payment Status', 'The payment is not successful or there was an error.');
                }
            } else {
                if (response.ok && data.eDahabData.StatusCode === 0 && data.eDahabData.InvoiceStatus === 'Paid') {
                    fetchData(page, pageSize);
                    // Show an alert indicating that the payment has been received
                    Alert.alert('Payment Status', 'The payment has been received. Your transaction is now paid.');
                } else {
                    // Handle cases where the payment is not successful or other errors
                    Alert.alert('Payment Status', 'The payment is not successful or there was an error.');
                }
            }
        } catch (error) {
            // Handle errors
            console.error('Error checking paid status:', error);
            Alert.alert('Error', 'An error occurred while checking the paid status. Please try again later.');
        } finally {
            setLoading(false)
        }
    };

    return (
        <SafeAreaView className="flex-1">
            <ScrollView
                style={{ flex: 1, backgroundColor: 'white' }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Set StatusBar color */}
                <StatusBar barStyle="dark-content" backgroundColor="white" />

                {/* Header with Go Back Button */}
                <View className="relative">
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-5">
                            <AntDesign name="arrowleft" size={24} color="#013766" />
                        </TouchableOpacity>
                        <View style={{ alignItems: 'center' }}>
                            <Image
                                resizeMode='contain'
                                source={mainlogovertical}
                                style={{ width: 200.0, height: 100, borderRadius: 20.0 }}
                            />
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <WalletTab size={22} color={'#013766'} count={0} showLabel={false} />
                                <Text style={{ fontSize: 22, fontWeight: 'bold', marginLeft: 2, color: '#013766' }}>{t(" Wallet")}</Text>
                            </View>
                        </View>
                        <View></View>
                    </View>

                    {/* Available Balance Section */}
                    <View style={{ marginTop: 20 }} className="px-4 sticky top-0">
                        <Text style={{ fontSize: 18, marginBottom: 10 }}>{t("Available Balance")}</Text>

                        <Text style={{ fontSize: 40, fontWeight: 'bold' }}>{formatCurrency(walletTotal)}</Text>

                    </View>

                    {/* Navigation Options */}

                    <View className="border-t border-gray-200 mt-10 p-5">
                        {navigationOptions.map((option, index) => (
                            <TouchableOpacity key={index} onPress={() => navigation.navigate(option.screen)}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} className="border-b border-gray-100 py-4">
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <AntDesign name={option.icon} size={20} color={'#BDC5C9'} style={{ marginRight: 10 }} />
                                        <Text style={{ fontSize: 16 }} className="font-semibold text-sky-700">{t(`${option.label}`)}</Text>
                                    </View>
                                    <FontAwesome5 name="chevron-right" size={16} color="#BDC5C9" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View className="bg-blue-400 w-screen h-3"></View>
                    <View className="bg-[#013766] w-screen h-2"></View>
                </View>

                {/* Recent Transactions Section */}
                <View  style={{ marginTop: 20, justifyContent: 'space-between' }}>
                    <View className="flex-row justify-between px-4 py-2">
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                            {t("Recents")}
                        </Text>
                        <View></View>
                        {/* <TouchableOpacity onPress={() => setBottomSheetVisible(true)}>
                        <AntDesign name="filter" size={20} color="#013766" style={{ marginLeft: 8 }} />
                    </TouchableOpacity> */}
                    </View>
                    {/* Display Filtered Transactions */}
                    {loading ? (
                        <TransactionSkeleton />
                    ) : recentTransactions?.length === 0 ? (
                        <View className="flex-row justify-center items-center">
                            <Image
                                resizeMode='contain'
                                source={notranscation}
                                style={{ width: 200.0, height: 200, borderRadius: 20.0 }}
                            />
                        </View>
                    ) : (
                        <View>
                            {Object.keys(categorizedTransactions).map((category) => (
                                <View key={category}>
                                    <Text className="p-4 bg-gray-200 font-semibold tracking-wide">{t(`${category}`)}</Text>
                                    {categorizedTransactions[category].map((transaction) => (
                                        <View key={transaction.transaction_id} style={{ flexDirection: 'row', justifyContent: "space-around", flexWrap: 'nowrap', marginBottom: 8 }}>
                                            <View style={{ width: '15%', padding: 5 }}>
                                                {transaction.status === 'paid' ? (
                                                    transaction.amount < 0 ? (
                                                        <AntDesign name="arrowdown" size={24} color="red" />
                                                    ) : (
                                                        <AntDesign name="arrowup" size={24} color="green" />
                                                    )
                                                ) : (
                                                    <MaterialIcons name="payment" size={24} color="orange" />
                                                )}
                                            </View>

                                            <TouchableOpacity
                                                key={transaction.transaction_id}
                                                onPress={() => openDetailsModal(transaction)}
                                                style={{ width: '40%', padding: 5 }} // Adjusted width for the center content
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontWeight: 'bold', fontSize: 14, lineHeight: 24 }}>{t(`${transaction.description}`)}</Text>
                                                    <Text style={{ marginTop: 2, color: '#999' }}>{moment(transaction.datetime).format('LT')} ({transaction.type_added})</Text>
                                                </View>
                                            </TouchableOpacity>

                                            <View style={{ position: "relative", alignSelf: 'flex-end' }}>
                                                <Text
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: 'bold',
                                                        color: transaction.amount < 0 ? 'red' : 'green',
                                                        ...(transaction.status === 'unpaid' ? { color: 'orange' } : {}),
                                                        textAlign: 'right', // Align text to the right
                                                    }}
                                                >
                                                    {formatCurrency(transaction.amount || 0)}
                                                </Text>
                                                {transaction.status === 'unpaid' && (
                                                    <TouchableOpacity onPress={() => checkPaidStatus(transaction.invoiceid, transaction.type_added, customerId)}>
                                                        <Text style={{ color: 'blue', marginTop: 2, textAlign: 'right' }}>{t("Check Paid Status")}</Text>
                                                    </TouchableOpacity>
                                                )}
                                                <Text style={{ marginTop: 2, color: '#999', fontSize: 14, textAlign: 'right' }}>{t(`Closing Balance: ${formatCurrency(transaction.closing_balance)}`)}

                                                </Text>
                                            </View>


                                        </View>

                                    ))}
                                </View>
                            ))}

                            {/* Pagination */}
                            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, marginBottom: 50 }}>
                                {Array.from({ length: Math.ceil(totalTransaction / pageSize) }).map((_, index) => {
                                    // Define the number of pages to show before and after the current page
                                    const pagesToShow = 2;

                                    // Calculate the lower and upper bounds for the range
                                    const lowerBound = page - pagesToShow;
                                    const upperBound = page + pagesToShow;

                                    // Determine if the current index is within the range or close to the edges
                                    const shouldShowPage = index + 1 === 1 || (index + 1 >= lowerBound && index + 1 <= upperBound) || index + 1 === Math.ceil(totalTransaction / pageSize);

                                    if (shouldShowPage) {
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => {
                                                    setPage(index + 1);
                                                    setLoading(true);
                                                    fetchData(index + 1, pageSize);
                                                }}
                                                style={{
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 5,
                                                    backgroundColor: page === index + 1 ? '#013766' : 'white',
                                                    borderRadius: 5,
                                                    marginHorizontal: 5,
                                                    borderColor: '#013766',
                                                    borderWidth: 1,
                                                }}
                                            >
                                                <Text style={{ color: page === index + 1 ? 'white' : '#013766' }}>{index + 1}</Text>
                                            </TouchableOpacity>
                                        );
                                    } else if (index === upperBound + 1 || index === lowerBound - 1) {
                                        // Show the ellipsis
                                        return (
                                            <Text key={index} style={{ marginHorizontal: 5, color: '#013766' }}>
                                                ...
                                            </Text>
                                        );
                                    }
                                    return null;
                                })}
                            </View>
                        </View>
                    )}

                </View>

                {/* Bottom Sheet Modal for Filters */}
                <BottomSheet
                    isVisible={bottomSheetVisible}
                    containerStyle={{ backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)' }}
                >
                    {selectedTransaction ? (
                        <View style={{ backgroundColor: 'white', padding: 16 }}>
                            <Text style={{ fontSize: 20, marginBottom: 10, fontWeight: 'bold' }}>{t("Transaction Details")}</Text>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ fontSize: 16, color: '#333' }}>{t("Description:")}</Text>
                                <Text style={{ fontSize: 18 }}>{t(`${selectedTransaction.description}`)}</Text>
                            </View>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ fontSize: 16, color: '#333' }}>{t("Amount:")}</Text>
                                <Text
                                    style={{
                                        fontSize: 18,
                                        color: selectedTransaction.amount < 0
                                            ? 'red'
                                            : selectedTransaction.status === 'unpaid'
                                                ? 'orange'
                                                : 'green',
                                    }}
                                >
                                    {formatCurrency(selectedTransaction.amount)}
                                </Text>
                            </View>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ fontSize: 16, color: '#333' }}>{t("Closing Balance:")}</Text>
                                <Text style={{ fontSize: 18 }}>
                                    {formatCurrency(selectedTransaction.closing_balance)}
                                </Text>
                            </View>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ fontSize: 16, color: '#333' }}>{t("Wallet Transaction ID:")}</Text>
                                <Text style={{ fontSize: 18 }}>{selectedTransaction.wallet_txn_id}</Text>
                            </View>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ fontSize: 16, color: '#333' }}>{t("Send To User:")}</Text>
                                <Text style={{ fontSize: 18 }}>{selectedTransaction.send_to_user}</Text>
                            </View>
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ fontSize: 16, color: '#333' }}>{t("Date:")}</Text>
                                <Text style={{ fontSize: 18 }}>
                                    {moment(selectedTransaction.datetime).format('MMMM D, YYYY LT')}
                                </Text>
                            </View>
                            {/* Add more details as needed */}
                            <TouchableOpacity
                                style={{
                                    marginTop: 20,
                                    paddingVertical: 12,
                                    backgroundColor: '#013766',
                                    borderRadius: 8,
                                    alignItems: 'center',
                                }}
                                onPress={() => {
                                    setSelectedTransaction(null)
                                    setBottomSheetVisible(false)
                                }}
                            >
                                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{t("Close")}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={{ backgroundColor: 'white', padding: 16 }}>
                            <Text style={{ fontSize: 18, marginBottom: 10 }}>{t("Filter Options")}</Text>
                            {['All', 'Paid', 'Received', 'Added'].map(category => (
                                <TouchableOpacity
                                    key={category}
                                    style={{
                                        paddingVertical: 10,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#BDC5C9',
                                    }}
                                    onPress={() => applyFilter(category)}
                                >
                                    <Text style={{ color: selectedCategory === category ? '#013766' : 'black' }}>{t(`${category}`)}</Text>
                                </TouchableOpacity>
                            ))}
                            {/* Dismiss button */}
                            <TouchableOpacity
                                style={{
                                    marginTop: 10,
                                    paddingVertical: 10,
                                    backgroundColor: '#013766',
                                    borderRadius: 5,
                                    alignItems: 'center',
                                }}
                                onPress={() => setBottomSheetVisible(false)}
                            >
                                <Text style={{ color: 'white' }}>{t("Dismiss")}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </BottomSheet>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Wallet;
