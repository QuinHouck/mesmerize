import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/core';
import { Keyboard, Platform, StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, TextInput, KeyboardAvoidingView, ScrollView, Dimensions } from 'react-native';

import Map from '../components/Map.js'

import { getDistance } from '../util/extraFuncs.js';
import colors from '../util/colors.js';

import Check from '../icons/Check.svg';
import X from '../icons/X.svg';

const screenWidth = Dimensions.get('window').width;

const TestGameScreen = () => {

    const route = useRoute()

    //pack is just the pack name
    const pack = route.params?.pack;

    //name of div if a division is selected (eg region)
    const div = route.params?.div;

    //name of div if a division is selected (eg Africa)
    const divOption = route.params?.divOption;

    //name of div to split the list (eg region)
    const listDivName = route.params?.listDivName;

    //List of objects for the list
    const listDiv = route.params?.listDiv;


    const test_time = route.params?.time;
    const has_maps = route.params?.has_maps;
    const items = route.params?.items;

    const [selected, setSelected] = useState(null);
    const [answered, setAnswered] = useState([]);

    const inputRef = React.useRef();

    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [input, setInput] = useState("");
    const [lastInput, setLastInput] = useState("");

    const [correct, setCorrect] = useState(0);

    const [numCorrect, setNumCorrect] = useState(0);
    const [total, setTotal] = useState(0);

    const [time, setTime] = useState(test_time);
    const [tid, setTid] = useState(null);
    const timerRef = useRef(time);

    const [showList, setList] = useState(false);
    const [showMap, setMap] = useState(false);

    const [started, setStarted] = useState(true);
    const [ended, setEnded] = useState(false);
    

    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        // console.log("Div: ", div);
        // console.log("ListDivName: ", listDivName);
        // console.log("divOption: ", divOption);
        // console.log("listDiv: ", listDiv)
        getSelected();
    }, [started, isFocused]);

    useEffect(() => {
        if(!started) return;
        timerRef.current = test_time;
        const timerId = setInterval(() => {
            if(ended) return;
            timerRef.current -= 1;
            if (timerRef.current < 0) {
                clearInterval(timerId);
                handleSubmit();
            } else {
                setTime(timerRef.current);
            }
        }, 1000);
        setTid(timerId);
        return () => {
            clearInterval(timerId);
            if(tid) clearInterval(tid);
        };
    }, [started]);

    async function getSelected(){
        if(!isFocused){
            setLoading(true);
            return;
        }

        if(!started) return;

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
            if(percent < 0.1){
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
        setMap(false);
        setList(false);
        setEnded(true);
        setStarted(false);
    }

    function returnMenu(){
        navigation.navigate("TestOption", {pack: pack, div: div, divOption: divOption, items: items});
    }

    function playAgain(){
        setStarted(true);
        setEnded(false);
        // navigation.navigate("TestGame", {pack: pack, div: div, divOption: divOption, listDivName: listDivName, listDiv: listDiv, time: test_time, items: items});
    }

    function addZeros(num){
        return num.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    }

    function backPressed(){
        setMap(false);
        setList(false);
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
                <View style={[styles.top_left_container, (showList || showMap) ? {justifyContent: 'space-between'} : {justifyContent: 'flex-end'}]}>
                    {(showList || showMap) && <TouchableOpacity style={[styles.title_button, {alignSelf: 'flex-start'}]} onPress={backPressed}>
                        <Text style={styles.title_button_text}>Back</Text>
                    </TouchableOpacity>}
                    <Text style={styles.top_text}>{`${Math.floor((numCorrect/total)*100)}%`}</Text>
                </View>
                <View style={styles.top_mid_container}>
                    <View style={styles.timer_circle}>
                        <Text style={styles.timer_text}>{`${addZeros(Math.floor(time/60))}:${addZeros(time%60)}`}</Text>
                    </View>
                </View>
                <View style={[styles.top_right_container, ended ? {justifyContent: 'flex-end'} : {}]}>
                    {!ended && <TouchableOpacity style={[styles.title_button, {alignSelf: 'flex-end'}]} onPress={endGame}>
                        <Text style={styles.title_button_text}>End</Text>
                    </TouchableOpacity>}
                    <Text style={styles.top_text}>{`${numCorrect}/${total}`}</Text>
                </View>
            </View>
            {selected && !showList && !showMap && !ended && <KeyboardAvoidingView style={styles.second_container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
                        {has_maps && <TouchableOpacity style={[styles.title_button, {alignSelf: 'flex-end'}]} onPress={() => setMap(true)}>
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
            {ended && !showList && !showMap && <View style={styles.results_container}>
                <View style={styles.missed_title_container}>
                    <Text style={styles.end_button_text}>What you missed:</Text>
                </View>
                {(selected.length !== answered.length) ? 
                <ScrollView style={styles.missed_container}>
                    {selected.map((item) => {
                        if(!answered.includes(item)){
                            return (
                                <Text key={item._id} style={styles.missed_item}>{item.name}</Text>
                            )
                        }
                    })}
                    
                </ScrollView>
                :
                <View style={styles.perfect_container}>
                    <Text style={styles.perfect_text}>Perfect!</Text>
                </View>
                }
                <View style={styles.end_button_container}>
                    <TouchableOpacity style={styles.end_button} onPress={returnMenu}>
                        <Text style={styles.end_button_text}>Menu</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.end_button} onPress={playAgain}>
                        <Text style={styles.end_button_text}>Play Again</Text>
                    </TouchableOpacity>
                </View>
            </View>}
            {selected && showList && <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.list_container}>
                    {/* If the list cannot be divided or if a division was selected, display the whole list */}
                    {(!listDivName || div) && selected.map((obj, index) => {
                        return (
                            <View key={index} style={styles.list_object_container}>
                                <Text style={styles.list_object}>{answered.includes(obj) ? obj.name : ""}</Text>
                            </View>
                        )
                    })}
                    {/* If the list can be divided and a division wasn't selected, display the divided list */}
                    {(listDivName && !div) && listDiv.map((d) => {
                        const parts = selected.filter((e) => e[listDivName] === d.name);
                        const correctParts = answered.filter((e) => e[listDivName] === d.name);
                        return (
                            <View key={d.name} style={styles.list_div_container}>
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
            {selected && showMap && div===null && listDiv !== null &&
                <ScrollView
                    horizontal={true}
                    pagingEnabled={true}
                    showsHorizontalScrollIndicator={false}
                >
                {listDiv.map((d) => {
                    const parts = selected.filter((e) => e[listDivName] === d.name);
                    const correctParts = answered.filter((e) => e[listDivName] === d.name);
                    return (
                        <View key={d.name} style={styles.scroll_map_container}>
                            <View style={styles.list_div_title}>
                                <Text style={styles.list_div_title_text}>{d.title}</Text>
                                <Text style={styles.list_div_title_text}>{`${correctParts.length}/${parts.length}`}</Text>
                            </View>
                            <Map selected={answered} pack={pack} div={d.name} divOption={d.name} type={"Test"}/>
                        </View>
                    )
                })}
                </ScrollView>
            }

            {selected && showMap && (div !== null || listDiv === null) &&
                <View style={styles.map_container}>
                    <Map selected={answered} pack={pack} div={div} divOption={divOption} type={"Test"}/>
                </View>
            }

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
        // backgroundColor: colors.lightPurple,
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

    timer_circle: {
        borderColor: 'white',
        borderWidth: 2,
        borderRadius: 50,
        height: '100%',
        aspectRatio: 1/1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    timer_text: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
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
        backgroundColor: colors.lightPurple,
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
        paddingHorizontal: 10,
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

    // Results

    results_container: {
        flex: 1,
        gap: 5,
    },

    missed_title_container: {
        height: '5%',
        paddingHorizontal: 20,
        justifyContent: 'flex-end',
        borderBottomWidth: 2,
        borderBottomColor: 'rgba(255,255,255,1)',
        paddingBottom: 5,
    },

    perfect_container: {
        height: '30%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    perfect_text: {
        color: 'white',
        fontSize: 25,
        fontWeight: '700'
    },

    missed_container: {
        height: '30%',
        paddingHorizontal: 30,
    },

    missed_item: {
        color: 'white',
        paddingVertical: 2
    },

    end_button_container: {
        height: '20%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        borderTopWidth: 2,
        borderTopColor: 'rgba(255,255,255,1)',
    },

    end_button: {
        minWidth: '40%',
        paddingVertical: 20,
        backgroundColor: colors.lightPurple,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5
    },

    end_button_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600'
    },

    map_container: {
        // backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
    },

    scroll_map_container: {
        width: screenWidth,
        paddingTop: 20,
    }

});