import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native'
import { HeaderBar } from '../../constant'
import { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Button } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetModalProvider,
    BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { Colors } from '../../constants/styles';
import { TextInput } from 'react-native';
// import logo from "../../assets/images/icon-delete.png.png"
import logo from "../../assets/images/icon-delete.png"
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { debounce } from 'lodash';
import { useSelector } from 'react-redux';
import { AdminUrl } from "../../constant";
import * as Google from "expo-auth-session/providers/google"
import * as AppleAuthentication from 'expo-apple-authentication';
import { AppleButton } from '@invertase/react-native-apple-authentication';
import auth from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';






const Deletemyaccount = ({ navigation }) => {


    const [request, response, promptAsync] = Google.useAuthRequest({  //nilemarketplace7@gmail.com
        androidClientId: "216641462687-7mv9inako2l7n3rmp5gq72qu8lquvnn0.apps.googleusercontent.com",
        iosClientId: "216641462687-0vgml3eh21399khfqk6avahgmis7sgo2.apps.googleusercontent.com",
        expoClientId: "216641462687-a2ut20irksvqdes9n9gfgs21p8hp1kq4.apps.googleusercontent.com"
    })
    useEffect(() => {
        if (response) {
            handleSignInWithGoogle();
        }
    }, [response]);

    const deleteAccountReasons = [
        "No longer using the platform",
        "Dissatisfied with the service",
        "Found alternative marketplace",
        "Privacy concerns",
        "Too many unwanted notifications",
        "Account compromised",
        "Moving to a different region/country",
        "Unsatisfactory customer support",
        "Platform policies not favorable",
        "Account consolidation"
    ];
    const { customerData } = useSelector((store) => store.userData)
    const [selectedReason, setSelectedReason] = useState("");
    const [containerStyles, setContainerStyles] = useState(styles.container);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [identityConfirmed,setIdentityConfirmed] = useState(false)


    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleReasonSelection = (reason) => {
        setSelectedReason(reason);
    };

    const bottomSheetModalRef = useRef(null);

    // variables
    const snapPoints = useMemo(() => ['30%', '80%'], []);

    // callbacks
    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);


    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={1} appearsOnIndex={2} />
        ),
        []
    );

    const handleSheetChanges = useCallback((index) => {
        // You can conditionally change container styles based on the index
        // For example, set backgroundColor to 'transparent' when closed (index 1)
        if (index <= 0) {
            setContainerStyles({
            });
        } else {
            setContainerStyles(styles.container);
        }
    }, []);

    // state to dynamically set container styles

    async function handleSignInWithGoogle() {
        console.log(response,"response from google");
        if (response?.type === "success") {
            initaiteDeleterequest()
            // const accessToken = response.authentication.accessToken;

            // Send the access token to the backend
            // await sendAccessTokenToBackend(accessToken);
        }
        else {
            Alert.alert("Error", "Failed to verify your account");
        }
    }

   


    const verifyemail = async() => {
        
        try {
            
            const requestBody = {
                email: customerData[0].email,
                password: password,
            };

            // Send a POST request to the server
            console.log(`${AdminUrl}/api/verifyEmail`);
            const response = await fetch(`${AdminUrl}/api/customerLoginEmail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();
                console.log(data,"from email login");
                if (data.status === 200) {
                    initaiteDeleterequest()
                }
                else if (data.status === 401) {
                    Alert.alert("Error", data.message);
                }

            
        } catch (error) {
            console.error('Login failed', error);
            // Handle the error, e.g., show an error message to the user
        } finally {
            setLoading(false); // Remove the activity indicator when the request is complete
        }
    
    }

    ////////new apple sign in ///////////////////////////////

function AppleSignIn() {
    return (
      <AppleButton
        buttonStyle={AppleButton.Style.BLACK}
        buttonType={AppleButton.Type.SIGN_IN}
        style={{
        
          width: '100%',
          height: 45,
        }}
        onPress={() => revokeSignInWithAppleToken().then(() => console.log('Apple sign-in complete!'))}
      />
    );
  }

//   async function onAppleButtonPress() {
//     // Start the sign-in request
//     const appleAuthRequestResponse = await appleAuth.performRequest({
//       requestedOperation: appleAuth.Operation.LOGIN,
//       // As per the FAQ of react-native-apple-authentication, the name should come first in the following array.
//       // See: https://github.com/invertase/react-native-apple-authentication#faqs
//       requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
//     });
//     // Ensure Apple returned a user identityToken
//     if (!appleAuthRequestResponse.identityToken) {
//       throw new Error('Apple Sign-In failed - no identify token returned');
//     }
  
//     // Create a Firebase credential from the response
//     const { identityToken, nonce } = appleAuthRequestResponse;
//     const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
//   if (appleCredential) {
//                 // sendAccessTokenToBackendApple(appleAuthRequestResponse,appleCredential)
//                 initaiteDeleterequest()
//             }
//             else {
//                 Alert.alert("Error Validating Identity")
//             }
//     // Sign the user in with the credential
//     return auth().signInWithCredential(appleCredential);
//   }

////////new apple sign in ///////////////////////////////


async function revokeSignInWithAppleToken() {
    try {
      // Get an authorizationCode from Apple
      const { authorizationCode } = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.REFRESH,
      });
  
      // Ensure Apple returned an authorizationCode
      if (!authorizationCode) {
        throw new Error('Apple Revocation failed - no authorizationCode returned');
      }
  
      // Revoke the token
      await sendDeleteRequestToBackend();
  
      return auth().revokeToken(authorizationCode);
    } catch (error) {
      console.error('Error revoking token:', error);
      throw error;
    }
  }
  
  async function sendDeleteRequestToBackend() {
    try {
      const response = await fetch(`${AdminUrl}/api/sendDeleteRequestToBackend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerData[0].customer_id,
          reason: selectedReason
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      // Show confirmation alert after successful request
      Alert.alert(
        'Account Deletion Request Submitted',
        'Your account deletion request has been submitted successfully. It will take up to 3-4 business days to process your request. All information related to your account, including your location, images, and email, will be permanently deleted.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.replace('Login');
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error sending delete request to backend:', error);
      throw error;
    }
  }
  
  const initaiteDeleterequest = () => {
    Alert.alert(
      'Confirm Account Deletion',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            await sendDeleteRequestToBackend();
          },
        },
      ],
      { cancelable: false }
    );
  }
  


    return (
        <SafeAreaView>
            <HeaderBar navigation={navigation} goback={true} title="" cartEnable={false} searchEnable={false} />

            <ScrollView className="p-2 mb-10 ">
                <Text className="text-2xl m-2 font-bold text-[#00008b]">Deleting Your Nile Global Marketplace Account</Text>
                <Text className="text-lg m-2">We're sorry to see you go. We'd like to know why you're deleting your account as we may be able to help with common issues</Text>
                <View className="bg-white m-2 p-2 rounded-lg space-y-2.5">
                    {
                        deleteAccountReasons?.map((reason, index) => (
                            <TouchableOpacity key={index} onPress={() => handleReasonSelection(reason)} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#000', marginRight: 10, justifyContent: 'center', alignItems: 'center' }}>
                                    {selectedReason === reason && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#000' }} />}
                                </View>
                                <Text className="text-base">{reason}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </View>
                <View className="space-y-3 m-2 mb-10">
                    <TouchableOpacity onPress={() => {
                        selectedReason && handlePresentModalPress()
                    }
                    } className={`${selectedReason ? "bg-blue-500" : "bg-blue-200"}  rounded-full py-3 `}><Text className="text-center text-xl text-white font-semibold">Continue</Text></TouchableOpacity>
                    {/* <TouchableOpacity className="bg-white rounded-full py-3 "><Text className="text-center text-xl  font-semibold">Cancel</Text></TouchableOpacity> */}
                </View>
            </ScrollView>
            <BottomSheetModalProvider>
                <View  >
                   
                    <BottomSheetModal
                        ref={bottomSheetModalRef}
                        index={1}
                        backdropComponent={renderBackdrop}
                        snapPoints={snapPoints}
                        onChange={handleSheetChanges}
                    >

                        <BottomSheetView style={{ margin: 16 }}>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            >

                                <Image
                                    source={require('../../assets/images/icon-delete.png')}
                                    className="w-40 h-40 mx-auto -mt-8"
                                />
                                <Text style={{ fontSize: 18, fontWeight: 'bold' }} className="my-4">For your security, please authenticate your identity to continue</Text>


                        <View>
                            {
                                customerData[0]?.password  &&
                                <View>
                                    <View style={{ marginBottom: 12 }}>
                                    <View style={{ marginBottom: 8 }}>
                                        <TextInput
                                            placeholder='Enter your Password'
                                            placeholderTextColor='black'
                                            secureTextEntry={!showPassword}
                                            value={password}
                                            onChangeText={(text) => setPassword(text)}
                                            style={{
                                                height: 48,
                                                borderColor: 'black',
                                                borderWidth: 1,
                                                borderRadius: 8,
                                                paddingLeft: 12
                                            }}
                                        />
                                    </View>
                                    <TouchableOpacity className="mb-2" onPress={toggleShowPassword}>
                                        <Text className="text-right" style={{ color: 'blue' }}>{showPassword ? 'Hide' : 'Show'} Password</Text>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity onPress={() => {
                                    password?.length > 4 &&
                                        verifyemail()
                                }
                                } className={` ${password?.length > 4 ? "bg-blue-500" : " bg-blue-200"}   rounded-full py-2`}><Text className="text-center text-xl text-white font-semibold">Continue</Text></TouchableOpacity>
                                                            <Text className="text-center italic text-lg mt-4 mb-2 text-gray-400">Or continue with</Text>

                                    </View>
                                    
                            }
                        </View>




                                
                            </KeyboardAvoidingView>
                            {/* //-------------------------------------------------------------// */}

                            {
                                customerData[0]?.google_id &&
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'center'
                            }} className="space-x-1" >
                                <TouchableOpacity
                                    onPress={debounce(() => promptAsync(), 500)}
                                    style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'row',
                                        height: 40,
                                        borderWidth: 1,
                                        borderColor: "rgb(180,180,180)",
                                        marginRight: 4,
                                        // borderRadius: 10
                                    }}
                                    className="rounded-xl"
                                >
                                    <Image
                                        source={require("../../assets/google.png")}
                                        style={{
                                            height: 20,
                                            width: 20,
                                            marginRight: 8
                                        }}
                                        resizeMode='contain'
                                    />

                                    <Text className="text-base font-medium">Google</Text>
                                </TouchableOpacity>
                                </View>
                            }


                                {/* ---------------------------------------------------------------------------------------------------------------------------- */}
                                {
                        Platform.OS === "ios" && customerData[0]?.apple_id  &&
                    <View className="mt-4  rounded-full">
                                {AppleSignIn()}
                            </View>
}
                                {/* ---------------------------------------------------------------------------------------------------------------------------- */}


                         

                        </BottomSheetView>
                    </BottomSheetModal>

                   
                </View>
            </BottomSheetModalProvider>
           

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: 'red',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
    },
});

export default Deletemyaccount