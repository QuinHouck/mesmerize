import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/core';
import { Keyboard, Platform, StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, TextInput, KeyboardAvoidingView } from 'react-native';

import Check from '../icons/Check.svg';
import X from '../icons/X.svg';

const QuizResultsScreen = () => {

    const route = useRoute()
    const question = route.params?.question;
    const answer = route.params?.answer;
    const answerType = route.params?.answerType;
    const items = route.params?.items;
    const results = route.params?.results;

    const navigation = useNavigation();

    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        
    }, []);

    async function handlePlay(){
        navigation.navigate("QuizGame", {question: question, answer: answer, answerType: answerType, items: items});
    }


    return (
        <SafeAreaView style={styles.main_container}>
            <View style={styles.top_container}>
                <TouchableOpacity style={styles.title_button} onPress={() => navigation.navigate("QuizOption")}>
                    <Text style={styles.title_button_text}>Menu</Text>
                </TouchableOpacity>
                <Text style={styles.title_text}>Write Quiz Results</Text>
                <View style={styles.title_button}/>
            </View>
            <View style={styles.results_container}>
                <View style={styles.row_title}>
                    <View style={styles.row_item}>
                        <Text style={styles.row_title_text}>Question</Text>
                    </View>
                    <View style={styles.row_item}>
                        <Text style={styles.row_title_text}></Text>
                    </View>
                    <View style={styles.row_item}>
                        <Text style={styles.row_title_text}>Yours</Text>
                    </View>
                    <View style={styles.row_item}>
                        <Text style={styles.row_title_text}>Correct</Text>
                    </View>
                </View>
                {results.map((item) => {
                    return (
                        <View key={item.question} style={styles.row_item_container}>
                            <View style={styles.row_item}>
                                <Text>{item.question}</Text>
                            </View>
                            <View style={[styles.row_item, {justifyContent: 'center', alignItems: 'center'}]}>
                                {item.correct ? 
                                    <Check style={styles.correct_icon}/>
                                    :
                                    <X style={styles.wrong_icon}/>
                                }
                            </View>
                            <View style={styles.row_item}>
                                <Text>{item.input}</Text>
                            </View>
                            <View style={styles.row_item}>
                                <Text>{item.answer}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
            <View style={styles.bottom_container}>
                <TouchableOpacity style={styles.play_button} onPress={handlePlay}>
                    <Text style={styles.play_text}>Play Again!</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

}

export default QuizResultsScreen;

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
        backgroundColor: '#3b2c5e',
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
        backgroundColor: '#745e96',
        padding: 10,
    },

    play_button: {
        backgroundColor: '#3b2c5e',
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
    }
});