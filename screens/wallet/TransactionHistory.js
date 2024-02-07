import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StatusBar, SafeAreaView, TouchableOpacity, TextInput, FlatList, StyleSheet, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { AdminUrl } from '../../constant';
import { formatCurrency } from './Wallet';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const TransactionHistory = ({ navigation }) => {
  const { customerData } = useSelector((store) => store.userData);
  const customerId = customerData[0]?.customer_id;
  const [currentPage, setCurrentPage] = useState(1);
  const [recentTransactions, setRecentTransactions] = useState(null);
  const [filteredTransactionsData, setFilteredTransactions] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef(null);
  const {t} = useTranslation()

  // const onEndReached = async () => {
  //   console.log('hello');
  //   if (recentTransactions?.length === 0) {
  //     // If there are no recent transactions, don't fetch more data
  //     return;
  //   }

  //   // Fetch more data with an increased page number
  //   try {
  //     const nextPage = currentPage + 1;
  //     const response = await fetch(`${AdminUrl}/api/fetchCustomerTransaction?customer_id=${customerId}&page=${nextPage}&pageSize=10`);
  //     const data = await response.json();

  //     if (data?.transactions && data.transactions?.length > 0) {
  //       // If new transactions are received, update the state and current page
  //       setRecentTransactions((prevTransactions) => [...prevTransactions, ...data.transactions]);
  //       setFilteredTransactions((prevTransactions) => [...prevTransactions, ...data.transactions]);
  //       setCurrentPage(nextPage);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching more data:', error);
  //   }
  // };

  const handleGoBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    customerId && fetchData(1, 50000000);
  }, [customerId])

  const fetchData = async (page, pageSize) => {
    try {
      const response = await fetch(`${AdminUrl}/api/fetchCustomerTransaction?customer_id=${customerId}&page=${page}&pageSize=${pageSize}`);
      const data = await response.json();
      setRecentTransactions(data?.transactions);
      setFilteredTransactions(data?.transactions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = async (text) => {
    setSearchText(text);

    console.log(text);
    try {
      const response = await fetch(`${AdminUrl}/api/fetchCustomerTransaction?customer_id=${customerId}&page=1&pageSize=10&search=${text}`);
      const data = await response.json();
      setRecentTransactions(data?.transactions);
      setFilteredTransactions(data?.transactions);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
    }
  };


  const groupTransactionsByMonth = () => {
    if (!filteredTransactionsData) {
      return [];
    }

    const groupedByMonth = filteredTransactionsData.reduce((result, transaction) => {
      const transactionDate = new Date(transaction.datetime);
      const monthYearKey = transactionDate.toLocaleString('default', { month: 'long', year: 'numeric' });

      if (!result[monthYearKey]) {
        result[monthYearKey] = {
          transactions: [],
          total: 0,
        };
      }

      result[monthYearKey].transactions.push(transaction);
      if (transaction.status === 'paid') {
        result[monthYearKey].total += parseFloat(transaction.amount);
      }

      return result;
    }, {});

    return Object.entries(groupedByMonth).map(([key, value]) => ({
      monthYear: key,
      transactions: value.transactions,
      total: value.total,
    }));
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  const groupedTransactions = groupTransactionsByMonth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View className="flex-1">
        <View className="h-12  m-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={handleGoBack} style={styles.goBackButton}>
            <Ionicons name="ios-arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            placeholder="Search..."
            style={styles.searchInput}
            value={searchText}
            onChangeText={handleSearch}
            onBlur={dismissKeyboard}

          />
        </View>
        <FlatList
          data={groupedTransactions}
          keyExtractor={(item, index) => index}
          renderItem={({ item, index }) => (
            item && <View style={styles.monthContainer} >
              {index > 0 && groupedTransactions && index < groupedTransactions?.length - 1 && // Check if there's a gap between months
                groupedTransactions[index - 1].transactions?.length > 0 && // Check if the previous month has transactions
                (new Date(item.monthYear).getMonth() - new Date(groupedTransactions[index - 1].monthYear).getMonth()) > 2 && (
                  <View style={styles.ellipsisContainer}>
                    <Text style={styles.ellipsis}>...</Text>
                  </View>
                )
              }
              <View className="bg-gray-200 flex-row justify-between p-4">

                <Text className="text-lg font-semibold">{item.monthYear}</Text>
                <Text className="text-lg font-semibold">{formatCurrency(item.total)}</Text>
              </View>

              <FlatList
                data={item.transactions}
                keyExtractor={(transaction) => transaction.transaction_id.toString()}
                renderItem={({ item: transaction }) => (
                  <View style={styles.transactionItem} className="flex-row justify-between">
                    <View className="p-2">
                      {transaction.status === 'paid' ? (
                        transaction.amount < 0 ? (
                          <AntDesign name="arrowdown" size={24} color="red" />
                        ) : (
                          <AntDesign name="arrowup" size={24} color="green" />
                        )
                      ) : (
                        <MaterialIcons name="payment" size={24} color="orange" /> // Or use any other icon for unpaid transactions
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-lg">{transaction.description}</Text>
                      <Text className="mt-2 text-gray-400">{moment(transaction.datetime).format('LT')}</Text>
                    </View>
                    <View className="justify-between">
                      {
                        transaction.amount < 0 ? <Text className="text-red-500 font-semibold text-xl">{formatCurrency(transaction?.amount)}</Text> : <Text className="text-green-500 font-semibold text-xl">{formatCurrency(transaction?.amount)}</Text>
                      }
                    </View>
                    {/* Add more details as needed */}
                  </View>
                )}
              />
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.noTransactionContainer}>
              <Text style={styles.noTransactionText}>{t("No transactions found")}</Text>
            </View>
          )}
          onEndReached={() => {
            console.log('onEndReached called');
          }}
          onEndReachedThreshold={0.6}
          refreshing={refreshing}
          onRefresh={() => fetchData(1, 10)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 20
  },
  goBackButton: {
    marginRight: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
    height: 40,
  },
  monthContainer: {
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  transactionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  totalContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  noTransactionContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noTransactionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransactionHistory;