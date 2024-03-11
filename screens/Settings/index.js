import React from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { HeaderBar } from '../../constant';
import { t } from 'i18next';
import { Entypo } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

const Settings = ({ navigation }) => {
    const { customerData } = useSelector((store) => store.userData);

    // Define an array of setting items
    const settings = [
        { title: "Update Nile Pin", icon: "chevron-small-right", route: "UpdateNilePin" },
        { title: "Delete My Account", icon: "chevron-small-right", route: "DeleteMyAccount" },
        // Add more setting items as needed
    ];

    // Filter out "Update Nile Pin" setting if customerData is undefined or empty
    // const filteredSettings = customerData && customerData?.length > 0 ? settings : settings.filter(setting => setting.title !== "Update Nile Pin");
    const filteredSettings = customerData && customerData?.length > 0 && settings  ;

    // Function to handle navigation to the specified route
    const handleNavigation = (route) => {
        navigation.navigate(route);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
            <HeaderBar title={t("Settings")} goback={true} searchEnable={false} cartEnable={false} navigation={navigation} />

            <View style={{ backgroundColor: '#fff', flex: 1, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                {/* Map over the filteredSettings array to render each setting item */}


            {
                filteredSettings ? 


                
                <View>
                {filteredSettings?.map((setting, index) => (
                    <TouchableOpacity key={index} onPress={() => handleNavigation(setting.route)}>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#374151' }}>{setting.title}</Text>
                            <Entypo name={setting.icon} size={24} color="black" />
                        </View>
                    </TouchableOpacity>
                ))}
                                    </View>

                 :
                <View className="flex items-center justify-center my-auto ">
                    <Text className="text-2xl text-gray-400 " >No data to show!</Text>
                    <Text className="text-xl text-gray-400 " >Login to access more features</Text>

                    </View>

}
            </View>
        </SafeAreaView>
    );
};

export default Settings;
