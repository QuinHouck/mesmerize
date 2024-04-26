import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/core';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView } from 'react-native';

import PackageService from '../services/package.service';

const StoreScreen = () => {

    const [available, setAvailable] = useState([]);
    const navigation = useNavigation();

    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        getAvailablePackages()
    }, []);

    async function getAvailablePackages(){
        try {
            const response = await PackageService.getAvailable();
            // console.log(response.data);
            setAvailable(response.data);
        } catch(error) {
            console.log("Error: ", error);
            // console.log("Res: ", error.response);
        }
    }

    async function downloadPackage(p){
        try {
            const response = await PackageService.getPackage(p.name);
            console.log(response.data);
            
        } catch(error) {
            console.log("Error: ", error);
            // console.log("Res: ", error.response);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.topTitle}>Store</Text>
            </View>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.packageOptions}>
                   {available.map((p) => {
                        return (
                            <TouchableOpacity style={styles.packageOption} onPress={() => downloadPackage(p)}>
                                <Text style={styles.packageTitle}>{p.title}</Text>
                            </TouchableOpacity> 
                        );
                    })} 
                </View>
            </ScrollView>
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

    topBar: {
        flexDirection: 'row',
        justifyContent: 'center'
    },

    topTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
    },

    scrollContainer: {
        backgroundColor: 'purple',
    },

    packageOptions: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        backgroundColor: 'purple',
        padding: 20,
    },

    packageOption: {
        width: '80%',
        height: '30px',
        backgroundColor: 'green',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 5,
    },

    packageTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
    },

});