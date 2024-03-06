import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, TextInput, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Expo
import { AdminUrl, HeaderBar } from '../../constant';
import { useSelector } from 'react-redux';
import { Image } from 'react-native';
import { RefreshControl } from 'react-native';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const Raise = ({ navigation }) => {
    const [searchText, setSearchText] = useState("");
    const [error, setError] = useState(null);
    const [claimsData, setClaims] = useState(null);
    const [loader, setLoader] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const [refreshing, setRefreshing] = useState(false);

    const { customerData } = useSelector((store) => store.userData)

    const customer_id = customerData?.[0].customer_id
    const {t} = useTranslation()

    const onRefresh = () => {
        setRefreshing(true);
        // Fetch data here
        fetchData(1, 10, searchText)
            .then(() => setRefreshing(false))
            .catch(() => setRefreshing(false));
    };

    const handleSearch = (query) => {
        // Handle search logic here
        setSearchText(query)
        fetchData(1, 10, query)

    };

    const fetchData = async (page, pageSize, search) => {
        if (customer_id !== undefined) {
            setLoader(true);
            try {
                // Construct the URL with page, pageSize, and search parameters
                let apiUrl = `${AdminUrl}/api/getClaimsofCustomers?customer_id=${customer_id}&page=${page}&pageSize=${pageSize}&search=${search}`;

                console.log(apiUrl);
                // Fetch claims by customer_id, page, pageSize, and search
                const claimResponse = await fetch(apiUrl);

                if (!claimResponse.ok) {
                    setClaims([]);
                }

                const claimsData = await claimResponse.json();


                if (page === 1) {
                    // If it's the first page, set the data directly
                    setClaims(claimsData?.claims);
                } else {
                    // If it's a subsequent page, append the new data to the existing data
                    setClaims(prevClaims => [...prevClaims, ...claimsData?.claims]);
                }


                setTotal(claimsData?.totalClaims);
            } catch (err) {
                setError(err.message || '');
            } finally {
                setLoader(false);
            }
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            // The code inside this callback will be executed when the screen comes into focus
            !claimsData && fetchData(1, 10, '');
        }, [customer_id])
    );

    const handleEndReached = () => {
        console.log(claimsData.length, total);
        if (claimsData.length < total) {
            // Only fetch more data if the total number of items is greater than the current number of items
            // and no loading is in progress
            console.log('reached end');
            const nextPage = page + 1;
            fetchData(nextPage, 10, searchText);
        }
    };

    const renderSkeleton = () => (
        <View style={[styles.card, styles.skeleton]}>
            <View style={{ width: '70%', height: 16, marginBottom: 8, borderRadius: 4, backgroundColor: '#e0e0e0' }} />
            <View style={{ width: '40%', height: 12, borderRadius: 4, backgroundColor: '#e0e0e0' }} />
            <View style={{ width: '60%', height: 12, borderRadius: 4, marginTop: 4, backgroundColor: '#e0e0e0' }} />
        </View>
    );

    const renderNoTransactionsFound = () => (
        <View style={{ alignItems: 'center', marginTop: 16 }}>
            <Text>{t("No Ticket found")}</Text>
        </View>
    );

    const renderTicketItem = ({ item }) => {
        return (
            <View className="border-b border-gray-200 py-4 space-y-3">
                <Text><Text className="font-semibold">{t("Ticket Id:")}</Text> {item.customer_claim_id}</Text>
                <View className="space-y-2">
                    <Text><Text className="font-semibold">{t("Body ")}</Text>: {item.customer_claim_description}</Text>
                    <Text><Text className="font-semibold">{t("Date ")}</Text>: {item.customer_claim_date && moment(item.customer_claim_date).format('LLL')}</Text>
                </View>
                {
                    item.customer_reply_description && <View className="space-y-2">
                        <Text><Text className="font-semibold">{t("Reply ")}</Text>: {item.customer_reply_description || '-'}</Text>
                        <Text><Text className="font-semibold">{t("Date ")}</Text>: {item.customer_reply_date ? moment(item.customer_reply_date).format('LLL') : '-'}</Text>
                    </View>
                }
                <View className={`flex-row justify-end`}>
                    <Text className={`${item.customer_claim_status === 'Pending' ? 'text-orange-600' :
                        item.customer_claim_status === 'Ongoing' ? 'text-red-500' :
                            item.customer_claim_status === 'Closed' ? 'text-green-500' : ''
                        }`}>{item.customer_claim_status}</Text>

                </View>
            </View>
        );
    };

    const handleRaiseTicket = () => {
        // Navigate to the "RaiseTicket" screen
        navigation.navigate('AddRaiseTicket'); // Adjust the screen name accordingly
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <HeaderBar
                goback={true}
                navigation={navigation}
                title={'View Raised Ticket'}
                searchEnable={false}
            />
            {/* Search Bar */}
            <View style={{ padding: 16, backgroundColor: "#fff" }}>
                <Text>{t("Search Ticket by ID:")}</Text>
                <TextInput
                    style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, marginTop: 8 }}
                    placeholder={t("Enter Ticket ID")}
                    keyboardType="numeric"
                    onChangeText={handleSearch}
                />
            </View>
            {/* Raise Ticket Link */}
            <TouchableOpacity onPress={handleRaiseTicket} style={{ alignItems: 'center', marginTop: 16 }}>
                <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>{t("Raise a New Ticket")}</Text>
            </TouchableOpacity>
            {/* Recent Tickets */}
            {loader && !claimsData && renderSkeleton()}
            {claimsData?.length === 0 && renderNoTransactionsFound()}
            {claimsData?.length > 0 && (
                <View className="bg-white mt-2 flex-1">
                    <Text className="text-xl font-semibold tracking-wider px-4 py-4">{t("Recent Ticket's")}</Text>
                    <FlatList
                        data={claimsData}
                        keyExtractor={(item) => item.customer_claim_id.toString()}
                        renderItem={renderTicketItem}
                        contentContainerStyle={{ padding: 16 }}
                        onEndReached={handleEndReached}
                        onEndReachedThreshold={0.6} // Adjust as needed (0.1 means 10% from the bottom)
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#009387']} // Customize the loading indicator color
                                tintColor="#009387" // Customize the loading indicator color
                            />
                        }
                    />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#f0f0f0',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 16,
    },
});

export default Raise;
