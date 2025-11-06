import React, { useRef } from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useTest } from '../hooks/useRedux';
import { setCurrentView } from '../store/slices/testSlice';
import Map from './Map';

import colors from '../util/colors';
import type { PackageItem } from '../types/package';
import type { TestView } from '../types/test';

const screenWidth = Dimensions.get('window').width;

/**
 * TestMapPanel - Component for displaying discovered items on a map
 * Shows grouped maps by division if test_division exists and no division is selected
 * Shows single map otherwise
 */
const TestMapPanel = React.memo((): React.JSX.Element => {
    const test = useTest();
    const flatListRef = useRef<FlatList<{ divisionValue: string; divisionTitle: string; items: PackageItem[] }>>(null);

    const discoveredItems: PackageItem[] = test.discoveredItems;
    const pack: string | null = test.packageName;
    const div: string | null = test.division;
    const divOption: string | null = test.divisionOption;
    const packageInfo = test.packageInfo;
    const filteredItems: PackageItem[] = test.filteredItems;

    /**
     * Checks if we should group by test_division
     */
    function shouldGroupByDivision(): boolean {
        return !!(packageInfo?.test_division && !div);
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
     * Groups items by their test_division value
     */
    function getGroupedItems(): Array<{ divisionValue: string; divisionTitle: string; items: PackageItem[] }> {
        if (!shouldGroupByDivision() || !packageInfo?.test_division) {
            return [{ divisionValue: '', divisionTitle: '', items: filteredItems }];
        }

        // Group items by division value
        const grouped: Record<string, PackageItem[]> = {};

        filteredItems.forEach(item => {
            const divisionValue = item[packageInfo.test_division!] || '';
            if (!grouped[divisionValue]) {
                grouped[divisionValue] = [];
            }
            grouped[divisionValue].push(item);
        });

        // Create result array with titles
        const result: Array<{ divisionValue: string; divisionTitle: string; items: PackageItem[] }> = [];
        Object.entries(grouped).forEach(([divisionValue, items]) => {
            const divisionTitle = getDivisionTitle(divisionValue);
            result.push({ divisionValue, divisionTitle, items });
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
     * Get discovered items for a specific division value
     */
    function getDiscoveredItemsForDivision(divisionValue: string): PackageItem[] {
        if (!shouldGroupByDivision() || !packageInfo?.test_division) {
            return discoveredItems;
        }

        return discoveredItems.filter(item => item[packageInfo.test_division!] === divisionValue);
    }

    /**
     * Handles view changes
     */
    function onViewChange(view: TestView): void {
        test.dispatch(setCurrentView(view));
    }

    /**
     * Renders a single map item for grouped view
     */
    function renderMapItem({ item: group }: { item: { divisionValue: string; divisionTitle: string; items: PackageItem[] } }): React.JSX.Element {
        const groupDiscoveredItems = getDiscoveredItemsForDivision(group.divisionValue);
        const discoveredCount = groupDiscoveredItems.length;
        const totalCount = group.items.length;

        return (
            <View style={{ width: screenWidth }}>
                <View style={styles.map_group_container}>
                    <View style={styles.section_header}>
                        <View style={styles.section_header_content}>
                            <Text style={styles.section_title}>
                                {group.divisionTitle || 'Uncategorized'}
                            </Text>
                            <Text style={styles.section_stats}>
                                {discoveredCount}/{totalCount}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.map_container}>
                        <Map
                            selected={groupDiscoveredItems}
                            packName={pack || ''}
                            div={div}
                            divOption={group.divisionValue}
                            type="Test"
                        />
                    </View>
                </View>
            </View>
        );
    }

    const groupedItems = getGroupedItems();
    const showGrouping = shouldGroupByDivision();

    // Grouped maps view (test_division exists and no division selected)
    return (
        <View style={styles.container}>
            {!showGrouping ? (
                <View style={styles.map_container}>
                    <Map
                        selected={discoveredItems}
                        packName={pack || ''}
                        div={div}
                        divOption={divOption}
                        type="Test"
                    />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={groupedItems}
                    renderItem={renderMapItem}
                    keyExtractor={(item, index) => item.divisionValue || `group-${index}`}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
                    initialNumToRender={3}
                    windowSize={5}
                    maxToRenderPerBatch={3}
                    removeClippedSubviews
                />
            )}

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
                    onPress={() => onViewChange('list')}
                >
                    <Text style={styles.button_text}>List</Text>
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

TestMapPanel.displayName = 'TestMapPanel';

export default TestMapPanel;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },

    map_container: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },

    map_group_container: {
        flex: 1,
        width: '100%',
    },

    section_header: {
        backgroundColor: colors.darkPurple,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 2,
        borderBottomColor: 'white',
        marginBottom: 10,
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

    button_container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 2,
        borderTopColor: 'white',
        backgroundColor: colors.lightPurple,
    },

    nav_button: {
        padding: 10,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 5,
        width: 100,
        alignItems: 'center',
    },

    button_text: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});
