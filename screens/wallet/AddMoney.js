import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, KeyboardAvoidingView, Alert, Linking, Platform } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { formatCurrency } from './Wallet';
import { useSelector } from 'react-redux';
import { AdminUrl, HeaderBar } from '../../constant';
import { TextInput } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { t } from 'i18next';

const AddMoney = ({ navigation }) => {

  const { customerData } = useSelector((store) => store.userData)
  const customerId = customerData[0]?.customer_id
  const { walletTotal } = useSelector((store) => store.wallet)

  const [amount, setAmount] = useState('');
  const [edahabNumber, setEdhabNumber] = useState('');
  const [loadingButton, setLoadingButton] = useState(false)
  const navigationOptions = [
    { label: 'Send Money To Friend', screen: 'SendMoney', icon: 'arrowright' },
    { label: 'View Transaction History', screen: 'TransactionHistory', icon: 'barschart' },
    { label: 'Request Wallet Statement', screen: 'DownloadStatement', icon: 'download' },
  ];

  const [selectedOption, setSelectedOption] = useState('eDahab');

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleAmountChange = (text) => {
    setAmount(text);
  };
  const handleedahabNumberChange = (number) => {
    setEdhabNumber(number);
  };

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
  };

  const handleAddMoney = async () => {
    if (selectedOption === 'EVC') {
      await addMoneyFromEVC()
    }

    else if (selectedOption === 'eDahab') {
      setLoadingButton(true)

      if (edahabNumber.trim() === '') {
        Alert.alert("Error", 'Please enter your eDahab Number');
        return;
      }

      try {
        // Call your API to add money and get the payment link
        const response = await fetch(`${AdminUrl}/api/issue-invoice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: parseFloat(amount), customerId, edahabNumber, returnUrl: 'https://www.nilegmp.com' }),
        });

        const data = await response.json();

        if (response.ok) {
          // Check StatusCode and show a simple alert or validation errors
          if (data.StatusCode === 0) {
            // Show a simple alert with a link to pay
            Alert.alert(
              'Invoice Issued Successfully!',
              'Please proceed to pay the amount.\n\nInstructions:\n1. Click "Pay Now" and pull to refresh the page to see the updated balance.\n2. After clicking "Pay Now," you will be redirected to the official eDahab payment link to complete the payment.\n3. After successfully paying and redirecting to the thank you page, come back to the application to check the payment status.',
              [
                { text: 'Later', style: 'cancel' },
                {
                  text: 'Pay Now',
                  onPress: async () => {
                    // Redirect the user to the payment link
                    await Linking.openURL(`https://edahab.net/API/Payment?invoiceId=${data.InvoiceId}`);

                    // Navigate back to the previous screen
                    navigation.goBack();
                  },
                },
              ],
              { cancelable: false }
            );
          } else {
            // Show validation errors in an alert
            const validationErrors = data.ValidationErrors.map(error => error.ErrorMessage).join('\n');
            Alert.alert('Validation Error', validationErrors);
          }
        } else {
          // Show a simple alert with an error message
          Alert.alert('Error', 'Failed to issue invoice. Please try again later.');
        }
      } catch (error) {
        // Handle errors
        console.error('Error adding money:', error);

        // Show a simple alert with an error message
        Alert.alert('Error', 'An error occurred. Please try again later.');
      } finally {
        setLoadingButton(false)
      }
    }

  };

  const addMoneyFromEVC = async () => {
    setLoadingButton(true)
    try {

      // Check if edahabNumber is a number and has exactly 9 digits
      const isValidEdahabNumber = /^\d{9}$/.test(edahabNumber);

      if (!isValidEdahabNumber) {
        Alert.alert("Error", "Please enter a 9-digit number for Evc.");
      }

      const response = await fetch(`${AdminUrl}/api/doEvcTransactiontoWallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(amount), customerId, evcNumber: edahabNumber }),
      });

      const data = await response.json();

      if (data?.success) {
        Alert.alert(
          'Transaction Successful',
          'Your transaction was successful.',
        )
        navigation.goBack();

      } else {
        Alert.alert(
          'Transaction Failed',
          'Your transaction failed.',
        )
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoadingButton(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'white' }}
      className="transition-all duration-75 ease-in-out"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <HeaderBar navigation={navigation} title={""} goback={true} searchEnable={false} cartEnable={false} />
        <View className="px-4">

        <Text className="text-center text-2xl font-medium mt-6 mb-4">Welcome back!</Text>
        <Text className="text-lg text-gray-700 text-center">To recharge your wallet, please visit <Text className="font-semibold text-[#00008b]">Nilegmp.com</Text>, Once your wallet is recharged, you can use the balance to purchase products, send Nile Tokens to your friends, and enjoy various services offered by the app.  </Text>
        <Text className="text-base text-gray-500 text-center mt-4">
          
If you are using your Apple ID to log in, ensure that your Apple ID is associated with a Gmail account to enable purchases.
        </Text>
        </View>

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default AddMoney;


// return (
//   <KeyboardAvoidingView
//     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//     style={{ flex: 1, backgroundColor: 'white' }}
//     className="transition-all duration-75 ease-in-out"
//   >
//     <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
//       <StatusBar barStyle="dark-content" backgroundColor="white" />
//       <View style={{ flex: 1, position: 'relative' }}>
//         <View style={{ height: '25%', backgroundColor: '#02BAEE', alignItems: 'center', justifyContent: 'center' }}>
//         </View>
//         <TouchableOpacity
//           style={{
//             position: 'absolute',
//             top: 20,
//             left: 20,
//             zIndex: 1,
//           }}
//           onPress={() => navigation.goBack()}
//         >
//           <AntDesign name="arrowleft" size={24} color="white" />
//         </TouchableOpacity>
//         <View style={{
//           position: 'absolute',
//           top: 100,
//           left: 0,
//           right: 0,
//           backgroundColor: 'white',
//           padding: 20,
//           margin: 10,
//           borderRadius: 10,
//           shadowColor: 'gray',
//           elevation: 5
//         }}


//         >
//           {/* Content for the absolute positioned View */}
//           <View className="flex-row justify-between">
//             <Text className="text-xl font-bold">{t("NGMP Token")}</Text>
//             <Ionicons name="wallet-outline" size={24} color={'blue'} />
//           </View>
//           <Text className="mt-2 text-xl tracking-wide font-semibold">{formatCurrency(parseFloat(walletTotal))}</Text>
//           <View className="flex-row space-x-5 py-2 justify-center mt-5 ">
//             {
//               navigationOptions.map((item, index) => (
//                 <TouchableOpacity key={index} onPress={() => navigation.navigate(item.screen)}>
//                   <View key={index} style={{ alignItems: 'center', marginBottom: 10, width: 100 }}>
//                     <View className="bg-blue-100 p-2 rounded-full">
//                       <AntDesign name={item.icon} size={24} color="#496197" />
//                     </View>
//                     <Text style={{ textAlign: 'center', flexWrap: 'wrap', fontSize: 12 }} className="text-gray-600 mt-2 font-semibold ">{t(`${item.label}`)}</Text>
//                   </View>
//                 </TouchableOpacity>
//               ))
//             }
//           </View>
//         </View>

//         <View style={{
//           backgroundColor: 'white',
//           padding: 20,
//           margin: 10,
//           borderRadius: 10,
//           shadowColor: 'gray',
//           elevation: 7,
//           position: 'relative',
//           top: 150
//         }}>
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
//             <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{t("Add Money to Wallet")}</Text>
//           </View>

//           <View>
//             {/* Options for selecting EVC or eDahab */}
//             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>

//               <TouchableOpacity
//                 style={{
//                   borderWidth: 1,
//                   borderColor: selectedOption === 'eDahab' ? 'blue' : '#ccc',
//                   borderRadius: 5,
//                   padding: 10,
//                   width: '48%',
//                   alignItems: 'center',
//                 }}
//                 onPress={() => handleOptionSelect('eDahab')}
//               >
//                 <Text style={{ color: selectedOption === 'eDahab' ? 'blue' : 'black' }}>eDahab</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={{
//                   borderWidth: 1,
//                   borderColor: selectedOption === 'EVC' ? 'blue' : '#ccc',
//                   borderRadius: 5,
//                   padding: 10,
//                   width: '48%',
//                   alignItems: 'center',
//                 }}
//                 onPress={() => handleOptionSelect('EVC')}
//               >
//                 <Text style={{ color: selectedOption === 'EVC' ? 'blue' : 'black' }}>EVC</Text>
//               </TouchableOpacity>

//             </View>
//           </View>

//           {/* Input for entering custom amount */}
//           <TextInput
//             style={{
//               borderWidth: 1,
//               borderColor: '#ccc',
//               borderRadius: 5,
//               padding: 10,
//               marginTop: 10,
//             }}
//             placeholder={selectedOption === 'EVC' ? "Enter 9 digit EVC Number" : "Enter 9 digit eDahab Number"}
//             keyboardType="numeric"
//             value={edahabNumber}
//             onChangeText={handleedahabNumberChange}
//           />

//           <TextInput
//             style={{
//               borderWidth: 1,
//               borderColor: '#ccc',
//               borderRadius: 5,
//               padding: 10,
//               marginTop: 10,
//             }}
//             placeholder="Enter amount"
//             keyboardType="numeric"
//             value={amount}
//             onChangeText={handleAmountChange}
//           />

//           {/* Options for predefined amounts */}
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
//             {[100, 500, 1000, 5000].map((option, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={{
//                   borderWidth: 1,
//                   borderColor: '#ccc',
//                   borderRadius: 5,
//                   padding: 10,
//                   width: '24%',
//                   alignItems: 'center',
//                 }}
//                 onPress={() => handleAmountSelect(option)}
//               >
//                 <Text>{`${formatCurrency(option).endsWith('.00') ? formatCurrency(option).slice(0, -3) : formatCurrency(option)}`}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {/* Button to add money */}
//           <TouchableOpacity
//             style={{
//               backgroundColor: '#013766',
//               borderRadius: 5,
//               padding: 15,
//               marginTop: 20,
//               alignItems: 'center',
//             }}
//             onPress={!loadingButton && handleAddMoney}
//           >
//             {
//               loadingButton ? <ActivityIndicator color={'white'} /> : <Text style={{ color: 'white', fontSize: 16 }}>{t("Add Money")}</Text>

//             }
//           </TouchableOpacity>
//         </View>
//       </View>

//     </SafeAreaView>
//   </KeyboardAvoidingView>
// );