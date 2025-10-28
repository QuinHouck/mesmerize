import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTest } from '../hooks/useRedux';
import { setCurrentView } from '../store/slices/testSlice';
import type { PackageAttribute, PackageItem } from '../types/package';
import type { TestItemResult, TestView } from '../types/test';

import colors from '../util/colors';

/**
 * TestListPanel - Component for displaying list of discovered items with their scores
 * Shows progress, correct attributes, and navigation options
 */
const TestListPanel = React.memo(() => {
    const test = useTest();

    const discoveredItems: PackageItem[] = test.discoveredItems;
    const totalItems: number = test.totalItems;
    const results: TestItemResult[] = test.results;
    const attributes: PackageAttribute[] = test.selectedAttributes;

    const division = test.division;
    const divisionOption = test.divisionOption;

    function onViewChange(view: TestView): void {
        test.dispatch(setCurrentView(view));
    }

    /**
     * Calculates total correct attributes across all discovered items
     */
    function getTotalCorrectAttributes(): number {
        let correct = 0;
        results?.forEach(result => {
            result.attributeResults?.forEach(answer => {
                if (answer.correct) correct++;
            });
        });
        return correct;
    }

    /**
     * Calculates total possible attributes for discovered items
     */
    function getTotalPossibleAttributes(): number {
        // Only count string and number attributes
        const validAttributes = attributes.filter(
            attr => attr.type === 'string' || attr.type === 'number'
        );
        return discoveredItems.length * validAttributes.length;
    }

    /**
     * Calculates percentage of correct answers
     */
    function getPercentage(): number {
        const total = getTotalPossibleAttributes();
        if (total === 0) return 0;
        const correct = getTotalCorrectAttributes();
        return Math.floor((correct / total) * 100);
    }

    interface ItemScore {
        correct: number;
        total: number;
    }

    /**
     * Gets the score for a specific item
     */
    function getItemScore(itemName: string): ItemScore {
        const result = results?.find(r => r.itemName === itemName);
        if (!result) return { correct: 0, total: 0 };

        const correctCount = result.attributeResults.filter(a => a.correct).length;
        const totalCount = result.attributeResults.length;

        return { correct: correctCount, total: totalCount };
    }

    /**
     * Renders a single item in the list
     */
    function renderListItem(item: PackageItem, index: number): React.ReactElement {
        const { correct, total } = getItemScore(item.name);

        return (
            <View key={item._id || index} style={styles.list_item}>
                <Text style={styles.item_name}>{item.name}</Text>
                <Text style={styles.item_score}>{`${correct}/${total}`}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Stats */}
            <View style={styles.header}>
                <Text style={styles.header_text}>
                    {`${discoveredItems.length}/${totalItems} Items`}
                </Text>
                <Text style={styles.header_text}>
                    {`${getPercentage()}%`}
                </Text>
            </View>

            {/* List of Discovered Items */}
            <ScrollView style={styles.list_container} showsVerticalScrollIndicator={false}>
                {discoveredItems.length === 0 ? (
                    <View style={styles.empty_container}>
                        <Text style={styles.empty_text}>
                            No items discovered yet!{'\n'}
                            Go back to name view to start discovering.
                        </Text>
                    </View>
                ) : (
                    discoveredItems.map((item, index) => renderListItem(item, index))
                )}
            </ScrollView>

            {/* Navigation Buttons */}
            <View style={styles.button_container}>
                <TouchableOpacity
                    style={styles.nav_button}
                    onPress={() => onViewChange('name')}
                >
                    <Text style={styles.button_text}>Names</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.nav_button}
                    onPress={() => onViewChange('cards')}
                >
                    <Text style={styles.button_text}>Cards</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

TestListPanel.displayName = 'TestListPanel';

export default TestListPanel;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 2,
        borderBottomColor: 'white',
        backgroundColor: colors.lightPurple,
    },

    header_text: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },

    list_container: {
        flex: 1,
        paddingHorizontal: 10,
    },

    list_item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },

    item_name: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },

    item_score: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },

    empty_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },

    empty_text: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 28,
    },

    button_container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 2,
        borderTopColor: 'white',
        backgroundColor: colors.lightPurple,
    },

    nav_button: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 5,
        minWidth: 120,
        alignItems: 'center',
    },

    button_text: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});
