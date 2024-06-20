import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/core';
import { Keyboard, Platform, StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, TextInput, KeyboardAvoidingView } from 'react-native';

import { getFlags } from '../util/getImages';

import AsiaMap from '../images/countries/continents/AsiaMap.js';
import EuropeMap from '../images/countries/continents/EuropeMap.js';
import NorthMap from '../images/countries/continents/NorthMap.js';

const QuizGameScreen = () => {

    const route = useRoute()
    const question = route.params?.question;
    const questionType = route.params?.questionType;
    const answer = route.params?.answer;
    const answerType = route.params?.answerType;
    const items = route.params?.items;

    const [selected, setSelected] = useState(null);
    const [results, setResults] = useState([]);

    const inputRef = React.useRef();

    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [points, setPoints] = useState(0);
    const [idx, setIndex] = useState(0);

    const [input, setInput] = useState("");

    const [correct, setCorrect] = useState(0);

    const [isLoading, setLoading] = useState(true);

    const [images, setImages] = useState(null);

    useEffect(() => {
        getSelected();
    }, [isFocused]);

    async function getSelected(){
        if(!isFocused){
            setLoading(true);
            return;
        }

        let asian = items.filter((country) => {
            return country.region === 'Europe';
        })

        if(questionType === "map"){
            asian = asian.filter((country) => {
                return country.mappable === true;
            })
        }

        const shuffled = asian.sort(() => 0.5 - Math.random());
        const num = Math.min(10, items.length);
        const chosen = shuffled.slice(0, num);

        if(questionType === "image"){
            const ret = await getFlags(chosen);
            setImages(ret);
        }

        let res = [];
        chosen.forEach((item) => {
            const data = {
                question: item[question],
                answer: item[answer],
                input: "",
                correct: false
            }
            res.push(data);
        });

        setResults(res);
        setSelected(chosen);
        setInput("");
        setPoints(0);
        setIndex(0);
        setCorrect(0);
        setLoading(false);
    }

    function getKeyboard() {
        if(answerType === "numeric") return 'numeric';

        if(Platform.OS === 'ios') return 'ascii-capable';

        return 'visible-password';
    }

    async function handleSubmit(){

        const distance = getDistance(input, selected[idx][answer]);

        let correct = false;
        if(distance < 2){
            // console.log("Correct")
            setCorrect(2);
            setPoints(points+1);
            correct = true;
        } else {
            setCorrect(1);
            // console.log("Incorrect")
        }

        results[idx].input = input;
        results[idx].correct = correct;

        setInput(selected[idx][answer]);

        setTimeout(() => {
            if(idx+1 >= selected.length){
                endGame();
                return;
            }
            setIndex(idx+1);
            setInput("");
            setCorrect(0);
        }, 2500)
    }

    function endGame(){
        navigation.navigate("QuizResults", {question: question, questionType: questionType, answer: answer, answerType: answerType, items: items, results: results});
    }

    //Function Taken from: https://www.tutorialspoint.com/levenshtein-distance-in-javascript
    function getDistance(str1, str2){  
        str1 = str1.toLowerCase();
        str1 = str1.replace(' ', '');
        str1 = str1.replace('-', '');
        str1 = str1.replace('\'', '');
        
        str2 = str2.toLowerCase();
        str2 = str2.replace(' ', '');
        str2 = str2.replace('-', '');
        str2 = str2.replace('\'', '');

        const track = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i += 1) {
            track[0][i] = i;
        }
        for (let j = 0; j <= str2.length; j += 1) {
            track[j][0] = j;
        }
        for (let j = 1; j <= str2.length; j += 1) {
            for (let i = 1; i <= str1.length; i += 1) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                track[j][i] = Math.min(
                    track[j][i - 1] + 1, // deletion
                    track[j - 1][i] + 1, // insertion
                    track[j - 1][i - 1] + indicator, // substitution
                );
            }
        }
        return track[str2.length][str1.length];
    }

    function getTextColor(){
        switch(correct){
            case 0:
                return '#222222';
            case 1:
                return '#ed0e0e';
            case 2:
                return '#2ebf44';
        }
    }

    function renderQuestion(current){
        switch(questionType){
            case "image":
                return <Image 
                    style={{height: '50%', aspectRatio: images[`${selected[idx]["iso2"].toLowerCase()}.png`].ar}}
                    source={images[`${selected[idx]["iso2"].toLowerCase()}.png`].image}
                />;
            case "map":
                return (
                    <View style={{height: '100%', width: "90%"}}>
                        <EuropeMap selected={current} style={{height: '100%', width: "90%"}}/>
                    </View>
                );
            default: 
                return <Text style={styles.question_text}>{selected[idx][question]}</Text>;
        }
    }

    if(isLoading){
        return (
            <SafeAreaView style={styles.main_container}>

            </SafeAreaView>
        );
    };

    return (
        <SafeAreaView style={styles.main_container}>
             <View style={styles.top_container}>
                <TouchableOpacity style={styles.title_button} onPress={() => navigation.goBack()}>
                    <Text style={styles.title_button_text}>Pause</Text>
                </TouchableOpacity>
                <Text style={styles.title_text}>Write Quiz</Text>
                <TouchableOpacity style={styles.title_button} onPress={endGame}>
                    <Text style={styles.title_button_text}>End</Text>
                </TouchableOpacity>
            </View>
            {selected && <KeyboardAvoidingView style={styles.second_container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.question_container}>
                    {renderQuestion(selected[idx])}
                    {/* {questionType === "image" ?
                        <Image 
                            style={{height: '50%', aspectRatio: images[`${selected[idx]["iso2"].toLowerCase()}.png`].ar}}
                            source={images[`${selected[idx]["iso2"].toLowerCase()}.png`].image}
                        />
                        :
                        <Text style={styles.question_text}>{selected[idx][question]}</Text>
                    } */}
                </View>
                <View style={styles.stats_container}>
                    <View style={styles.stats_left}>
                        <Text style={styles.stats_left_text}>{`${points} pts`}</Text>
                        <Text style={styles.stats_left_text}>{`${idx+1}/${selected.length}`}</Text>
                    </View>
                    <View style={styles.stats_left}>
                        <Text style={styles.stats_left_text}>{`00:45`}</Text>
                    </View>
                </View>
                <View style={styles.answer_container}>
                    <TextInput 
                        style={[styles.input, {color: getTextColor()}]}
                        ref={inputRef}
                        onChangeText={setInput}
                        value={input}
                        autoCorrect={false}
                        spellCheck={false}
                        keyboardType={getKeyboard()}
                        returnKeyType='go'
                        blurOnSubmit={false}
                        onSubmitEditing={handleSubmit}
                        autoFocus
                    />
                </View>
            </KeyboardAvoidingView>}
        </SafeAreaView>
    );

}

export default QuizGameScreen;

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
        zIndex: 10,
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

    second_container: {
        flex: 1,
    },

    question_container: {
        flex: 5,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

    question_text: {
        color: 'white',
        fontSize: 30,
        fontWeight: '700'
    },

    question_image:{
        height: '50%',
        aspectRatio: 2/1,
    },

    stats_container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,

    },

    stats_left: {
        gap: 10,
    },

    stats_left_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        borderBottomWidth: 3,
        borderBottomColor: 'white'
    },

    answer_container: {
        backgroundColor: "#745e96",
        padding: 10,
    },

    input: {
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 5,
        fontSize: 18,
        fontWeight: '600'
    },

});