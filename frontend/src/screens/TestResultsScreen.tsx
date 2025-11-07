import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/core';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '../util/colors';
import { useTest } from '../hooks/useRedux';
import { resetTest, initializeTest } from '../store/slices/testSlice';

import type { PackageAttribute, PackageItem, Images } from '../types/package';
import type { TestItemResult } from '../types/test';
import { TestResultsScreenNavigationProp } from 'types/navigation';

type AttributeDetailsProps = {
    itemResult: TestItemResult;
    getAttributeTitle: (attributeName: string) => string;
    getAttribute: (attributeName: string) => PackageAttribute | undefined;
    images: Images;
};

const AttributeDetails: React.FC<AttributeDetailsProps> = ({
    itemResult,
    getAttributeTitle,
    getAttribute,
    images,
}) => {
    const hasImageAttributes = itemResult.attributeResults.some(attr => {
        const packageAttr = getAttribute(attr.attributeName);
        return packageAttr && packageAttr.type === 'image';
    });

    return (
        <View style={styles.attributes_container}>
            <View style={styles.attributes_content}>
                <View style={styles.left_attributes}>
                    {itemResult.attributeResults
                        .filter(attr => {
                            const packageAttr = getAttribute(attr.attributeName);
                            return (
                                packageAttr &&
                                (packageAttr.type === 'string' || packageAttr.type === 'number') &&
                                attr.attributeName !== 'name'
                            );
                        })
                        .map((attr, attrIndex) => (
                            <View key={attrIndex} style={styles.attribute_row}>
                                <Text style={styles.attribute_name}>
                                    {getAttributeTitle(attr.attributeName)}:
                                </Text>
                                <View style={styles.attribute_answer_container}>
                                    <Text
                                        style={[
                                            styles.attribute_answer,
                                            attr.correct ? styles.correct_answer : styles.incorrect_answer,
                                        ]}
                                    >
                                        {attr.input}
                                    </Text>
                                    {!attr.correct && (
                                        <Text style={attr.answered ? styles.correct_answer : styles.incorrect_answer}>
                                            {' → '}{attr.answer}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                </View>

                {hasImageAttributes && (
                    <View style={styles.right_images}>
                        {itemResult.attributeResults
                            .filter(attr => {
                                const packageAttr = getAttribute(attr.attributeName);
                                return packageAttr && packageAttr.type === 'image';
                            })
                            .map((attr, attrIndex) => {
                                const correctItemName = attr.answer as string;
                                const correctImage = correctItemName && images ? images[correctItemName] : null;

                                return (
                                    <View key={attrIndex} style={styles.result_image_container}>
                                        <Text style={styles.attribute_name}>
                                            {getAttributeTitle(attr.attributeName)}:
                                        </Text>
                                        <View
                                            style={[
                                                styles.result_image_placeholder,
                                                attr.correct ? styles.result_image_correct : styles.result_image_incorrect,
                                            ]}
                                        >
                                            {correctImage ? (
                                                <Image
                                                    source={correctImage.image}
                                                    style={styles.result_image}
                                                    resizeMode="contain"
                                                />
                                            ) : (
                                                <Text style={styles.question_mark}>?</Text>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                    </View>
                )}
            </View>
        </View>
    );
};

type ItemResultCardProps = {
    itemResult: TestItemResult;
    totalAttributes: number;
    onlyNameSelected: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    getAttributeTitle: (attributeName: string) => string;
    getAttribute: (attributeName: string) => PackageAttribute | undefined;
    images: Images;
};

const ItemResultCard: React.FC<ItemResultCardProps> = ({
    itemResult,
    totalAttributes,
    onlyNameSelected,
    isExpanded,
    onToggle,
    getAttributeTitle,
    getAttribute,
    images,
}) => {
    const correct = itemResult.attributeResults.filter(attr => attr.correct).length;
    const itemName = itemResult.itemName;

    if (onlyNameSelected) {
        return (
            <View style={styles.item_result}>
                <View style={styles.item_header_touchable}>
                    <View style={styles.item_header}>
                        <Text style={styles.item_name}>{itemName}</Text>
                        <View style={styles.item_header_right}>
                            <Text style={styles.item_score}>
                                {correct}/{totalAttributes}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.item_result}>
            <TouchableOpacity
                style={styles.item_header_touchable}
                onPress={onToggle}
            >
                <View style={styles.item_header}>
                    <Text style={styles.item_name}>{itemName}</Text>
                    <View style={styles.item_header_right}>
                        <Text style={styles.item_score}>
                            {correct}/{totalAttributes}
                        </Text>
                        <Text style={styles.expand_indicator}>
                            {isExpanded ? '▼' : '▶'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
            {isExpanded && (
                <AttributeDetails
                    itemResult={itemResult}
                    getAttributeTitle={getAttributeTitle}
                    getAttribute={getAttribute}
                    images={images}
                />
            )}
        </View>
    );
};

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
    const selectedAttributes = test.selectedAttributes;
    const images = test.images;
    const filteredItems = test.filteredItems;

    const totalAttributes: number = selectedAttributes.length;

    // Check if only name attribute is selected
    const onlyNameSelected = selectedAttributes.length === 1 && selectedAttributes[0].name === 'name';

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
     * Get attribute title from packageInfo
     */
    function getAttributeTitle(attributeName: string): string {
        const attr = packageInfo?.attributes?.find((a: PackageAttribute) => a.name === attributeName);
        return attr?.title || attributeName;
    }

    /**
     * Get attribute from packageInfo
     */
    function getAttribute(attributeName: string): PackageAttribute | undefined {
        return packageInfo?.attributes?.find((a: PackageAttribute) => a.name === attributeName);
    }

    /**
     * Get attribute value from filtered items for a given item name
     */
    function getAttributeValue(attributeName: string, itemName: string): string | number | undefined {
        if (!filteredItems || filteredItems.length === 0) {
            return undefined;
        }

        const item = filteredItems.find((filteredItem: PackageItem) => filteredItem.name === itemName);
        if (!item) {
            return undefined;
        }

        const value = item[attributeName as keyof PackageItem] as unknown;

        if (typeof value === 'string' || typeof value === 'number') {
            return value;
        }

        return undefined;
    }

    /**
     * Checks if we should group by test_division
     */
    function shouldGroupByDivision(): boolean {
        return !!(packageInfo?.test_division && !test.division);
    }

    /**
     * Sort results by sort_attr if specified in packageInfo
     */
    function sortResults(resultsToSort: TestItemResult[]): TestItemResult[] {
        const sortedResults = [...resultsToSort];

        if (packageInfo?.sort_attr) {
            sortedResults.sort((a, b) => {
                const valueA = getAttributeValue(packageInfo.sort_attr, a.itemName);
                const valueB = getAttributeValue(packageInfo.sort_attr, b.itemName);

                if ((valueA === undefined || valueA === null) && (valueB === undefined || valueB === null)) {
                    return 0;
                }

                if (valueA === undefined || valueA === null) {
                    return 1;
                }

                if (valueB === undefined || valueB === null) {
                    return -1;
                }

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

    /**
     * Get the division value for an item by its name
     */
    function getItemDivisionValue(itemName: string): string {
        if (!packageInfo?.test_division || !packageInfo?.items) return '';

        const item = packageInfo.items.find((i: PackageItem) => i.name === itemName);
        return item?.[packageInfo.test_division] || '';
    }

    /**
     * Get the title for a division value
     */
    function getDivisionTitle(divisionValue: string): string {
        if (!packageInfo?.test_division || !packageInfo?.divisions) return divisionValue;

        const division = packageInfo.divisions.find((d: any) => d.name === packageInfo.test_division);
        if (!division) return divisionValue;

        const option = division.options?.find((opt: any) => opt.name === divisionValue);
        return option?.title || divisionValue;
    }

    /**
     * Get statistics for a group of results
     */
    function getGroupStats(resultsGroup: TestItemResult[]): { discovered: number; points: number } {
        const discovered = resultsGroup.length;
        let points = 0;

        resultsGroup.forEach(result => {
            result.attributeResults.forEach(answer => {
                if (answer.correct && answer.answered) {
                    points++;
                }
            });
        });

        return { discovered, points };
    }

    /**
     * Groups results by their test_division value
     */
    function getGroupedResults(): Array<{ divisionValue: string; divisionTitle: string; results: TestItemResult[] }> {
        if (!shouldGroupByDivision() || !packageInfo?.test_division) {
            return [{ divisionValue: '', divisionTitle: '', results: sortResults(results) }];
        }

        // Group results by division value
        const grouped = new Map<string, TestItemResult[]>();

        results.forEach(result => {
            const divisionValue = getItemDivisionValue(result.itemName);
            if (!grouped.has(divisionValue)) {
                grouped.set(divisionValue, []);
            }
            grouped.get(divisionValue)!.push(result);
        });

        // Sort results within each group
        const result: Array<{ divisionValue: string; divisionTitle: string; results: TestItemResult[] }> = [];
        grouped.forEach((resultsGroup, divisionValue) => {
            const divisionTitle = getDivisionTitle(divisionValue);
            result.push({ divisionValue, divisionTitle, results: sortResults(resultsGroup) });
        });

        // Sort groups by division value
        result.sort((a, b) => {
            const valueA = a.divisionValue;
            const valueB = b.divisionValue;

            // Handle numeric sorting
            if (!isNaN(Number(valueA)) && !isNaN(Number(valueB))) {
                return Number(valueA) - Number(valueB);
            }

            // Handle string sorting
            return String(valueA).localeCompare(String(valueB));
        });

        return result;
    }

    const groupedResults = getGroupedResults();
    const showGrouping = shouldGroupByDivision();

    function renderItemResults(resultsToRender: TestItemResult[]) {
        return resultsToRender.map((itemResult, index) => {
            const itemName = itemResult.itemName;
            return (
                <ItemResultCard
                    key={`${itemName}-${index}` || index}
                    itemResult={itemResult}
                    totalAttributes={totalAttributes}
                    onlyNameSelected={onlyNameSelected}
                    isExpanded={expandedItems.has(itemName)}
                    onToggle={() => toggleItem(itemName)}
                    getAttributeTitle={getAttributeTitle}
                    getAttribute={getAttribute}
                    images={images}
                />
            );
        });
    }

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
                    {groupedResults.length === 0 || (groupedResults[0]?.results.length === 0) ? (
                        <View style={styles.empty_container}>
                            <Text style={styles.empty_text}>
                                No results available.
                            </Text>
                        </View>
                    ) : (
                        <>
                            {showGrouping ? (
                                // Render with section headers
                                groupedResults.map((group, groupIndex) => {
                                    const { discovered, points } = getGroupStats(group.results);
                                    return (
                                        <View key={groupIndex}>
                                            {/* Section Header */}
                                            <View style={styles.section_header}>
                                                <View style={styles.section_header_content}>
                                                    <Text style={styles.section_title}>
                                                        {group.divisionTitle || 'Uncategorized'}
                                                    </Text>
                                                    <Text style={styles.section_stats}>
                                                        {discovered} items • {points} pts
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Section Results */}
                                            {renderItemResults(group.results)}
                                        </View>
                                    );
                                })
                            ) : (
                                // Render without section headers
                                renderItemResults(groupedResults[0]?.results ?? [])
                            )}
                        </>
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

    attributes_content: {
        flexDirection: 'row',
        gap: 20,
    },

    left_attributes: {
        flex: 1,
    },

    right_images: {
        width: 200,
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 20,
    },

    result_image_container: {
        marginBottom: 20,
        alignItems: 'center',
    },

    result_image_placeholder: {
        width: 150,
        height: 150,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 10,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },

    result_image_correct: {
        borderColor: '#2ebf44',
    },

    result_image_incorrect: {
        borderColor: '#ed0e0e',
    },

    result_image: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },

    question_mark: {
        fontSize: 60,
        fontWeight: 'bold',
        color: '#999',
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

    section_header: {
        backgroundColor: colors.darkPurple,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginVertical: 10,
        borderRadius: 8,
    },

    section_header_content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    section_title: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
        flex: 1,
    },

    section_stats: {
        fontSize: 14,
        fontWeight: '500',
        color: 'white',
        marginLeft: 10,
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
