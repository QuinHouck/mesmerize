import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/core';
import { Keyboard, Platform, StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, TextInput, KeyboardAvoidingView } from 'react-native';

import { getFlags } from '../util/getImages';

import Map from '../components/Map.js'

const QuizGameScreen = () => {

    const route = useRoute()
    const pack = route.params?.pack;
    const div = route.params?.div;
    const divOption = route.params?.divOption;
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

    const [time, setTime] = useState(45);
    const [tid, setTid] = useState(null);
    const timerRef = useRef(time);

    const [isPaused, setIsPaused] = useState(false);
    const [inRound, setInRound] = useState(false);
    const [ended, setEnded] = useState(false);

    const [isLoading, setLoading] = useState(true);

    const [images, setImages] = useState(null);

    useEffect(() => {
        getSelected();
    }, [isFocused]);

    useEffect(() => {
        // console.log("InRound: ", inRound);
        // console.log("Ended: ", ended);
        if(!inRound || ended) return;
        timerRef.current = 45;
        const timerId = setInterval(() => {
            timerRef.current -= 1;
            if (timerRef.current < 0) {
                clearInterval(timerId);
                handleSubmit();
                // console.log("Ended");
            } else {
                setTime(timerRef.current);
            }
        }, 1000);
        setTid(timerId);
        return () => {
            // console.log("cleared");
            clearInterval(timerId);
            if(tid) clearInterval(tid);
        };
    }, [inRound, ended]);

    async function getSelected(){
        if(!isFocused){
            setLoading(true);
            return;
        }

        let filtered = items;

        if(div && divOption){
            filtered = items.filter((country) => {
                return country.region === divOption;
            })
        }

        if(questionType === "map"){
            filtered = filtered.filter((country) => {
                return country.mappable === true;
            })
        }

        const shuffled = filtered.sort(() => 0.5 - Math.random());
        const num = Math.min(10, filtered.length);
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
        setInRound(true);
        setEnded(false);
        setLoading(false);
    }

    function getKeyboard() {
        if(answerType === "numeric") return 'numeric';

        if(Platform.OS === 'ios') return 'ascii-capable';

        return 'visible-password';
    }

    async function handleSubmit(){
        setInRound(false);

        let distance = getDistance(input, selected[idx][answer]);

        let correct = false;
        let correctId = 1;
        if(distance < 2){
            // console.log("Correct")
            setPoints(points+1);
            correct = true;
            correctId = 2;
        } else {
            if(selected[idx].accepted){
                for(other of selected[idx].accepted){
                    distance = getDistance(input, other);
                    if(distance < 2){
                        setPoints(points+1);
                        correct = true;
                        correctId = 2;
                        break;
                    }
                }
            }
        }

        setCorrect(correctId)

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
            setInRound(true);
            // startTimer();
        }, 2500);    
    }

    function endGame(){
        if(tid) {
            clearInterval(tid);
        }
        setInRound(false);
        setEnded(true);
        navigation.navigate("QuizResults", {pack: pack, div: div, divOption: divOption, question: question, questionType: questionType, answer: answer, answerType: answerType, items: items, results: results});
    }

    function parseString(str){
        if(str === "") return str;
        str = str.toLowerCase();
        str = str.replace(' ', '');
        str = str.replace('-', '');
        str = str.replace('\'', '');
        return str;
    }

    //Function Taken from: https://www.tutorialspoint.com/levenshtein-distance-in-javascript
    function getDistance(str1, str2){  
        str1 = parseString(str1);
        str2 = parseString(str2);

        if(str1 === "") return 10;
        const track = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
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
                    <View style={{height: '100%', width: "100%", alignItems: 'center'}}>
                        <Map selected={current} pack={pack} div={div} divOption={divOption} style={{width: '100%'}}/>
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
                        <Text style={styles.stats_left_text}>{`00:${time.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})}`}</Text>
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