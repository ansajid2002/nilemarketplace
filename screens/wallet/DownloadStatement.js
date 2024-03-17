import React, { useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, TextInput, TouchableOpacity, Modal, Button, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { AdminUrl, HeaderBar } from '../../constant';
import { RadioButton } from 'react-native-paper';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector } from 'react-redux';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

const DownloadStatement = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('last1Month');
  // const [customDate, setCustomDate] = useState(new Date());
  const { customerData } = useSelector((store) => store.userData)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState(customerData?.[0]?.email);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [selectedDateText, setSelectedDateText] = useState('');
  const {t} = useTranslation()

  const handleRadioPress = (value) => {
    setSelectedDateText('')
    setSelectedPeriod(value);
    if (value === 'custom') {
      setShowDatePicker(true);
    }
  };

  const handleFromDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const handleToDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setToDate(selectedDate);
    }
  };

  const applyCustomDates = () => {
    setShowCustomModal(false);
    const fromDateString = fromDate.toLocaleDateString();
    const toDateString = toDate.toLocaleDateString();
    setSelectedDateText(`Selected Dates: ${fromDateString} to ${toDateString}`);
  };

  const renderCustomDateModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCustomModal}
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }} className="leading-6">
            <Text className="mt-2">{t("From Date:")}</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} className="mt-2 p-2">
              <Text>{fromDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {/* {showDatePicker && (
              <DateTimePicker
                value={fromDate}
                mode="date"
                display="default"
                onChange={handleFromDateChange}
              />
            )} */}

            <Text className="mt-2">{t("To Date:")}</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} className="mt-2 p-2">
              <Text>{toDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {/* {showDatePicker && (
              <DateTimePicker
                value={toDate}
                mode="date"
                display="default"
                onChange={handleToDateChange}
              />
            )} */}

            <Button title="Apply" onPress={applyCustomDates} />
          </View>
        </View>
      </Modal>
    );
  };

  const handleSubmission = async () => {
    try {
      // Validate data before submitting
      if (!email) {
        alert('Email is a mandatory field.');
        return;
      }

      if (selectedPeriod === 'custom' && (!fromDate || !toDate)) {
        alert('From Date and To Date are mandatory for Custom Period.');
        return;
      }

      // Assuming you have a backend endpoint to handle the request
      const backendEndpoint = `${AdminUrl}/api/requestWalletStatement`;

      // Prepare data to send to the backend
      const requestData = {
        selectedPeriod,
        customerData,
        email,
        selectedDates: selectedPeriod === 'custom' ? `${fromDate.toLocaleDateString()} to ${toDate.toLocaleDateString()}` : selectedDateText,
        fromDate,
        toDate
      };

      alert("You will receive an email with your statement for the requested period. If you do not receive an email, it means you don't have any records for the specified period.");

      await fetch(backendEndpoint, {
        method: 'POST', // You can change the HTTP method based on your backend requirements
        headers: {
          'Content-Type': 'application/json',
          // You may need to add other headers based on your backend requirements
        },
        body: JSON.stringify(requestData),
      });



    } catch (error) {
      // Handle errors (e.g., network errors, backend errors)
      console.error('Error submitting data to the backend:', error.message);
      // You can display an error message to the user or handle the error as needed
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <HeaderBar title={'Request Wallet Statement'} navigation={navigation} goback={true} size={18} searchEnable={false} cartEnable={false} />

      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={{ margin: 20 }}>
            <Text>{t("Email to received statement:")}</Text>
            <TextInput
              placeholder="Enter your email address"
              className="p-4 border border-gray-400 rounded-md mt-2"
              value={email}
              onChangeText={(text) => setEmail(text)}
            />

            <Text style={{ marginTop: 20 }}>{t("Select Time Period:")}</Text>

            <RadioButton.Group onValueChange={(value) => handleRadioPress(value)} value={selectedPeriod}>
              <View>
                <RadioButton.Item label="Last 1 Month" value="last1Month" />
                <RadioButton.Item label="Last 3 Months" value="last3Months" />
                <RadioButton.Item label="Last 6 Months" value="last6Months" />
                <RadioButton.Item label="Last 1 Year" value="last1Year" />
                <RadioButton.Item label="Custom Duration" value="custom" />
              </View>
            </RadioButton.Group>

            {selectedPeriod === 'custom' && (
              <>
                <TouchableOpacity
                  onPress={() => setShowCustomModal(true)}
                  className="p-4 flex-row justify-center "
                >
                  <Text className="text-blue-500" >{t("Choose Duration")}</Text>
                </TouchableOpacity>
                {renderCustomDateModal()}
              </>
            )}



            {selectedDateText !== '' && (
              <Text style={{ marginTop: 10, color: 'green', fontWeight: 'bold' }}>{selectedDateText}</Text>
            )}

            <TouchableOpacity
              className="bg-blue-400 p-4 rounded-md text-center mt-4 flex-row justify-center"
              onPress={handleSubmission}
            >
              <Text style={{ color: 'white' }} className="text-xl font-semibold tracking-wider">{t("Confirm")}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <View className="bg-blue-400 w-screen h-3"></View>
        <View className="bg-[#013766] w-screen h-2"></View>
      </View>
    </SafeAreaView>
  );
};

export default DownloadStatement;
