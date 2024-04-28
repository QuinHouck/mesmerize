import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView } from 'react-native';

import PackageService from '../services/package.service';

import DownloadIcon from '../icons/Download.svg';

const StoreScreen = () => {

    const [available, setAvailable] = useState([]);
    const [selected, setSelected] = useState("");

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
            // console.log(response.data);

            const packageItems = {
                title: p.title,
                name: p.name,
                items: response.data
            }

            // console.log(packageItems);
            await AsyncStorage.setItem(packageItems.name, JSON.stringify(packageItems));
            console.log("Success!")
            
        } catch(error) {
            console.log("Error: ", error);
            // console.log("Res: ", error.response);
        }
    }

    return (
        <SafeAreaView style={styles.main_container}>
            <View style={styles.top_container}>
                <TouchableOpacity style={styles.title_button} onPress={() => navigation.goBack()}>
                    <Text style={styles.title_button_text}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title_text}>Store</Text>
                <View style={styles.title_button}>

                </View>
            </View>
            <ScrollView style={styles.scroll_container}>
                <View style={styles.package_options_container}>
                   {available.map((p) => {
                        if(selected !== p.name){
                            return (
                                <TouchableOpacity key={p.name} style={styles.package_option} onPress={() => setSelected(p.name)}>
                                    <Text style={styles.package_title_text}>{p.title}</Text>
                                </TouchableOpacity> 
                            ); 
                        } else {
                            return (
                                <TouchableOpacity key={p.name} style={styles.package_option_selected} onPress={() => setSelected("")}>
                                    <Text style={styles.package_title_selected_text}>{p.title}</Text>
                                    <TouchableOpacity onPress={() => downloadPackage(p)}>
                                        <DownloadIcon style={styles.icon}/>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ); 
                        }
                        
                    })} 
                </View>
            </ScrollView>
        </SafeAreaView>
    );

}

export default StoreScreen;

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "#222222",
    },

    top_container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingVertical: 10,
        backgroundColor: "#745e96",
    },

    title_text: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
    },

    title_button: {
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },

    title_button_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '400',
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 3,
        paddingHorizontal: 5,
    },

    scroll_container: {
        // backgroundColor: 'purple',
    },

    package_options_container: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        // backgroundColor: 'purple',
        padding: 20,
    },

    package_option: {
        width: '80%',
        height: '30px',
        backgroundColor: "#745e96",
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 5,
    },

    package_title_text: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
    },

    package_option_selected: {
        flexDirection: 'row',
        width: '80%',
        height: '30px',
        backgroundColor: "white",
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 5,
    }, 

    package_title_selected_text: {
        color: '#222222',
        fontSize: 20,
        fontWeight: '700',
    },

    icon: {
        height: '100%',
        aspectRatio: 1,
        color: '#222222',
    },

});