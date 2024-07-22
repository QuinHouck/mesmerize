import React, { useState, useEffect } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import Modal from "react-native-modal";

import DropDown from '../icons/DropDown.svg';

const TestOptionScreen = () => {

    const [downloaded, setDownloaded] = useState([]);
    const [selectedPackage, setPackage] = useState(null);

    const [packageInfo, setPackageInfo] = useState(null)

    const [selectedDiv, setSelectedDiv] = useState(null);
    const [selectedDivOption, setDivOption] = useState(null);

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

        let last = await AsyncStorage.getItem("lastTest");
        if(!last){
            if(packs.length !== 0) setPackage(packs[0].name);  
        } else {
            last = JSON.parse(last);
            if(packs.map((p) => {return p.name}).includes(last.pack)){
                setPackage(last.pack);
                setSelectedDiv(last.div);
                setDivOption(last.divOptionName);
            } else {
                setPackage(packs[0].name);
                await AsyncStorage.removeItem("lastTest");
            }
        }
    }

    async function getPackageData(){
        try {
            const saved_info = await AsyncStorage.getItem(selectedPackage);
            const info = JSON.parse(saved_info);
            setPackageInfo(info);
            setLoading(false);
            // console.log("Info: ", info.divisions[0]);
        } catch (e){
            console.log(e.message);
            console.log("Could not find package");
        }
    }

    async function handleStart(){

        let divName = null;
        if(selectedDiv) divName = selectedDiv.name;

        let divOptionName = null;
        if(selectedDivOption) divOptionName = selectedDivOption.name;

        let listDiv = null;
        let listDivName = null;
        if(packageInfo.divisions && packageInfo.test_division){
            let found = packageInfo.divisions.find((e) => e.name === packageInfo.test_division);
            // console.log(found);
            if(found && found.options){
                listDivName = packageInfo.test_division;
                listDiv = found.options;
            }
            
        }

        const gameData = {
            pack: selectedPackage,
            div: selectedDiv,
            divOptionName: selectedDivOption
        }

        await AsyncStorage.setItem("lastTest", JSON.stringify(gameData));

        navigation.navigate("TestGame", {pack: packageInfo.name, div: divName, divOption: divOptionName, listDivName: listDivName, listDiv: listDiv, time: packageInfo.test_time, items: packageInfo.items});
    }

    async function handleDiv(division){
        if(!division){
            setSelectedDiv(null);
            setDivOption(null);
        } else {
            setSelectedDiv(division);
            setDivModal(true);
        } 
    }

    async function handleDivCancel(){
        if(!selectedDivOption){
            setSelectedDiv(null);
        }

        setDivModal(false);
    }

    async function handleDivOption(option){
        setDivOption(option);
        setDivModal(false);
    }

    async function handlePackCancel(){
        setPackModal(false);
    }

    async function handlePackOption(option){
        if(selectedPackage.name !== option.name){
            setPackage(option.name);
            setDivOption(null);
            setSelectedDiv(null);
        }
        setPackModal(false);
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
                    <Text style={styles.title_text}>Write Test</Text>
                    <View style={styles.title_button}/>
                </View>
                <View style={styles.empty_container}>
                    <Text style={styles.empty_text}>Go to the store to download your first package!</Text>
                </View>
            </SafeAreaView>
        );
    };

    return (
        <SafeAreaView style={styles.main_container}>
            <View style={styles.top_container}>
                <TouchableOpacity style={styles.title_button} onPress={() => navigation.goBack()}>
                    <Text style={styles.title_button_text}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title_text}>Write Test</Text>
                <View style={styles.title_button}/>
            </View>
            <View style={styles.package_container}>
                <Text style={styles.title_text}>{packageInfo.title}</Text>
                {downloaded.length > 1 && <TouchableOpacity style={styles.button_container} onPress={() => setPackModal(true)}>
                    <DropDown style={styles.button_icon}/>
                </TouchableOpacity>}
            </View>
            <View style={styles.division_container}>
                <TouchableOpacity style={(!selectedDiv) ? styles.division_button_selected : styles.division_button} onPress={() => handleDiv(null)}>
                    <Text style={(selectedDiv === null) ? styles.division_button_title_selected : styles.division_button_title}>All</Text>
                </TouchableOpacity>
                {packageInfo.divisions && packageInfo.divisions.map((division) => {
                    return (
                        <TouchableOpacity key={division.title} style={(selectedDiv && selectedDiv.name === division.name) ? styles.division_button_selected : styles.division_button} onPress={() => handleDiv(division)}>
                            <Text style={(selectedDiv && selectedDiv.name === division.name) ? styles.division_button_title_selected : styles.division_button_title}>{(selectedDivOption) ? selectedDivOption.title : division.title}</Text>
                        </TouchableOpacity>
                    )
                })}
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
        </SafeAreaView>
    );

}

export default TestOptionScreen;

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

    package_container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        maxHeight: 60,
        gap: 10,
        paddingHorizontal: 30,
        paddingVertical: 10,
        backgroundColor: '#3b2c5e'
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
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        gap: 30,
        paddingVertical: 10,
        backgroundColor: '#e5e0f0'
    },

    division_button: {
        minWidth: '50%',
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 4,
        borderColor: '#745e96'
    },

    division_button_selected: {
        minWidth: '50%',
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: '#745e96',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 4,
        borderColor: '#745e96'
    },

    division_button_title: {
        color: '#745e96',
        fontSize: 20,
        fontWeight: '600'
    },

    division_button_title_selected: {
        color: 'white',
        fontSize: 20,
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
    },

    modal_container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },

    modal_options_container: {
        width: '70%',
        height: '50%',
        backgroundColor: '#e5e0f0',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderRadius: 5,
        borderWidth: 5,
        borderColor: '#745e96'
    },

    modal_options_button: {
        width: '70%',
        paddingVertical: 14,
        backgroundColor: '#745e96',
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

});