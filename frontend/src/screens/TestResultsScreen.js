import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/core';
import { Keyboard, Platform, StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, TextInput, KeyboardAvoidingView } from 'react-native';
import Modal from "react-native-modal";

import colors from '../util/colors';
import { useTest, useUser } from '../hooks/useRedux';
import { resetTest, quickRestart } from '../store/slices/testSlice';

const TestResultsScreen = () => {
    // Redux hooks
    const test = useTest();
    const user = useUser();
    const navigation = useNavigation();


    async function handlePlay(){
        // Reset game state for a new game
        test.dispatch(quickRestart());
        navigation.navigate("TestGame");
    }

    async function handleMenu(){
        // Reset game state when going back to menu
        test.dispatch(resetTest());
        
        // Reset navigation stack to remove QuizGame and QuizResults from history
        navigation.reset({
            index: 0,
            routes: [{ name: "Home" }, { name: "TestOption" }],
        });
    }

    async function handleImage(image){
        setImage(image);
        setModal(true);
    }

    async function handleClose(){
        setImage(null);
        setModal(false);
    }


    return (
        <SafeAreaView style={styles.main_container}>
            <View style={styles.top_container}>
                <TouchableOpacity style={styles.title_button} onPress={handleMenu}>
                    <Text style={styles.title_button_text}>Menu</Text>
                </TouchableOpacity>
                <Text style={styles.title_text}>Test Results</Text>
                <View style={styles.title_button}/>
            </View>
            <View style={styles.results_container}>

            </View>
            <View style={styles.bottom_container}>
                <TouchableOpacity style={styles.play_button} onPress={handlePlay}>
                    <Text style={styles.play_text}>Play Again!</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

}

export default TestResultsScreen;

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: colors.darkGrey,
    },

    top_container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingVertical: 10,
        backgroundColor: colors.lightPurple,
    },

    title_text: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
    },

    title_button: {
        width: 60,
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

    results_container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white',
        gap: 5,
    },

    row_title: {
        backgroundColor: colors.darkPurple,
        flexDirection: 'row',
        paddingHorizontal: 5,
    },

    row_title_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },

    row_item_container: {
        flexDirection: 'row',
        paddingHorizontal: 5,
    },

    row_item: {
        flex: 1,
        padding: 5,
    },

    row_image_container: {
        justifyContent: 'center',
        alignItems: 'center'
    },

    correct_icon: {
        width: "25%",
        aspectRatio: 1,
        color: '#2ebf44'
    },

    wrong_icon: {
        width: "20%",
        aspectRatio: 1,
        color: '#ed0e0e'
    },

    bottom_container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        backgroundColor: colors.lightPurple,
        padding: 10,
    },

    play_button: {
        backgroundColor: colors.darkPurple,
        padding: 10,
        // width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5
    },

    play_text: {
        color: 'white',
        fontSize: 30,
        fontWeight: '700'
    },

    modal_container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },

    modal_image_container: {
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center'
    },

});