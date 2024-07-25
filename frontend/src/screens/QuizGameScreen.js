import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/core';
import { Keyboard, Platform, StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, TextInput, KeyboardAvoidingView } from 'react-native';
import Modal from "react-native-modal";

import colors from '../util/colors.js';

import { getImages } from '../util/getImages';

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
    const range = route.params?.range;
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

    const [cooldown, setCooldown] = useState(false);

    const [time, setTime] = useState(45);
    const [tid, setTid] = useState(null);
    const timerRef = useRef(time);

    const [isPaused, setIsPaused] = useState(false);
    const [inRound, setInRound] = useState(false);
    const [ended, setEnded] = useState(false);

    const [isLoading, setLoading] = useState(true);

    const [images, setImages] = useState(null);
    const [imageHeight, setImageHeight] = useState('50%');

    useEffect(() => {
        getSelected();
    }, [isFocused]);

    useEffect(() => {
        if(!inRound || ended || isPaused) return;
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
    }, [inRound, ended, isPaused]);

    async function getSelected(){
        if(!isFocused){
            setLoading(true);
            return;
        }

        let filtered = items;

        if(div && divOption){
            filtered = items.filter((item) => {
                return item[div] === divOption;
            })
        }

        if(questionType === "map"){
            filtered = filtered.filter((item) => {
                return item.mappable === true;
            })
        }

        if(range.ranged){
            filtered = filtered.filter((item) => {
                let num = item[range["attr"]];
                return (num <= range.end && num >= range.start);
            })
        }

        // const shuffled = filtered.sort(() => 0.5 - Math.random());
        const num = Math.min(10, filtered.length);
        const chosen = getChosen(filtered, num);
        // const chosen = shuffled.slice(0, num);

        // console.log(chosen);

        if(questionType === "image"){
            const {imgs, height} = await getImages(chosen, pack);
            setImages(imgs);
            setImageHeight(height);
        }

        let res = [];
        chosen.forEach((item) => {
            const data = {
                question: item[question],
                answer: item[answer],
                input: "",
                name: item.name,
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
        setCooldown(false);
        timerRef.current = 45;
    }

    function getChosen(filtered, num){
        let weights = [];
        let total = 0;
        for(const item of filtered){
            total = total + item.weight;
            weights.push(total);
        }

        let chosen = []
        while(chosen.length < num){
            let random  = Math.random() * total;
            for(i=0; i<weights.length; i++){
                if(weights[i] > random){
                    break;
                }
            }
            if(!chosen.includes(filtered[i])){
                chosen.push(filtered[i]);
            }
        }
        chosen = chosen.sort(() => 0.5 - Math.random());
        return chosen;
    }
        

    function getKeyboard() {
        if(answerType === "number") return 'number-pad';

        if(Platform.OS === 'ios') return 'ascii-capable';

        return 'visible-password';
    }

    async function handleSubmit(){
        if(cooldown) return;
        setCooldown(true);
        setInRound(false);
        let distance = 10;
        let percent = 10;

        if(answerType === 'string'){
            distance = await getDistance(input, selected[idx][answer]);
            percent = distance/(selected[idx][answer].length);
            // console.log("Percent: ", percent);
        } else if(answerType === 'number'){
            // console.log(input, typeof(Number(input)));
            // console.log(selected[idx][answer], typeof(selected[idx][answer]));
            if(Number(input) === Number(selected[idx][answer])){
                distance = 0;
                percent = 0;
            }
        }
        

        let correct = false;
        let correctId = 1;
        if(percent < 0.2){
            // console.log("Correct")
            setPoints(points+1);
            correct = true;
            correctId = 2;
        } else {
            if(selected[idx].accepted && answerType === 'string'){
                for(other of selected[idx].accepted){
                    distance = getDistance(input, other);
                    percent = distance/(selected[idx][answer].length);
                    // console.log("Percent: ", percent);
                    if(percent < 0.2){
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

        setInput(selected[idx][answer].toString());

        setTimeout(() => {
            if(idx+1 >= selected.length){
                endGame();
                return;
            }
            setIndex(idx+1);
            setInput("");
            setCorrect(0);
            setInRound(true);
            setCooldown(false);
            timerRef.current = 45;
            // startTimer();
        }, 2500);    
    }

    function handleInput(newInput){
        if(cooldown) return;
        setInput(newInput);
    }

    function pauseGame(){
        if(tid) {
            clearInterval(tid);
        };
        setIsPaused(true);
    }

    function endGame(){
        if(tid) {
            clearInterval(tid);
        }
        setInRound(false);
        setEnded(true);
        navigation.navigate("QuizResults", {pack: pack, div: div, divOption: divOption, question: question, questionType: questionType, answer: answer, answerType: answerType, items: items, results: results, range: range, images: images});
    }

    function parseString(str){
        if(str === "") return str;
        str = str.toLowerCase();
        str = str.replace(' ', '');
        str = str.replace('-', '');
        str = str.replace('\'', '');
        str = str.replace('.', '');
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
                return colors.darkGrey;
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
                    style={{height: imageHeight, aspectRatio: images[selected[idx]["name"]].ar}}
                    source={images[selected[idx]["name"]].image}
                />;
            case "map":
                return (
                    <View style={{height: '100%', width: "100%", alignItems: 'center'}}>
                        <Map selected={current} pack={pack} div={div} divOption={divOption} type={"Quiz"} style={{width: '100%'}}/>
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
                <TouchableOpacity style={styles.title_button} onPress={pauseGame}>
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
                        onChangeText={(e) => handleInput(e)}
                        value={input}
                        autoCorrect={false}
                        spellCheck={false}
                        keyboardType={getKeyboard()}
                        returnKeyType={answerType === 'number' ? 'done' : 'go'}
                        blurOnSubmit={false}
                        onSubmitEditing={handleSubmit}
                        autoFocus
                    />
                </View>
            </KeyboardAvoidingView>}
            <Modal 
                isVisible={isPaused}
                coverScreen={true}
                onBackdropPress={() => setIsPaused(false)}
                style={styles.modal_container}
            >
                <View style={styles.modal_middle_container}>
                    <Text style={[styles.resume_button_text, {fontSize: 30}]}>Paused</Text>
                    <TouchableOpacity style={styles.resume_button} onPress={() => setIsPaused(false)}>
                        <Text style={styles.resume_button_text}>Resume</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );

}

export default QuizGameScreen;

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
        backgroundColor: colors.lightPurple,
        padding: 10,
    },

    input: {
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 5,
        fontSize: 18,
        fontWeight: '600'
    },

    // Paused

    modal_container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },

    modal_middle_container: {
        borderRadius: 10,
        padding: 20,
        gap: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },

    resume_button: {
        minWidth: '40%',
        paddingVertical: 20,
        backgroundColor: colors.lightPurple,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5
    },

    resume_button_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },


});