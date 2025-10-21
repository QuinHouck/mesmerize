import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/core';
import { Platform, StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { useTest } from '../hooks/useRedux';

import Map from '../components/Map';
import TestNamePanel from '../components/TestNamePanel';
import TestCardsPanel from '../components/TestCardsPanel';
import TestListPanel from '../components/TestListPanel';

import colors from '../util/colors';

import {
    setCurrentView,
    endTest,
    quickRestartTest,
} from '../store/slices/testSlice';

const screenWidth = Dimensions.get('window').width;

/**
 * TestGameScreen - Main test game container
 * Manages timer, pause/end controls, and renders appropriate view panel
 */
const TestGameScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const test = useTest();
    // Redux state
    const pack = test.packageName;
    const test_time = test.timeLimit;

    const totalItems = test.totalItems;
    const totalPoints = test.totalPoints;
    const pointsEarned = test.pointsEarned;
    const totalDiscovered = test.discoveredItems.length;

    const currentView = test.currentView;
    const gameEnded = test.gameEnded;
    const testStarted = test.testStarted;

    const [time, setTime] = useState(test_time);
    const [tid, setTid] = useState(null);
    const timerRef = useRef(time);

    /**
     * Initialize test when component mounts or becomes focused
     */
    useEffect(() => {

    }, [testStarted, isFocused]);

    /**
     * Start and manage timer
     */
    useEffect(() => {
        if (!testStarted) return;
        timerRef.current = test_time;
        const timerId = setInterval(() => {
            if (gameEnded) return;
            timerRef.current -= 1;
            if (timerRef.current < 0) {
                clearInterval(timerId);
                endGame();
            } else {
                setTime(timerRef.current);
            }
        }, 1000);
        setTid(timerId);
        return () => {
            clearInterval(timerId);
            if (tid) clearInterval(tid);
        };
    }, [testStarted]);


    /**
     * Formats numbers with leading zeros for timer display
     */
    function addZeros(num) {
        return num.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
    }

    /**
     * Ends the test game
     */
    function endGame() {
        if (tid) {
            clearInterval(tid);
        }
        test.dispatch(endTest());
        navigation.navigate("TestOption");
        // navigation.navigate("TestResults");
    }


    /**
     * Handles view changes
     */
    function handleViewChange(newView) {
        test.dispatch(setCurrentView(newView));
    }

    /**
     * Renders the appropriate panel based on current view
     */
    function renderCurrentView() {

        switch (currentView) {
            case 'cards':
                return (
                    <TestCardsPanel />
                );
            case 'list':
                return (
                    <TestListPanel />
                );
            case 'map':
                return renderMapView();
            case 'name':
            default:
                return (
                    <TestNamePanel />
                );
        }
    }

    return (
        <SafeAreaView style={styles.main_container}>
            {/* Top Bar with Timer and Controls */}
            <View style={styles.top_container}>
                <View style={[styles.top_left_container, currentView === 'map' ? { justifyContent: 'space-between' } : { justifyContent: 'flex-end' }]}>

                </View>
                <View style={styles.top_mid_container}>
                    <View style={styles.timer_circle}>
                        <Text style={styles.timer_text}>{`${addZeros(Math.floor(time / 60))}:${addZeros(time % 60)}`}</Text>
                    </View>
                </View>
                <View style={[styles.top_right_container, gameEnded ? { justifyContent: 'flex-end' } : {}]}>
                    <TouchableOpacity style={[styles.title_button, { alignSelf: 'flex-end' }]} onPress={endGame}>
                        <Text style={styles.title_button_text}>End</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Render Current View */}
            {renderCurrentView()}
        </SafeAreaView>
    );
};

export default TestGameScreen;

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "#222222",
    },

    loading_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loading_text: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },

    top_container: {
        flexDirection: 'row',
        height: 100,
        width: '100%',
        justifyContent: 'space-between',
        paddingVertical: 10,
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
        aspectRatio: 1 / 1,
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

    // Results Screen
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

    // Map View
    map_container: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    scroll_map_container: {
        width: screenWidth,
        paddingTop: 20,
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
});
