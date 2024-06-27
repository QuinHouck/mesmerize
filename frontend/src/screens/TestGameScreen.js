import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/core';
import { Keyboard, Platform, StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, TextInput, KeyboardAvoidingView, ScrollView } from 'react-native';

import Check from '../icons/Check.svg';
import X from '../icons/X.svg';

const TestGameScreen = () => {

    const route = useRoute()
    const pack = route.params?.pack;
    const div = route.params?.div;
    const divOption = route.params?.divOption;
    const listDivName = route.params?.listDivName;
    const listDiv = route.params?.listDiv;
    const items = route.params?.items;

    const [selected, setSelected] = useState(null);
    const [answered, setAnswered] = useState([]);

    const inputRef = React.useRef();

    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [points, setPoints] = useState(0);
    const [idx, setIndex] = useState(0);

    const [input, setInput] = useState("");
    const [lastInput, setLastInput] = useState("");

    const [correct, setCorrect] = useState(0);

    const [numCorrect, setNumCorrect] = useState(0);
    const [total, setTotal] = useState(0);

    const [time, setTime] = useState(45);
    const [tid, setTid] = useState(null);
    const timerRef = useRef(time);

    const [showList, setList] = useState(false);
    const [showMap, setMap] = useState(false);

    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        getSelected();
    }, [isFocused]);

    // useEffect(() => {
    //     if(!inRound || ended) return;
    //     timerRef.current = 45;
    //     const timerId = setInterval(() => {
    //         timerRef.current -= 1;
    //         if (timerRef.current < 0) {
    //             clearInterval(timerId);
    //             handleSubmit();
    //         } else {
    //             setTime(timerRef.current);
    //         }
    //     }, 1000);
    //     setTid(timerId);
    //     return () => {
    //         clearInterval(timerId);
    //         if(tid) clearInterval(tid);
    //     };
    // }, [inRound, ended]);

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

        setSelected(filtered);
        setTotal(filtered.length);
        setAnswered([]);
        setInput("");
        setLastInput("");
        setNumCorrect(0);
        setCorrect(0);
        setLoading(false);
    }

    function getKeyboard() {
        if(Platform.OS === 'ios') return 'ascii-capable';

        return 'visible-password';
    }

    async function handleSubmit(){
        let distance = 10;
        let percent = 10;
        let end = false;

        let realMatch = "";

        let correct = 3;
        const good = selected.some(e => {
            distance = getDistance(input, e.name);
            percent = distance/e.name.length;
            if(percent < 0.2){
                realMatch = e;
                const already = answered.some((a) => a === realMatch)
                if(already){
                    correct = 2;
                } else {
                    correct = 1;
                    return true;
                }
            }
        });

        if(correct === 1){
            setNumCorrect(numCorrect + 1);
            setLastInput(realMatch.name);
            answered.push(realMatch);
            if(numCorrect+1 === total) end = true;
        } else if (correct === 2){
            setLastInput(realMatch.name);
        } else {
            setLastInput(input);
        }
        setCorrect(correct)
        setInput("");  

        if(end){
            endGame();
        }
    }

    function endGame(){
        if(tid) {
            clearInterval(tid);
        }
        navigation.navigate("TestOption", {pack: pack, div: div, divOption: divOption, items: items});
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

    function getPicture(){
        switch(correct){
            case 1:
                return (
                    <Check style={[styles.symbol, {color: "green"}]}/>
                );
            case 2:
                return (
                    <Check style={[styles.symbol, {color: "yellow"}]}/>
                );
            case 3:
                return (
                    <X style={[styles.symbol, {color: "red"}]}/>
                );
            default:
                return;
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
                <View style={[styles.top_left_container, showList ? {justifyContent: 'space-between'} : {justifyContent: 'flex-end'}]}>
                    {showList && <TouchableOpacity style={[styles.title_button, {alignSelf: 'flex-start'}]} onPress={() => setList(false)}>
                        <Text style={styles.title_button_text}>Back</Text>
                    </TouchableOpacity>}
                    <Text style={styles.top_text}>{`${Math.floor((numCorrect/total)*100)}%`}</Text>
                </View>
                <View style={styles.top_mid_container}>
                    <Text>{time}</Text>
                </View>
                <View style={styles.top_right_container}>
                    <TouchableOpacity style={[styles.title_button, {alignSelf: 'flex-end'}]} onPress={endGame}>
                        <Text style={styles.title_button_text}>End</Text>
                    </TouchableOpacity>
                    <Text style={styles.top_text}>{`${numCorrect}/${total}`}</Text>
                </View>
            </View>
            {selected && !showList && <KeyboardAvoidingView style={styles.second_container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.symbol_container}>
                    {getPicture()}
                </View>
                <View style={styles.stats_container}>
                    <View style={styles.stats_left}>
                        <View style={{borderColor: 'white', borderBottomWidth: 2, width: '100%'}}>
                            <Text style={styles.stats_left_text}>Last Answer</Text>
                        </View>
                        <Text style={styles.stats_left_text}>{lastInput}</Text>
                    </View>
                    <View style={[styles.stats_left, {paddingBottom: 10}]}>
                        <TouchableOpacity style={[styles.title_button, {alignSelf: 'flex-end'}]} onPress={() => setList(true)}>
                            <Text style={styles.title_button_text}>List</Text>
                        </TouchableOpacity>
                        {pack.divisions && <TouchableOpacity style={[styles.title_button, {alignSelf: 'flex-end'}]}>
                            <Text style={styles.title_button_text}>Map</Text>
                        </TouchableOpacity>} 
                    </View>
                </View>
                <View style={styles.answer_container}>
                    <TextInput 
                        style={styles.input}
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
            {selected && showList && <ScrollView>
                <View style={styles.list_container}>
                    {(!listDivName || div) && selected.map((obj, index) => {
                        return (
                            <View key={index} style={styles.list_object_container}>
                                <Text style={styles.list_object}>{answered.includes(obj) ? obj.name : ""}</Text>
                            </View>
                        )
                    })}
                    {(listDivName && !div) && listDiv.map((d) => {
                        const parts = selected.filter((e) => e[listDivName] === d.name);
                        const correctParts = answered.filter((e) => e[listDivName] === d.name);
                        return (
                            <View style={styles.list_div_container}>
                                <View style={styles.list_div_title}>
                                    <Text style={styles.list_div_title_text}>{d.title}</Text>
                                    <Text style={styles.list_div_title_text}>{`${correctParts.length}/${parts.length}`}</Text>
                                </View>
                                <View>
                                    {parts.map((obj) => {
                                        return (
                                            <View key={obj.name} style={styles.list_object_container}>
                                                <Text style={styles.list_object}>{answered.includes(obj) ? obj.name : ""}</Text>
                                            </View>
                                        )
                                    })} 
                                </View>
                                
                            </View>
                        )
                    })}
                </View>
            </ScrollView>}
        </SafeAreaView>
    );

}

export default TestGameScreen;

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "#222222",
    },

    top_container: {
        flexDirection: 'row',
        height: 100,
        width: '100%',
        justifyContent: 'space-between',
        // paddingHorizontal: 30,
        paddingVertical: 10,
        // backgroundColor: "#745e96",
        zIndex: 10,
    },

    top_left_container: {
        height: '100%',
        width: '25%',
        borderColor: 'white',
        borderBottomWidth: 2,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },

    top_mid_container: {
        height: '100%',
        width: '50%',
        alignItems: 'center',
    },

    top_right_container: {
        height: '100%',
        width: '25%',
        borderColor: 'white',
        borderBottomWidth: 2,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    top_text: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
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
        fontSize: 16,
        fontWeight: '400',
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 3,
        paddingHorizontal: 5,
    },

    second_container: {
        width: '100%',
        flex: 1,
    },

    symbol_container: {
        flex: 5,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

    symbol: {
        height: '40%',
        aspectRatio: 1,
    },

    stats_container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
    },

    stats_left: {
        gap: 15,
        minWidth: '25%',
        marginBottom: 5
    },

    stats_left_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        borderBottomWidth: 3,
        borderBottomColor: 'white',
        paddingLeft: 15,
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
        fontWeight: '600',
        color: '#222222'
    },

    list_container: {
        width: '100%',
        gap: 10,
    },

    list_div_container: {
        width: '100%',
        marginVertical: 5,
    },

    list_div_title: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        paddingHorizontal: 5,
        borderBottomColor: 'rgba(255,255,255,1)',
    },

    list_div_title_text: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },

    list_object_container: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.5)',
        marginLeft: 15,
    },

    list_object: {
        color: 'white',
        paddingVertical: 5
    },

});