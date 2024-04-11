import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/core';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';

import PackageService from '../services/package.service';

const StoreScreen = () => {

    const navigation = useNavigation();

    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        getAvailablePackages()
    }, []);

    async function getAvailablePackages(){
        try {
            const response = await PackageService.get();
            console.log(response.data);
        } catch(error) {
            console.log(error);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.topTitle}>Store</Text>
            </View>
            <View style={styles.packageOptions}>

            </View>
        </SafeAreaView>
    );

}

export default StoreScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "#222222",
    },
});