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
    const filteredItems: PackageItem[] = test.filteredItems;
    const totalItems: number = test.totalItems;
    const results: TestItemResult[] = test.results;
    const attributes: PackageAttribute[] = test.selectedAttributes;
    const packageInfo = test.packageInfo;

    function onViewChange(view: TestView): void {
        test.dispatch(setCurrentView(view));
    }

    /**
     * Checks if an item has been discovered
     */
    function isItemDiscovered(itemName: string): boolean {
        return discoveredItems.some(item => item.name === itemName);
    }

    /**
     * Gets the score for a specific item
     * For undiscovered items, returns 0/total attributes
     */
    function getItemScore(itemName: string): { correct: number; total: number } {
        const isDiscovered = isItemDiscovered(itemName);

        if (!isDiscovered) {
            // Only count string and number attributes (exclude 'name')
            const validAttributes = attributes.filter(
                attr => attr.type === 'string' || attr.type === 'number'
            );
            return { correct: 0, total: validAttributes.length };
        }

        const result = results?.find(r => r.itemName === itemName);
        if (!result) return { correct: 0, total: 0 };

        const correctCount = result.attributeResults.filter(a => a.correct).length;
        const totalCount = result.attributeResults.length;

        return { correct: correctCount, total: totalCount };
    }

    /**
     * Sorts items by the sort_attr if specified
     */
    function sortItems(items: PackageItem[]): PackageItem[] {
        const sortedItems = [...items];

        if (packageInfo?.sort_attr) {
            sortedItems.sort((a, b) => {
                const valueA = a[packageInfo.sort_attr!];
                const valueB = b[packageInfo.sort_attr!];

                // Handle numeric sorting
                if (typeof valueA === 'number' && typeof valueB === 'number') {
                    return valueA - valueB;
                }

                // Handle string sorting
                return String(valueA || '').localeCompare(String(valueB || ''));
            });
        }

        return sortedItems;
    }

    /**
     * Checks if we should group by test_division
     */
    function shouldGroupByDivision(): boolean {
        return !!(packageInfo?.test_division && !test.division);
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
     * Get statistics for a group of items
     */
    function getGroupStats(itemsGroup: PackageItem[]): { discovered: number; correct: number; total: number } {
        const discovered = itemsGroup.filter(item => isItemDiscovered(item.name)).length;
        
        let correct = 0;
        const validAttributes = attributes.filter(
            attr => attr.type === 'string' || attr.type === 'number'
        );
        const total = itemsGroup.length * validAttributes.length;

        itemsGroup.forEach(item => {
            if (isItemDiscovered(item.name)) {
                const result = results?.find(r => r.itemName === item.name);
                if (result) {
                    result.attributeResults.forEach(answer => {
                        if (answer.correct) correct++;
                    });
                }
            }
        });

        return { discovered, correct, total };
    }

    /**
     * Groups items by their test_division value
     */
    function getGroupedItems(): Array<{ divisionValue: string; divisionTitle: string; items: PackageItem[] }> {
        if (!shouldGroupByDivision() || !packageInfo?.test_division) {
            return [{ divisionValue: '', divisionTitle: '', items: sortItems(filteredItems) }];
        }

        // Group items by division value
        const grouped = new Map<string, PackageItem[]>();
        
        filteredItems.forEach(item => {
            const divisionValue = item[packageInfo.test_division!] || '';
            if (!grouped.has(divisionValue)) {
                grouped.set(divisionValue, []);
            }
            grouped.get(divisionValue)!.push(item);
        });

        // Sort items within each group
        const result: Array<{ divisionValue: string; divisionTitle: string; items: PackageItem[] }> = [];
        grouped.forEach((items, divisionValue) => {
            const divisionTitle = getDivisionTitle(divisionValue);
            result.push({ divisionValue, divisionTitle, items: sortItems(items) });
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

    /**
     * Renders a single item in the list
     */
    function renderListItem(item: PackageItem, index: number): React.ReactElement {
        const isDiscovered = isItemDiscovered(item.name);
        const { correct, total } = getItemScore(item.name);

        return (
            <View key={item._id || index} style={styles.list_item}>
                <Text style={[styles.item_name, !isDiscovered && styles.item_name_undiscovered]}>
                    {isDiscovered ? item.name : '?'}
                </Text>
                <Text style={styles.item_score}>{`${correct}/${total}`}</Text>
            </View>
        );
    }

    const groupedItems = getGroupedItems();
    const showGrouping = shouldGroupByDivision();

    function renderGroupedList(): React.ReactElement {
        return (
            <>
                {groupedItems.map((group, groupIndex) => {
                    const { discovered, correct, total } = getGroupStats(group.items);
                    
                    return (
                        <View key={groupIndex}>
                            {/* Section Header */}
                            <View style={styles.section_header}>
                                <View style={styles.section_header_content}>
                                    <Text style={styles.section_title}>
                                        {group.divisionTitle || 'Uncategorized'}
                                    </Text>
                                    <Text style={styles.section_stats}>
                                        {discovered}/{group.items.length} • {correct}/{total}
                                    </Text>
                                </View>
                            </View>

                            {/* Section Items */}
                            {group.items.map((item, index) => renderListItem(item, index))}
                        </View>
                    );
                })}
            </>
        );
    }

    function renderUngroupedList(): React.ReactElement {
        const items = groupedItems[0]?.items || [];

        return (
            <>
                {items.length === 0 ? (
                    <View style={styles.empty_container}>
                        <Text style={styles.empty_text}>
                            No items available.
                        </Text>
                    </View>
                ) : (
                    items.map((item, index) => renderListItem(item, index))
                )}
            </>
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

            {/* List of All Items */}
            <ScrollView style={styles.list_container} showsVerticalScrollIndicator={false}>
                {showGrouping ? renderGroupedList() : renderUngroupedList()}
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

    item_name_undiscovered: {
        color: 'rgba(255, 255, 255, 0.5)',
    },

    item_score: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },

    section_header: {
        backgroundColor: colors.darkPurple,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 2,
        borderBottomColor: 'white',
        marginTop: 10,
    },

    section_header_content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    section_title: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
    },

    section_stats: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
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
