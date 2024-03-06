import { View, Text, Modal, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import FilterTab from './FilterTab';
import { useTranslation } from 'react-i18next';

const FilterComponent = ({ getSort, subcategoriesToShow, selectedTab }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSortOption, setSelectedSortOption] = useState('');
    const [isModalVisible, setisModalVisible] = useState(false);
    const {t} = useTranslation()

    const openSortModal = () => {
        setModalVisible(true);
    };

    const closeSortModal = () => {
        setModalVisible(false);
    };

    const handleSortOptionClick = (option) => {
        closeSortModal();

        setSelectedSortOption(option);
        getSort(option)
        // Add your logic here to handle the selected sort option
        // For now, let's just close the modal
    };

    const toggleModal = () => {
        setisModalVisible(!isModalVisible);
    };

    const handleCAT = (selected) => {

        selectedTab(selected)
        setisModalVisible(false)
    }

    return (
        <View style={styles.container} className="shadow-xl border-t border-gray-200">
            <View className="flex-row justify-between w-full px-4 py-2">
                <TouchableOpacity onPress={openSortModal}>
                    <View className="flex-row  justify-end w-1/2">
                        <Text className="text-right">{t("Sort By")}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleModal}>
                    <View className="flex-row  justify-end w-1/2">
                        <Text className="text-right">{t("Filter")}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Sort Modal */}
            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={closeSortModal}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.header} className="p-4">
                            <Text style={styles.headerText}>{t("Sort By")}</Text>
                            <TouchableOpacity onPress={closeSortModal}>
                                <Text style={styles.closeText}>{t("Close")}</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => handleSortOptionClick('Relevance')}>
                            <Text style={[styles.sortOption, selectedSortOption === 'Relevance' && styles.selectedSortOption]}>{t("Relevance")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleSortOptionClick('Most Recent')}>
                            <Text style={[styles.sortOption, selectedSortOption === 'Most Recent' && styles.selectedSortOption]}>{t("Most Recent")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleSortOptionClick('Price Low to High')}>
                            <Text style={[styles.sortOption, selectedSortOption === 'Price Low to High' && styles.selectedSortOption]}>{t("Price Low to High")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleSortOptionClick('Price High to Low')}>
                            <Text style={[styles.sortOption, selectedSortOption === 'Price High to Low' && styles.selectedSortOption]}>{t("Price High to Low")}</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={toggleModal}
            >
                {/* Content of your modal */}
                {/* Add your modal content here */}
                <FilterTab closeModal={toggleModal} subcategoriesToShow={subcategoriesToShow} selectedFunc={handleCAT} />


            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    button: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 5,
        width: '100%', // Adjust the width as needed
        height: '50%',
        position: 'absolute',
        bottom: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeText: {
        color: 'blue',
    },
    sortOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    selectedSortOption: {
        color: 'blue', // Example background color for selected option
        fontWeight: 'bold',
        // textDecorationLine: 'underline'
    },
});

export default FilterComponent;
