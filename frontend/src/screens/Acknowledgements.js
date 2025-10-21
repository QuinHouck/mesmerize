import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/core';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Linking } from 'react-native';

import colors from '../util/colors';


const Acknowledgements = () => {

    const navigation = useNavigation();

    const data = [
        {
            title: "Countries of the World",
            acks: [
                {
                    title: "Country Data",
                    type: "link",
                    text: "https://github.com/dr5hn/countries-states-cities-database/blob/master/csv/countries.csv"
                },
                {
                    title: "World Flags",
                    type: "link",
                    text: "https://flagpedia.net/download/vector"
                },
                {
                    title: "World Maps",
                    type: "link",
                    text: "https://www.amcharts.com/svg-maps/"
                }
            ]
        },
        {
            title: "Presidents",
            acks: [
                {
                    title: "President's Data",
                    type: "link",
                    text: "https://www.dolthub.com/repositories/topicalsource/countries/data/main/leaders"
                },
                {
                    title: "President Portraits",
                    type: "link",
                    text: "https://www.loc.gov/free-to-use/presidential-portraits/"
                },
            ]
        },
        {
            title: "Periodic Table",
            acks: [
                {
                    title: "Element Data",
                    type: "link",
                    text: "https://gist.github.com/GoodmanSciences/c2dd862cd38f21b0ad36b8f96b4bf1ee"
                },
            ]
        },
    ]

    return (
        <SafeAreaView style={styles.main_container}>
            <View style={styles.top_container}>
                <TouchableOpacity style={styles.title_button} onPress={() => navigation.goBack()}>
                    <Text style={styles.title_button_text}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title_text}>Acknowledgements</Text>
                <View style={styles.title_button}/>
            </View>
            <ScrollView style={styles.scroll_container}>
                <View>
                    <View style={styles.thanks_container}>
                        <Text style={styles.thanks_text}>Special thanks to Michael Majewski and his app: "World Quiz: Learn Geography"</Text>
                        <Text style={styles.thanks_text}>Michael's app was the inspiration for my app and I wanted to expand on the idea to help memorize other things.</Text>
                        <Text style={styles.thanks_text}>My app has the same look and feel as Michael's as I found this design the best for my own learning!</Text>
                    </View>
                    {data.map((item) => {
                        return (
                            <View key={item.title} style={styles.pack_container}>
                                <View style={styles.pack_title_container}>
                                    <Text style={styles.pack_title_text}>{item.title}</Text>
                                </View>
                                {item.acks && item.acks.map((ack) => {
                                    return (
                                        <View key={ack.title} style={styles.ack_container}>
                                            <Text style={styles.ack_text} onPress={() => Linking.openURL(ack.text)}>{ack.title}</Text> 
                                        </View>
                                    )
                                })}
                            </View> 
                        )
                        
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );

}

export default Acknowledgements;

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

    thanks_container: {
        padding: 10,
        gap: 10,
    },

    thanks_text: {
        fontSize: 15,
    },

    scroll_container: {
        backgroundColor: colors.whitePurple,
    },

    pack_container: {

    },

    pack_title_container: {
        backgroundColor: colors.darkPurple,
        padding: 10,
        margin: 5,
        borderRadius: 10,
    },

    pack_title_text: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700'
    },

    ack_container: {
        padding: 10,
        // gap: 5,
    },

    ack_text: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2667b5'
    },

    

});