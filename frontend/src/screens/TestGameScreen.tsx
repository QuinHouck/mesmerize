import { useIsFocused, useNavigation } from '@react-navigation/core';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTest } from '../hooks/useRedux';

import TestCardsPanel from '../components/TestCardsPanel';
import TestListPanel from '../components/TestListPanel';
import TestMapPanel from '../components/TestMapPanel';
import TestNamePanel from '../components/TestNamePanel';


import {
    endTest
} from '../store/slices/testSlice';

import { TestGameScreenNavigationProp } from 'types/navigation';

/**
 * TestGameScreen - Main test game container
 * Manages timer, pause/end controls, and renders appropriate view panel
 */
const TestGameScreen = () => {
    const navigation = useNavigation<TestGameScreenNavigationProp>();
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
    const testEnded = test.testEnded;
    const testStarted = test.testStarted;

    const [time, setTime] = useState(test_time);
    const [tid, setTid] = useState<NodeJS.Timeout | null>(null);
    const timerRef = useRef(time);

    /**
     * Reset timer when test is restarted
     */
    useEffect(() => {
        if (!testStarted && !testEnded) {
            // Reset timer state for new game
            timerRef.current = test_time;
            setTime(test_time);
            // Clear any existing timer
            if (tid) {
                clearInterval(tid);
                setTid(null);
            }
        }
    }, [testStarted, testEnded, test_time]);

    useEffect(() => {
        if (isComplete()) {
            endGame();
        }
    }, [pointsEarned]);

    /**
     * Start and manage timer
     */
    useEffect(() => {
        if (!testStarted) return;
        timerRef.current = test_time;
        const timerId = setInterval(() => {
            if (testEnded) return;
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
    function addZeros(num: number): string {
        return num.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
    }

    /**
     * Ends the test game
     */
    function endGame(): void {
        if (tid) {
            clearInterval(tid);
        }
        const elapsedTime = test_time - timerRef.current;
        test.dispatch(endTest({ timeElapsed: elapsedTime }));
        navigation.navigate("TestResults");
    }

    function isComplete(): boolean {
        return totalPoints === pointsEarned;
    }


    /**
     * Renders the appropriate panel based on current view
     */
    function renderCurrentView(): React.JSX.Element {
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
                return (
                    <TestMapPanel />
                );
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
                <View style={styles.top_corner_container}>
                    <View style={styles.total_container}>
                        <Text style={styles.totals_text}>Discovered</Text>
                        <Text style={styles.totals_text}>{`${totalDiscovered} / ${totalItems}`}</Text>
                    </View>
                </View>
                <View style={styles.top_mid_container}>
                    <View style={styles.timer_circle}>
                        <Text style={styles.timer_text}>{`${addZeros(Math.floor(time / 60))}:${addZeros(time % 60)}`}</Text>
                    </View>
                </View>
                <View style={[styles.top_corner_container, testEnded ? { justifyContent: 'flex-end' } : {}]}>
                    <TouchableOpacity style={[styles.title_button, { alignSelf: 'flex-end' }]} onPress={endGame}>
                        <Text style={styles.title_button_text}>End</Text>
                    </TouchableOpacity>
                    <View style={[styles.total_container, { alignItems: 'flex-end' }]}>
                        <Text style={styles.totals_text}>Points</Text>
                        <Text style={styles.totals_text}>{`${pointsEarned} / ${totalPoints}`}</Text>
                    </View>
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
    },

    top_mid_container: {
        height: '100%',
        width: '30%',
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

    top_corner_container: {
        height: "100%",
        width: "35%",
        justifyContent: 'flex-end',
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

    total_container: {
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        padding: 10,
        justifyContent: 'flex-end',
    },

    totals_text: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
