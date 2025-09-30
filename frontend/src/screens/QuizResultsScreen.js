import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/core';
import { Keyboard, Platform, StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, TextInput, KeyboardAvoidingView } from 'react-native';
import Modal from "react-native-modal";

import colors from '../util/colors.js';
import { useGame, useUser } from '../hooks/useRedux.js';
import { resetGame, quickRestart } from '../store/slices/gameSlice.js';
import { updateStatistics } from '../store/slices/userSlice.js';

import Check from '../icons/Check.svg';
import X from '../icons/X.svg';

const QuizResultsScreen = () => {
    // Redux hooks
    const game = useGame();
    const user = useUser();
    const navigation = useNavigation();

    // Route params
    const route = useRoute();
    const pack = route.params?.pack;
    const div = route.params?.div;
    const divOption = route.params?.divOption;
    const question = route.params?.question;
    const questionType = route.params?.questionType;
    const answer = route.params?.answer;
    const answerType = route.params?.answerType;
    const items = route.params?.items;
    const range = route.params?.range;

    // Local state for UI
    const [selectedImage, setImage] = useState(null);
    const [showingModal, setModal] = useState(false);

    // Derived state from Redux
    const results = game.results || route.params?.results;
    const images = game.images || route.params?.images;
    const points = game.points;
    const totalQuestions = game.totalQuestions;

    useEffect(() => {
        adjustWeights();
        saveStatistics();
    }, []);

    function adjustWeights(){
        for(const item of results){
            const idx = items.map((e) => { return e.name }).indexOf(item.name);
            let newItem = items[idx];
            let newWeight = newItem.weight;

            if(item.correct){
                newWeight = Math.max(newWeight-20, 1);
            } else {
                if(item.input !== ""){
                    newWeight = 60;
                }
            }
            newItem.weight = newWeight;
            items[idx] = newItem;
        }
    }

    function saveStatistics(){
        if (points !== undefined && totalQuestions !== undefined) {
            const score = totalQuestions > 0 ? (points / totalQuestions) * 100 : 0;
            const timeSpent = 45 * totalQuestions; // Rough estimate
            
            user.dispatch(updateStatistics({
                gameType: 'quiz',
                score,
                timeSpent
            }));
        }
    }

    async function handlePlay(){
        // Reset game state for a new game
        game.dispatch(quickRestart());
        navigation.navigate("QuizGame", {pack: pack, div: div, divOption: divOption, question: question, questionType: questionType, answer: answer, answerType: answerType, range: range, items: items});
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
                <TouchableOpacity style={styles.title_button} onPress={() => navigation.navigate("QuizOption")}>
                    <Text style={styles.title_button_text}>Menu</Text>
                </TouchableOpacity>
                <Text style={styles.title_text}>Write Quiz Results</Text>
                <View style={styles.title_button}/>
            </View>
            <View style={styles.results_container}>
                <View style={styles.row_title}>
                    {questionType !== "map" && <View style={styles.row_item}>
                        <Text style={styles.row_title_text}>Question</Text>
                    </View>}
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
                        <View key={item.question ? item.question : item.answer} style={styles.row_item_container}>
                            {(questionType !== "map") && <View style={styles.row_item}>
                                {questionType === "image" ?
                                    <TouchableOpacity style={styles.row_image_container} onPress={() => handleImage(images[item["name"]])}>
                                        <Image 
                                            style={{height: 25, aspectRatio: images[item["name"]].ar}}
                                            source={images[item["name"]].image}
                                        />  
                                    </TouchableOpacity>
                                    :
                                    <Text>{item.question}</Text>
                                }
                            </View>}
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

            <Modal 
                isVisible={showingModal}
                coverScreen={true}
                onBackdropPress={handleClose}
                style={styles.modal_container}
            >
                <TouchableOpacity style={styles.modal_image_container} onPress={handleClose}>
                    {selectedImage && <Image 
                        style={{height: 'auto', width: '100%', aspectRatio: selectedImage.ar}}
                        // style={{width: 10}}
                        source={selectedImage.image}
                    />} 
                </TouchableOpacity>
                
            </Modal>
        </SafeAreaView>
    );

}

export default QuizResultsScreen;

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