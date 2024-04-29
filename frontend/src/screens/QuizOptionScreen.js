import React, { useState, useEffect } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';



const QuizOptionScreen = () => {

    const [selectedPackage, setPackage] = useState("");

    const [packageInfo, setPackageInfo] = useState(null)

    const [selectedQuestion, setQuestion] = useState(null);
    const [selectedAnswer, setAnswer] = useState(null);


    const navigation = useNavigation();

    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        getPackageData();
    }, [selectedPackage]);

    async function getPackageData(){
        try {
            const saved_info = await AsyncStorage.getItem("countries");
            const info = JSON.parse(saved_info);
            setPackageInfo(info);
            setLoading(false);
            // console.log("Info: ", info);
        } catch (e){
            console.log(e.message);
            console.log("Could not find package");
        }
    }

    async function handleStart(){
        if(!selectedQuestion || !selectedAnswer || (selectedAnswer===selectedQuestion)) return;
        console.log("Good!")
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
            {/* <View style={styles.division_container}>
                <View style={styles.division_title}>

                </View>
                <View style={styles.division_options_container}>

                </View>
            </View> */}
            <View style={styles.qa_container}>
                <View style={styles.qa_half_container}>
                    <View style={styles.qa_half_title}>
                        <Text style={styles.section_text}>Question:</Text>
                    </View>
                    <View style={styles.qa_half_option_container}>
                        {packageInfo && packageInfo.attributes.map((att) => {
                            if(att.question){
                                return (
                                    <TouchableOpacity style={(att.name === selectedQuestion) ? styles.qa_half_option_selected : styles.qa_half_option} onPress={() => setQuestion(att.name)}>
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
                                    <TouchableOpacity style={(att.name === selectedAnswer) ? styles.qa_half_option_selected : styles.qa_half_option} onPress={() => setAnswer(att.name)}>
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
        </SafeAreaView>
    );

}

export default QuizOptionScreen;

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

    qa_container: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },

    qa_half_container: {
        height: '100%',
        width: '50%',
        backgroundColor: '#e5e0f0'
    }, 

    qa_half_title: {
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#3b2c5e'
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
        backgroundColor: '#745e96',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 4,
        borderColor: '#745e96'
    },

    qa_half_option: {
        width: '100%',
        paddingVertical: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 4,
        borderColor: '#745e96'
    },

    option_text_selected: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600'
    },

    option_text: {
        color: '#745e96',
        fontSize: 15,
        fontWeight: '600'
    },

    bottom_container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        backgroundColor: '#e5e0f0',
        padding: 10,
    },

    start_button: {
        backgroundColor: '#3b2c5e',
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
    }
});