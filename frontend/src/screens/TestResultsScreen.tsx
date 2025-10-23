import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/core';
import { Keyboard, Platform, StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, TextInput, KeyboardAvoidingView, ScrollView } from 'react-native';
import Modal from "react-native-modal";

import colors from '../util/colors';
import { useTest, useUser } from '../hooks/useRedux';
import { resetTest, quickRestartTest } from '../store/slices/testSlice';

import type { TestResult } from '../types/test';
import type { PackageInfo, PackageItem } from '../types/package';
import { TestResultsScreenNavigationProp } from 'types/navigation';

const TestResultsScreen = () => {
    // Redux hooks
    const test = useTest();
    const user = useUser();
    const navigation = useNavigation<TestResultsScreenNavigationProp>();

    // Redux state
    const results: TestResult[] = test.results;
    const packageInfo: PackageInfo | null = test.packageInfo;
    const totalPoints: number = test.totalPoints;
    const pointsEarned: number = test.pointsEarned;
    const totalItems: number = test.totalItems;
    const discoveredItems: PackageItem[] = test.discoveredItems;

    // Local state
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);

    // Calculate statistics
    const correctAnswers = results.filter(result => result.correct).length;
    const totalAnswers = results.filter(result => result.answered).length;
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    const score = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;

    async function handlePlay(): Promise<void> {
        // Reset game state for a new game
        test.dispatch(quickRestartTest());
        navigation.navigate("TestGame");
    }

    async function handleMenu(): Promise<void> {
        // Reset game state when going back to menu
        test.dispatch(resetTest());

        // Reset navigation stack to remove TestGame and TestResults from history
        navigation.reset({
            index: 0,
            routes: [{ name: "Home" }, { name: "TestOption" }],
        });
    }

    async function handleImage(image: string): Promise<void> {
        setSelectedImage(image);
        setShowModal(true);
    }

    async function handleClose(): Promise<void> {
        setSelectedImage(null);
        setShowModal(false);
    }

    // Group results by item for display
    const resultsByItem = results.reduce((acc: Record<string, TestResult[]>, result) => {
        if (!acc[result.itemName]) {
            acc[result.itemName] = [];
        }
        acc[result.itemName].push(result);
        return acc;
    }, {});

    return (
        <SafeAreaView style={styles.main_container}>
            <View style={styles.top_container}>
                <TouchableOpacity style={styles.title_button} onPress={handleMenu}>
                    <Text style={styles.title_button_text}>Menu</Text>
                </TouchableOpacity>
                <Text style={styles.title_text}>Test Results</Text>
                <View style={styles.title_button} />
            </View>
            <View style={styles.results_container}>
                {/* Score Summary */}
                <View style={styles.score_summary}>
                    <Text style={styles.score_title}>Test Complete!</Text>
                    <View style={styles.score_stats}>
                        <View style={styles.stat_item}>
                            <Text style={styles.stat_value}>{score}%</Text>
                            <Text style={styles.stat_label}>Score</Text>
                        </View>
                        <View style={styles.stat_item}>
                            <Text style={styles.stat_value}>{accuracy}%</Text>
                            <Text style={styles.stat_label}>Accuracy</Text>
                        </View>
                        <View style={styles.stat_item}>
                            <Text style={styles.stat_value}>{discoveredItems.length}</Text>
                            <Text style={styles.stat_label}>Items Found</Text>
                        </View>
                    </View>
                    <Text style={styles.score_details}>
                        {pointsEarned} / {totalPoints} points earned
                    </Text>
                </View>

                {/* Detailed Results */}
                <ScrollView style={styles.detailed_results}>
                    <Text style={styles.results_title}>Detailed Results</Text>
                    {Object.entries(resultsByItem).map(([itemName, itemResults]) => {
                        const itemCorrect = itemResults.filter(r => r.correct).length;
                        const itemTotal = itemResults.filter(r => r.answered).length;
                        const itemAccuracy = itemTotal > 0 ? Math.round((itemCorrect / itemTotal) * 100) : 0;

                        return (
                            <View key={itemName} style={styles.item_result}>
                                <View style={styles.item_header}>
                                    <Text style={styles.item_name}>{itemName}</Text>
                                    <Text style={styles.item_score}>{itemAccuracy}%</Text>
                                </View>
                                {itemResults.map((result, index) => (
                                    <View key={index} style={styles.attribute_result}>
                                        <Text style={styles.attribute_name}>{result.attributeName}:</Text>
                                        <Text style={[
                                            styles.attribute_answer,
                                            result.correct ? styles.correct_answer : styles.incorrect_answer
                                        ]}>
                                            {result.input}
                                        </Text>
                                        {!result.correct && (
                                            <Text style={styles.correct_answer}>
                                                (Correct: {result.answer})
                                            </Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
            <View style={styles.bottom_container}>
                <TouchableOpacity style={styles.play_button} onPress={handlePlay}>
                    <Text style={styles.play_text}>Play Again!</Text>
                </TouchableOpacity>
            </View>

            {/* Image Modal */}
            <Modal
                isVisible={showModal}
                coverScreen={true}
                onBackdropPress={handleClose}
                style={styles.modal_container}
            >
                <View style={styles.modal_image_container}>
                    {selectedImage && (
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.modal_image}
                            resizeMode="contain"
                        />
                    )}
                    <TouchableOpacity style={styles.close_button} onPress={handleClose}>
                        <Text style={styles.close_button_text}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );

}

export default TestResultsScreen;

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
        width: 60,
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

    results_container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white',
    },

    score_summary: {
        backgroundColor: colors.lightPurple,
        padding: 20,
        alignItems: 'center',
    },

    score_title: {
        color: 'white',
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 15,
    },

    score_stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 10,
    },

    stat_item: {
        alignItems: 'center',
    },

    stat_value: {
        color: 'white',
        fontSize: 28,
        fontWeight: '700',
    },

    stat_label: {
        color: 'white',
        fontSize: 14,
        fontWeight: '400',
    },

    score_details: {
        color: 'white',
        fontSize: 16,
        fontWeight: '400',
    },

    detailed_results: {
        flex: 1,
        padding: 15,
    },

    results_title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 15,
        color: colors.darkPurple,
    },

    item_result: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
    },

    item_header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },

    item_name: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.darkPurple,
    },

    item_score: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.lightPurple,
    },

    attribute_result: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        flexWrap: 'wrap',
    },

    attribute_name: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginRight: 8,
    },

    attribute_answer: {
        fontSize: 14,
        fontWeight: '400',
        marginRight: 8,
    },

    correct_answer: {
        color: '#2ebf44',
    },

    incorrect_answer: {
        color: '#ed0e0e',
    },

    row_title: {
        backgroundColor: colors.darkPurple,
        flexDirection: 'row',
        paddingHorizontal: 5,
    },

    row_title_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },

    row_item_container: {
        flexDirection: 'row',
        paddingHorizontal: 5,
    },

    row_item: {
        flex: 1,
        padding: 5,
    },

    row_image_container: {
        justifyContent: 'center',
        alignItems: 'center'
    },

    correct_icon: {
        width: "25%",
        aspectRatio: 1,
        color: '#2ebf44'
    },

    wrong_icon: {
        width: "20%",
        aspectRatio: 1,
        color: '#ed0e0e'
    },

    bottom_container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        backgroundColor: colors.lightPurple,
        padding: 10,
    },

    play_button: {
        backgroundColor: colors.darkPurple,
        padding: 10,
        // width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5
    },

    play_text: {
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

    modal_image_container: {
        width: '90%',
        height: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },

    modal_image: {
        width: '100%',
        height: '80%',
        borderRadius: 8,
    },

    close_button: {
        backgroundColor: colors.lightPurple,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 15,
    },

    close_button_text: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

});