import { useNavigation } from '@react-navigation/core';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import LottieView from 'lottie-react-native';

import colors from '../util/colors.js';

import DotsIcon from '../icons/Dots.svg';
import StoreIcon from '../icons/Store.svg';

import env from '../config/env.js';

const HomeScreen = () => {

    const navigation = useNavigation();

    // Game options
    const options = [{ text: "Multiple Choice", nav: "" }, { text: "Write Quiz", nav: "QuizOption" }, { text: "Write Test", nav: "TestOption" }]

    const [isLoading, setLoading] = useState(true);

    useEffect(() => {

    }, []);

    //Called when Tinyshark logo stops animating
    function animationDone() {
        setLoading(false);
    }

    if (isLoading && env.environment === 'production') {
        return (
            <SafeAreaView style={[styles.main_container, { backgroundColor: 'white' }]}>
                <View style={styles.animation_container}>
                    <LottieView
                        autoPlay
                        style={styles.animation}
                        source={require('./TinySharkLogoAnimated.json')}
                        loop={false}
                        onAnimationFinish={animationDone}
                    >
                    </LottieView>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.main_container}>
            <View style={styles.title_container}>
                {/* <Logo style={styles.logo}/> */}
                <Text style={styles.title_text}>Mesmerize</Text>
            </View>
            <View style={styles.options_container}>
                {options.map((option) => {
                    if (option.nav === "") return;
                    return (
                        <TouchableOpacity key={option.nav} style={styles.option} onPress={() => navigation.navigate(option.nav)}>
                            <LinearGradient
                                colors={[colors.lightPurple, colors.lightPurpleShadow]}
                                style={styles.option_inside}
                                dither={false}
                                start={{ x: 0.49, y: 0.3 }}
                                end={{ x: 0.5, y: 1 }}
                            >
                                <Text style={styles.options_text}>{option.text}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )
                })}
            </View>
            <View style={styles.bottom_container}>
                <TouchableOpacity style={styles.icon_container} onPress={() => navigation.navigate("Store")}>
                    <StoreIcon style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon_container} onPress={() => navigation.navigate("Acknowledgements")}>
                    <DotsIcon style={styles.icon} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

}

export default HomeScreen;

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: colors.darkGrey,
    },

    title_container: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center'
    },

    title_text: {
        color: 'white',
        fontSize: 60,
        marginTop: 100,
    },

    logo: {
        width: '80%',
        // height: 'auto',
        aspectRatio: 1,
        // backgroundColor: 'red'
    },

    options_container: {
        flex: 6,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
    },

    option: {
        width: '50%',
        backgroundColor: colors.lightPurple,
        borderRadius: 5,
        shadowColor: '#111111',
        shadowOffset: { width: 2, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
    },

    option_inside: {
        padding: 10,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,

    },

    options_text: {
        fontSize: 20,
        color: 'white',
    },

    bottom_container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
    },

    icon_container: {
        height: '60%',
        aspectRatio: 1,
        backgroundColor: colors.lightPurple,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },

    icon: {
        height: '80%',
        aspectRatio: 1,
        color: 'white',
    },

    animation_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    animation: {
        width: '100%',
        aspectRatio: 1
    },


});