import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView } from 'react-native';

import colors from '../util/colors.js';

import PackageService from '../services/package.service';

import DownloadIcon from '../icons/Download.svg';
import UninstallIcon from '../icons/Uninstall.svg';
import UpdateIcon from '../icons/Update.svg';

const StoreScreen = () => {

    const [available, setAvailable] = useState([]);
    const [selected, setSelected] = useState("");

    const [downloaded, setDownloaded] = useState([]);

    const navigation = useNavigation();

    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        // getAvailablePackages();
        // getDownloaded();
        loadStore();
        // AsyncStorage.removeItem("packs");
    }, [selected]);

    async function loadStore(){
        try {
            const response = await PackageService.getAvailable();

            let avail = response.data;
            
            let packs = await AsyncStorage.getItem("packs");
            let newPacks = [];
            if(packs){
                packs = JSON.parse(packs);
                let names = response.data.map((d) => {return d.name});
                for(const pack of packs){
                    let idx = names.indexOf(pack.name);
                    let data = avail[idx];
                    data.updateable = false;
                    if(data.version !== pack.version){
                        data.updateable = true;
                    }
                    newPacks.push(data);
                }

            }

            setAvailable(avail);
            setDownloaded(newPacks);

        } catch(error) {
            console.log("Error: ", error);
            // console.log("Res: ", error.response);
        }
    }

    async function getAvailablePackages(){
        try {
            const response = await PackageService.getAvailable();
            // console.log(response.data);
            setAvailable(response.data);
        } catch(error) {
            console.log("Error: ", error);
            // console.log("Res: ", error.response);
        }
    }

    async function getDownloaded(){
        let packs = await AsyncStorage.getItem("packs");
        if(packs){
            packs = JSON.parse(packs);
        }
        // console.log(packs);
        setDownloaded(packs);
    }

    async function downloadPackage(p){
        try {
            const response = await PackageService.getPackage(p.name);
            // console.log(response.data);

            const packageItems = {
                title: p.title,
                name: p.name,
                attributes: p.attributes,
                divisions: p.divisions,
                accepted: p.accepted,
                test_division: p.test_division,
                test_time: p.test_time,
                ranged: p.ranged,
                num: response.data.length,
                version: p.version,
                items: response.data
            }

            // console.log(packageItems);
            await AsyncStorage.setItem(packageItems.name, JSON.stringify(packageItems));
            await addPackage(packageItems);
            // console.log("Success!");
            setSelected("");
            
        } catch(error) {
            console.log("Error: ", error);
            // console.log("Res: ", error.response);
        }
    }

    async function addPackage(newPack){
        let packs = await AsyncStorage.getItem("packs");
        if(!packs){
            packs = [];
        } else {
            packs = JSON.parse(packs);
        }

        const data = {
            title: newPack.title,
            name: newPack.name,
            version: newPack.version
        }

        let idx = packs.map(function(e) { return e.name; }).indexOf(newPack.name);
        // console.log(idx);
        if(idx !== -1){
            packs[idx] = data;
        } else {
            packs.push(data);
        }
        await AsyncStorage.setItem("packs", JSON.stringify(packs));
    }

    async function uninstall(pack){
        await AsyncStorage.removeItem(pack.name);
        let idx = downloaded.map((d) => {return d.name}).indexOf(pack.name);
        let newDownloaded = downloaded;
        newDownloaded.splice(idx,1);
        await AsyncStorage.setItem("packs", JSON.stringify(newDownloaded));
        setDownloaded(newDownloaded);
        setSelected("");
    }

    return (
        <SafeAreaView style={styles.main_container}>
            <View style={styles.secondary_container}>
               <View style={styles.top_container}>
                <TouchableOpacity style={styles.title_button} onPress={() => navigation.goBack()}>
                    <Text style={styles.title_button_text}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title_text}>Store</Text>
                <View style={styles.title_button}/>
            </View>
            <View style={styles.store_text_container}>
                <Text style={styles.store_text}>Available</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scroll_container}>
                <View style={styles.package_options_container}>
                   {available.map((p) => {
                        if(downloaded.map((d) => {return d.name}).includes(p.name)) return;
                        if(selected !== p.name){
                            return (
                                <TouchableOpacity key={p.name} style={styles.package_option} onPress={() => setSelected(p.name)}>
                                    <Text style={styles.package_title_text}>{p.title}</Text>
                                </TouchableOpacity> 
                            ); 
                        } else {
                            return (
                                <TouchableOpacity key={p.name} style={styles.package_option_selected} onPress={() => setSelected("")}>
                                    <Text style={styles.package_title_selected_text}>{p.title}</Text>
                                    <TouchableOpacity onPress={() => downloadPackage(p)}>
                                        <DownloadIcon style={styles.icon}/>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ); 
                        }
                        
                    })} 
                </View>
            </ScrollView>
            <View style={styles.store_text_container}>
                <Text style={styles.store_text}>Downloaded</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scroll_container}>
                <View style={styles.package_options_container}>
                   {downloaded.map((p) => {
                        if(selected !== p.name){
                            return (
                                <TouchableOpacity key={p.name} style={styles.package_option} onPress={() => setSelected(p.name)}>
                                    <Text style={styles.package_title_text}>{p.title}</Text>
                                </TouchableOpacity> 
                            ); 
                        } else {
                            return (
                                <TouchableOpacity key={p.name} style={styles.package_option_selected} onPress={() => setSelected("")}>
                                    <Text style={styles.package_title_selected_text}>{p.title}</Text>
                                    <View>
                                        {p.updateable && <TouchableOpacity onPress={() => downloadPackage(p)}>
                                            <UpdateIcon style={styles.icon}/>
                                        </TouchableOpacity>}
                                        <TouchableOpacity onPress={() => uninstall(p)}>
                                            <UninstallIcon style={styles.icon}/>
                                        </TouchableOpacity>
                                    </View>
                                    
                                </TouchableOpacity>
                            ); 
                        }
                        
                    })} 
                </View>
            </ScrollView> 
            </View>
            
        </SafeAreaView>
    );

}

export default StoreScreen;

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: colors.darkGrey,
    },

    secondary_container: {
        
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

    scroll_container: {
        // backgroundColor: 'purple',
        alignItems: 'center',
        justifyContent: 'center',
    },

    package_options_container: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        gap: 20,
        // backgroundColor: 'green',
        padding: 20,
    },

    package_option: {
        width: '80%',
        height: 80,
        backgroundColor: colors.lightPurple,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 5,
    },

    package_title_text: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
    },

    package_option_selected: {
        flexDirection: 'row',
        width: '80%',
        height: 80,
        backgroundColor: "white",
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 5,
        padding: 20,
        borderRadius: 5,
    }, 

    package_title_selected_text: {
        color: colors.darkGrey,
        fontSize: 20,
        fontWeight: '700',
    },

    icon: {
        height: '90%',
        aspectRatio: 1,
        color: colors.darkGrey,
    },

    store_text_container: {
        borderBottomColor: 'white',
        borderBottomWidth: 2,
        marginHorizontal: 20,
        marginTop: 20,
        padding: 5,
    },

    store_text: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
        
    },

});