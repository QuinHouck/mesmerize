import React, { useState, useEffect } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import Modal from "react-native-modal";
import MultiSlider from '@ptomasroos/react-native-multi-slider';

import colors from '../util/colors.js';

import DropDown from '../icons/DropDown.svg';

const QuizOptionScreen = () => {

    const [downloaded, setDownloaded] = useState([]);
    const [selectedPackage, setPackage] = useState(null);

    const [packageInfo, setPackageInfo] = useState(null)

    const [selectedQuestion, setQuestion] = useState(null);
    const [questionType, setQuestionType] = useState(null);
    const [selectedAnswer, setAnswer] = useState(null);
    const [answerType, setAnswerType] = useState(null);

    const [selectedDiv, setSelectedDiv] = useState(null);
    const [selectedDivOption, setDivOption] = useState(null);

    const [showRangeModal, setRangeModal] = useState(false);
    const [ranged, setRanged] = useState(false);
    const [start, setStart] = useState(1);
    const [end, setEnd] = useState(1);

    const [showDivModal, setDivModal] = useState(false);
    const [showPackModal, setPackModal] = useState(false);


    const navigation = useNavigation();

    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        if(selectedPackage){
            getPackageData();
        }
    }, [selectedPackage]);

    useEffect(() => {
        getDownloaded();
    }, []);

    async function getDownloaded(){
        let packs = await AsyncStorage.getItem("packs");
        if(packs && packs !== "[]"){
            packs = JSON.parse(packs);
            setDownloaded(packs);
        } else {
            setLoading(false);
            return;
        }

        let last = await AsyncStorage.getItem("lastQuiz");
        if(!last){
            if(packs.length !== 0) setPackage(packs[0].name);  
        } else {
            last = JSON.parse(last);
            if(packs.map((p) => {return p.name}).includes(last.pack)){
                setPackage(last.pack);
                setSelectedDiv(last.div);
                setDivOption(last.divOptionName);
                setQuestion(last.question);
                setQuestionType(last.questionType);
                setAnswer(last.answer);
                setAnswerType(last.answerType);
            } else {
                setPackage(packs[0].name);
                await AsyncStorage.removeItem("lastQuiz");
            }
        }
    }

    async function getPackageData(){
        try {
            const saved_info = await AsyncStorage.getItem(selectedPackage);
            const info = JSON.parse(saved_info);
            setPackageInfo(info);
            setRanged(false);
            setEnd(info.num);
            // console.log(info);
            setLoading(false);
            // console.log("Info: ", info.divisions[0]);
        } catch (e){
            console.log(e.message);
            console.log("Could not find package");
        }
    }

    async function handleStart(){
        if(!selectedQuestion || !selectedAnswer || (selectedAnswer===selectedQuestion)) return;

        let divName = null;
        if(selectedDiv) divName = selectedDiv.name;

        let divOptionName = null;
        if(selectedDivOption) divOptionName = selectedDivOption.name;

        const gameData = {
            pack: selectedPackage,
            div: selectedDiv,
            divOptionName: selectedDivOption,
            question: selectedQuestion,
            questionType: questionType,
            answer: selectedAnswer,
            answerType: answerType
        }

        await AsyncStorage.setItem("lastQuiz", JSON.stringify(gameData));

        let newItems = [];
        for(const item of packageInfo.items){
            item.weight = 1;
            newItems.push(item);
        }

        let range = {
            ranged: ranged,
            start: start,
            end: end,
            attr: packageInfo.ranged
        }

        navigation.navigate("QuizGame", {pack: packageInfo.name, div: divName, divOption: divOptionName, question: selectedQuestion, questionType: questionType, answer: selectedAnswer, answerType: answerType, range: range, items: newItems});
    }

    async function handleAll(){

    }

    async function handleAnswer(att){
        setAnswer(att.name);
        setAnswerType(att.type);
    }

    async function handleQuestion(att){
        setQuestion(att.name);
        setQuestionType(att.type);
    }

    async function handleDiv(division){
        if(!division){
            setSelectedDiv(null);
            setDivOption(null);
        } else {
            setSelectedDiv(division);
            setDivModal(true);
        } 
        setRanged(false);
    }

    async function handleDivCancel(){
        if(!selectedDivOption){
            setSelectedDiv(null);
        }

        setDivModal(false);
    }

    async function handleDivOption(option){
        setDivOption(option);
        setRanged(false);
        setDivModal(false);
    }

    async function handlePackCancel(){
        setPackModal(false);
    }

    async function handlePackOption(option){
        if(selectedPackage.name !== option.name){
            setPackage(option.name);
            setQuestion(null);
            setAnswer(null);
            setDivOption(null);
            setSelectedDiv(null);
        }
        setPackModal(false);
    }

    async function handleRange(){
        setRangeModal(true);

    }

    async function handleCloseRange(submitted){
        if(submitted){
            setRanged(true);
            setSelectedDiv(null);
        }
        setRangeModal(false);
    }

    function handleSlider(values){
        setStart(values[0]);
        setEnd(values[1]);
    }

    if(isLoading){
        // console.log("Loading");
        return (
            <SafeAreaView style={styles.main_container}>

            </SafeAreaView>
        );
    };

    if(downloaded.length === 0){
        return (
            <SafeAreaView style={styles.main_container}>
                <View style={styles.top_container}>
                    <TouchableOpacity style={styles.title_button} onPress={() => navigation.goBack()}>
                        <Text style={styles.title_button_text}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title_text}>Write Quiz</Text>
                    <View style={styles.title_button}/>
                </View>
                <View style={styles.empty_container}>
                    <Text style={styles.empty_text}>Go to the store to download your first package!</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.main_container}>
            <View style={styles.top_container}>
                <TouchableOpacity style={styles.title_button} onPress={() => navigation.goBack()}>
                    <Text style={styles.title_button_text}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title_text}>Write Quiz</Text>
                <View style={styles.title_button}/>
            </View>
            <View style={styles.package_container}>
                <Text style={styles.title_text}>{packageInfo.title}</Text>
                {downloaded.length > 1 && <TouchableOpacity style={styles.button_container} onPress={() => setPackModal(true)}>
                    <DropDown style={styles.button_icon}/>
                </TouchableOpacity>}
            </View>
            <View style={styles.division_container}>
                <TouchableOpacity style={(!selectedDiv && !ranged) ? styles.division_button_selected : styles.division_button} onPress={() => handleDiv(null)}>
                    <Text style={(selectedDiv === null && !ranged) ? styles.division_button_title_selected : styles.division_button_title}>All</Text>
                </TouchableOpacity>
                {packageInfo.divisions && packageInfo.divisions.map((division) => {
                    return (
                        <TouchableOpacity key={division.title} style={(selectedDiv && selectedDiv.name === division.name) ? styles.division_button_selected : styles.division_button} onPress={() => handleDiv(division)}>
                            <Text style={(selectedDiv && selectedDiv.name === division.name) ? styles.division_button_title_selected : styles.division_button_title}>{(selectedDivOption) ? selectedDivOption.title : division.title}</Text>
                        </TouchableOpacity>
                    )
                })}
                {packageInfo.ranged && 
                <TouchableOpacity style={(!selectedDiv && ranged) ? styles.division_button_selected : styles.division_button} onPress={handleRange}>
                    {(selectedDiv === null && ranged) ? 
                        <Text style={styles.division_button_title_selected}>{`${start} - ${end}`}</Text>
                        :
                        <Text style={styles.division_button_title}>Range</Text>
                    }
                    {/* <Text style={(selectedDiv === null && ranged) ? styles.division_button_title_selected : styles.division_button_title}>Range</Text> */}
                </TouchableOpacity>}
            </View>
            <View style={styles.qa_container}>
                <View style={styles.qa_half_container}>
                    <View style={styles.qa_half_title}>
                        <Text style={styles.section_text}>Question:</Text>
                    </View>
                    <View style={styles.qa_half_option_container}>
                        {packageInfo && packageInfo.attributes.map((att) => {
                            if(att.question){
                                return (
                                    <TouchableOpacity key={att.name} style={(att.name === selectedQuestion) ? styles.qa_half_option_selected : styles.qa_half_option} onPress={() => handleQuestion(att)}>
                                        <Text style={(att.name === selectedQuestion) ? styles.option_text_selected : styles.option_text}>{att.title}</Text>
                                    </TouchableOpacity>
                                )
                            }
                        })}
                    </View>
                </View>
                <View style={styles.qa_half_container}>
                    <View style={styles.qa_half_title}>
                        <Text style={styles.section_text}>Answer:</Text>
                    </View>
                    <View style={styles.qa_half_option_container}>
                        {packageInfo && packageInfo.attributes.map((att) => {
                            if(att.answer){
                                return (
                                    <TouchableOpacity key={att.name} style={(att.name === selectedAnswer) ? styles.qa_half_option_selected : styles.qa_half_option} onPress={() => handleAnswer(att)}>
                                        <Text style={(att.name === selectedAnswer) ? styles.option_text_selected : styles.option_text}>{att.title}</Text>
                                    </TouchableOpacity>
                                )
                            }
                        })}
                    </View>
                </View>
            </View>
            <View style={styles.bottom_container}>
                <TouchableOpacity style={styles.start_button} onPress={handleStart}>
                    <Text style={styles.start_text}>Start</Text>
                </TouchableOpacity>
            </View>
            <Modal 
                isVisible={showDivModal}
                coverScreen={true}
                onBackdropPress={handleDivCancel}
                style={styles.modal_container}
            >
                <View style={styles.modal_options_container}>
                    {selectedDiv && selectedDiv.options.map((option) => {
                        return (
                            <TouchableOpacity key={option.title} style={styles.modal_options_button} onPress={() => handleDivOption(option)}>
                                <Text style={styles.modal_options_text}>{option.title}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </Modal>
            <Modal 
                isVisible={showPackModal}
                coverScreen={true}
                onBackdropPress={handlePackCancel}
                style={styles.modal_container}
            >
                <View style={styles.modal_options_container}>
                    {downloaded && downloaded.map((option) => {
                        return (
                            <TouchableOpacity key={option.name} style={styles.modal_options_button} onPress={() => handlePackOption(option)}>
                                <Text style={styles.modal_options_text}>{option.title}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </Modal>
            <Modal 
                isVisible={showRangeModal}
                coverScreen={true}
                onBackdropPress={() => handleCloseRange(false)}
                style={styles.modal_container}
            >
                <View style={styles.slider_container}>
                    <Text style={styles.slider_text}>{`${start} - ${end}`}</Text>
                    <MultiSlider
                        values={[start, end]}
                        isMarkersSeparated={true}
                        onValuesChange={handleSlider}
                        min={1}
                        max={packageInfo.num}
                        step={1}
                        snapped
                        sliderLength={200}
                        style={styles.slider}
                        unselectedStyle={{
                            backgroundColor: 'white',
                            height: 5,
                        }}
                        selectedStyle={{
                            backgroundColor: colors.darkPurple,
                            height: 5,
                        }}
                    />
                    <TouchableOpacity style={[styles.modal_options_button, {backgroundColor: colors.darkPurple}]} onPress={() => handleCloseRange(true)}>
                        <Text style={styles.modal_options_text}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );

}

export default QuizOptionScreen;

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

    package_container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        maxHeight: 60,
        gap: 10,
        paddingHorizontal: 30,
        paddingVertical: 10,
        backgroundColor: colors.darkPurple
    },

    button_container: {
        height: '75%',
        aspectRatio: 1,
    },

    button_icon: {
        color: 'white',
        height: '100%',
        aspectRatio: 1,
    },

    division_container: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: 30,
        paddingVertical: 10,
        backgroundColor: colors.whitePurple
    },

    division_button: {
        minWidth: '20%',
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 4,
        borderColor: colors.lightPurple
    },

    division_button_selected: {
        minWidth: '20%',
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: colors.lightPurple,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 4,
        borderColor: colors.lightPurple
    },

    division_button_title: {
        color: colors.lightPurple,
        fontSize: 15,
        fontWeight: '600'
    },

    division_button_title_selected: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600'
    },

    qa_container: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },

    qa_half_container: {
        height: '100%',
        width: '50%',
        backgroundColor: colors.whitePurple
    }, 

    qa_half_title: {
        padding: 10,
        alignItems: 'center',
        backgroundColor: colors.darkPurple
    },

    section_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '500'
    },

    qa_half_option_container: {
        alignItems: 'center',
        padding: 20,
        gap: 20,
    },

    qa_half_option_selected: {
        width: '100%',
        paddingVertical: 10,
        backgroundColor: colors.lightPurple,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 4,
        borderColor: colors.lightPurple
    },

    qa_half_option: {
        width: '100%',
        paddingVertical: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 4,
        borderColor: colors.lightPurple
    },

    option_text_selected: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600'
    },

    option_text: {
        color: colors.lightPurple,
        fontSize: 15,
        fontWeight: '600'
    },

    bottom_container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        backgroundColor: colors.whitePurple,
        padding: 10,
    },

    start_button: {
        backgroundColor: colors.darkPurple,
        padding: 10,
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5
    },

    start_text: {
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

    modal_options_container: {
        width: '80%',
        height: '50%',
        backgroundColor: colors.whitePurple,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderRadius: 5,
    },

    modal_options_button: {
        width: '70%',
        paddingVertical: 14,
        backgroundColor: colors.lightPurple,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5
    },

    modal_options_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600'
    },

    empty_container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    empty_text: {
        color: 'white'
    },

    slider: {
        width: '80%',
    },

    slider_container: {
        width: '80%',
        height: '50%',
        backgroundColor: colors.lightPurple,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderRadius: 10,
    },

    slider_text: {
        color: 'white',
        fontSize: 50,
        fontWeight: '700'
    }


});