import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/core';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';

import colors from '../util/colors';
import { useTest } from '../hooks/useRedux';
import { resetTest, initializeTest } from '../store/slices/testSlice';

import type { PackageAttribute, PackageItem } from '../types/package';
import type { TestItemResult } from '../types/test';
import { TestResultsScreenNavigationProp } from 'types/navigation';

const TestResultsScreen = () => {
    // Redux hooks
    const test = useTest();
    const navigation = useNavigation<TestResultsScreenNavigationProp>();

    // Redux state
    const results: TestItemResult[] = test.results;
    const totalPoints: number = test.totalPoints;
    const pointsEarned: number = test.pointsEarned;
    const discoveredItems: PackageItem[] = test.discoveredItems;
    const timeElapsed: number = test.timeElapsed;
    const packageInfo = test.packageInfo;

    // Local state for expanded items
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    // Calculate statistics
    const score = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;

    async function handlePlay(): Promise<void> {
        // Get the current test settings
        const division = test.division;
        const divisionOption = test.divisionOption;
        const filteredItems = test.filteredItems;
        const timeLimit = test.timeLimit;
        const selectedAttributes = test.selectedAttributes;

        // Reinitialize the test with the same settings
        test.dispatch(initializeTest({
            division: division,
            divisionOption: divisionOption,
            filteredItems: filteredItems,
            timeLimit: timeLimit,
            selectedAttributes: selectedAttributes,
        }));

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

    /**
     * Toggle expanded state for an item
     */
    function toggleItem(itemName: string): void {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemName)) {
            newExpanded.delete(itemName);
        } else {
            newExpanded.add(itemName);
        }
        setExpandedItems(newExpanded);
    }

    /**
     * Format time in mm:ss format
     */
    function formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    /**
     * Get item score (correct/total)
     */
    function getItemScore(itemName: string): { correct: number; total: number } {
        const result = results.find(r => r.itemName === itemName);
        if (!result) return { correct: 0, total: 0 };

        const correctCount = result.attributeResults.filter(a => a.correct).length;
        const totalCount = result.attributeResults.filter(a => a.answered).length;

        return { correct: correctCount, total: totalCount };
    }

    /**
     * Get attribute title from packageInfo
     */
    function getAttributeTitle(attributeName: string): string {
        const attr = packageInfo?.attributes?.find((a: PackageAttribute) => a.name === attributeName);
        return attr?.title || attributeName;
    }

    /**
     * Sort results by sort_attr if specified in packageInfo
     */
    function getSortedResults(): TestItemResult[] {
        const sortedResults = [...results];
        
        if (packageInfo?.sort_attr) {
            sortedResults.sort((a, b) => {
                // Get the attribute result for the sort attribute
                const attrA = a.attributeResults.find(ar => ar.attributeName === packageInfo.sort_attr);
                const attrB = b.attributeResults.find(ar => ar.attributeName === packageInfo.sort_attr);
                
                const valueA = attrA?.answer || '';
                const valueB = attrB?.answer || '';
                
                // Handle numeric sorting
                if (typeof valueA === 'number' && typeof valueB === 'number') {
                    return valueA - valueB;
                }
                
                // Handle string sorting
                return String(valueA).localeCompare(String(valueB));
            });
        }
        
        return sortedResults;
    }

    const sortedResults = getSortedResults();

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
                            <Text style={styles.stat_value}>{formatTime(timeElapsed)}</Text>
                            <Text style={styles.stat_label}>Time</Text>
                        </View>
                        <View style={styles.stat_item}>
                            <Text style={styles.stat_value}>{score}%</Text>
                            <Text style={styles.stat_label}>Score</Text>
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

                {/* Item Results List */}
                <ScrollView style={styles.detailed_results}>
                    <Text style={styles.results_title}>Test Results</Text>
                    {sortedResults.length === 0 ? (
                        <View style={styles.empty_container}>
                            <Text style={styles.empty_text}>
                                No results available.
                            </Text>
                        </View>
                    ) : (
                        sortedResults.map((itemResult, index) => {
                            const itemName = itemResult.itemName;
                            const isExpanded = expandedItems.has(itemName);
                            const { correct, total } = getItemScore(itemName);

                            return (
                                <View key={itemName || index} style={styles.item_result}>
                                    <TouchableOpacity
                                        style={styles.item_header_touchable}
                                        onPress={() => toggleItem(itemName)}
                                    >
                                        <View style={styles.item_header}>
                                            <Text style={styles.item_name}>{itemName}</Text>
                                            <View style={styles.item_header_right}>
                                                <Text style={styles.item_score}>
                                                    {correct}/{total}
                                                </Text>
                                                <Text style={styles.expand_indicator}>
                                                    {isExpanded ? '▼' : '▶'}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    {/* Expanded attributes view */}
                                    {isExpanded && (
                                        <View style={styles.attributes_container}>
                                            {itemResult.attributeResults.map((attr, attrIndex) => {
                                                if (attr.attributeName === 'name') {
                                                    return null;
                                                }
                                                return (
                                                    <View key={attrIndex} style={styles.attribute_row}>
                                                        <Text style={styles.attribute_name}>
                                                            {getAttributeTitle(attr.attributeName)}:
                                                        </Text>
                                                        <View style={styles.attribute_answer_container}>
                                                            <>
                                                                <Text
                                                                    style={[
                                                                        styles.attribute_answer,
                                                                        attr.correct
                                                                            ? styles.correct_answer
                                                                            : styles.incorrect_answer,
                                                                    ]}
                                                                >
                                                                    {attr.input}
                                                                </Text>
                                                                {!attr.correct && (
                                                                    <Text style={styles.correct_answer}>
                                                                        {' → '}{attr.answer}
                                                                    </Text>
                                                                )}
                                                            </>
                                                        </View>
                                                    </View>
                                                )
                                            })}
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            </View>
            <View style={styles.bottom_container}>
                <TouchableOpacity style={styles.play_button} onPress={handlePlay}>
                    <Text style={styles.play_text}>Play Again!</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

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
        marginBottom: 10,
        overflow: 'hidden',
    },

    item_header_touchable: {
        paddingHorizontal: 15,
        paddingVertical: 12,
    },

    item_header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    item_header_right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    item_name: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.darkPurple,
        flex: 1,
    },

    item_score: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.lightPurple,
    },

    expand_indicator: {
        fontSize: 14,
        color: colors.darkPurple,
        fontWeight: '500',
    },

    attributes_container: {
        paddingHorizontal: 15,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 12,
        backgroundColor: 'white',
    },

    attribute_row: {
        flexDirection: 'column',
        marginBottom: 10,
    },

    attribute_name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },

    attribute_answer_container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },

    attribute_answer: {
        fontSize: 15,
        fontWeight: '500',
    },

    correct_answer: {
        color: '#2ebf44',
    },

    incorrect_answer: {
        color: '#ed0e0e',
    },

    unanswered_text: {
        fontSize: 15,
        fontWeight: '400',
        color: '#999',
        fontStyle: 'italic',
    },

    empty_container: {
        paddingVertical: 40,
        alignItems: 'center',
    },

    empty_text: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
        textAlign: 'center',
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
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
    },

    play_text: {
        color: 'white',
        fontSize: 30,
        fontWeight: '700',
    },
});
