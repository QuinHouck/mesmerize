import React, { useState, useEffect } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';

import StoreIcon from '../icons/Store.svg';
import DotsIcon from '../icons/Dots.svg';

const HomeScreen = () => {

    const navigation = useNavigation();

    const [isLoading, setLoading] = useState(true);

    useEffect(() => {

    }, []);

    async function getPackageInfo(){
        try {
            const saved_info = await AsyncStorage.getItem("countries");
            const info = JSON.parse(saved_info);
            console.log("Info: ", info);
        } catch (e){
            console.log(e.message);
            console.log("Could not find package");
        }
        
    }

    return (
        <SafeAreaView style={styles.main_container}>
            <View style={styles.title_container}>
                <Text style={styles.title_text}>Mesmerize</Text>
            </View>
            <View style={styles.options_container}>
                <TouchableOpacity style={styles.option}>
                    <Text style={styles.options_text}>Multiple Choice</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("QuizOption")}>
                    <Text style={styles.options_text}>Write Quiz</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("TestOption")}>
                    <Text style={styles.options_text}>Write Test</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.bottom_container}>
                <TouchableOpacity style={styles.icon_container} onPress={() => navigation.navigate("Store")}>
                    <StoreIcon style={styles.icon}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon_container}>
                    <DotsIcon style={styles.icon}/>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

}

export default HomeScreen;

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "#222222",
    },

    title_container: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center'
    },

    title_text: {
        color: 'white',
        fontSize: 50,
    },

    options_container: {
        flex: 6,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
    },

    option: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        width: '50%',
        backgroundColor: "#745e96",
        borderRadius: 5,
    },

    options_text: {
        fontSize: 20,
        color: 'white',
    },

    bottom_container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
    },

    icon_container: {
        height: '60%',
        aspectRatio: 1,
        backgroundColor: "#745e96",
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },

    icon: {
        height: '80%',
        aspectRatio: 1,
        color: 'white',
    }


});