import React from 'react';
import {
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

/**
 * TestMapPanel - Component for displaying discovered items on a map
 * Shows grouped maps by division if test_division exists and no division is selected
 * Shows single map otherwise
 */
const TestMapPanel = React.memo((): React.JSX.Element => {
    const test = useTest();
    
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
        const grouped = new Map<string, PackageItem[]>();
        
        filteredItems.forEach(item => {
            const divisionValue = item[packageInfo.test_division!] || '';
            if (!grouped.has(divisionValue)) {
                grouped.set(divisionValue, []);
            }
            grouped.get(divisionValue)!.push(item);
        });

        // Create result array with titles
        const result: Array<{ divisionValue: string; divisionTitle: string; items: PackageItem[] }> = [];
        grouped.forEach((items, divisionValue) => {
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
        
        return (
            <View style={styles.map_group_container}>
                <View style={styles.section_header}>
                    <Text style={styles.section_title}>
                        {group.divisionTitle || 'Uncategorized'}
                    </Text>
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
        );
    }

    const groupedItems = getGroupedItems();
    const showGrouping = shouldGroupByDivision();

    // Single map view (no division or division selected)
    if (!showGrouping) {
        return (
            <View style={styles.container}>
                <View style={styles.map_container}>
                    <Map 
                        selected={discoveredItems} 
                        packName={pack || ''} 
                        div={div} 
                        divOption={divOption} 
                        type="Test" 
                    />
                </View>
                
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
                </View>
            </View>
        );
    }

    // Grouped maps view (test_division exists and no division selected)
    return (
        <View style={styles.container}>
            <FlatList
                data={groupedItems}
                renderItem={renderMapItem}
                keyExtractor={(item, index) => item.divisionValue || `group-${index}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatlist_content}
            />
            
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
        height: 400,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },

    flatlist_content: {
        paddingHorizontal: 10,
        paddingTop: 10,
    },

    map_group_container: {
        marginBottom: 20,
    },

    section_header: {
        backgroundColor: colors.darkPurple,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 2,
        borderBottomColor: 'white',
        marginBottom: 10,
    },

    section_title: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
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
