import React, { useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import SearchUsertoSend from './SearchUsertoSend';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

const SendMoney = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [showUserList, setShowUserComponent] = useState(false);
  const { walletTotal } = useSelector((store) => store.wallet)
  const { t } = useTranslation()

  const handleAmountChange = (text) => {
    // Remove leading zeros
    const sanitizedText = text.replace(/^0+/, '');
    const enteredAmount = parseFloat(sanitizedText);

    if (isNaN(enteredAmount) || enteredAmount > walletTotal || enteredAmount <= 0) {
      setError(`Amount exceeds wallet total or is not valid. Your Wallet Balance: ${walletTotal}`);
    } else {
      setError('');
    }

    setAmount(sanitizedText);
  };


  const handleSend = () => {
    if (error.trim() !== '' || amount.trim() === '') return
    // Handle sending logic here
    setShowUserComponent(true)
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View className="p-4 flex-1">
        {
          showUserList ? <SearchUsertoSend amount={amount} goback={() => setShowUserComponent(false)} /> : <>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={25} />
              </TouchableOpacity>
            </View>
            <View style={{ paddingTop: 50, flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{t("Send NileToken from wallet to Friend")}</Text>
              <Text style={{ marginTop: 10 }}>
                {t("No hidden fees or direct charges - it's all free!")}
              </Text>
              <View style={styles.inputContainer}>
                <Text style={styles.prefix}>$</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Token to send"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={handleAmountChange}
                  className="border-b-2 border-blue-400 focus:border-sky-400 text-2xl font-bold"
                  onSubmitEditing={handleSend}
                />
              </View>
              {error ? <Text style={{ color: 'red', marginTop: 5 }}>{error}</Text> : null}
            </View>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ justifyContent: 'flex-end' }}
              className="flex-row p-4"
            >
              <View></View>
              <TouchableOpacity
                onPress={handleSend}
                style={{
                  backgroundColor: error.trim() !== '' || amount.trim() === '' ? 'rgb(220,220,220)' : 'blue',
                  width: 50, // Adjust the width as needed
                  height: 50, // Adjust the height as needed
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 5,
                }}
              >
                <MaterialIcons name="send" size={25} />
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </>
        }
      </View>

      <View className="bg-blue-400 w-screen h-3"></View>
      <View className="bg-[#013766] w-screen h-2"></View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  prefix: {
    fontSize: 18,
    marginRight: 5,
  },
  input: {
    flex: 1,
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
  },
});

export default SendMoney;
