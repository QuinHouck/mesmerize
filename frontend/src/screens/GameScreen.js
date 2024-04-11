import React, { useState, useEffect } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/core';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';



const GameScreen = () => {

    const navigation = useNavigation();

    const [isLoading, setLoading] = useState(true);

    useEffect(() => {

    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Text>Hello Game!</Text>
        </SafeAreaView>
    );

}

export default GameScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "#222222",
    },
});