import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useTest } from '../hooks/useRedux';

import colors from '../util/colors';
import { getDistance } from '../util/extraFuncs';

import {
    setCurrentItemIndex,
    setCurrentView,
    submitAttributeAnswer
} from '../store/slices/testSlice';

import Check from '../icons/Check.svg';

// Import types
import type { PackageAttribute, PackageItem } from '../types/package';
import type { TestAttributeResult, TestItemResult, TestView } from '../types/test';

const screenWidth = Dimensions.get('window').width;

// Component props interface (inlined into memo rows)

/**
 * TestCardsPanel - Component for filling out attributes of discovered items
 * Displays a horizontal carousel of cards for each discovered item
 */
const TestCardsPanel = React.memo(() => {
    const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
    const flatListRef = useRef<FlatList<PackageItem>>(null);

    const test = useTest();

    const attributes: PackageAttribute[] = test.selectedAttributes;
    const discoveredItems: PackageItem[] = test.discoveredItems;
    const results: TestItemResult[] = test.results;

    const currentItem = discoveredItems[currentCardIndex];

    // O(1) lookup: item name -> item result
    const resultsByItem = React.useMemo(() => {
        const map = new Map<string, TestItemResult>();
        if (results) {
            for (const r of results) map.set(r.itemName, r);
        }
        return map;
    }, [results]);

    const currentItemResult = currentItem ? resultsByItem.get(currentItem.name) : undefined;

    const currentAttributeIndex = useRef<number>(0);

    // Map to store refs for all AttributeInput components
    // Key format: "itemName_attributeName"
    const inputRefsMap = useRef<Map<string, React.MutableRefObject<TextInput | null>>>(new Map());

    // Track which attribute is currently focused
    const currentFocusedAttributeRef = useRef<string | null>(null);

    const isManualScroll = useRef<boolean>(false);


    useEffect(() => {
        currentAttributeIndex.current = 0;
    }, [currentCardIndex]);

    useEffect(() => {
        if (currentItemResult) {
            focusNextUnansweredAttribute();
        }
    }, [currentItemResult]);


    function focusNextUnansweredAttribute(): void {
        if (!currentItem) return;

        const nextUnansweredAttribute = findNextUnansweredAttribute(currentAttributeIndex.current);
        if (nextUnansweredAttribute) {
            focusInput(currentItem.name, nextUnansweredAttribute.attributeName);
        } else {
            if (!isManualScroll.current) {
                const nextUnansweredItem = findNextUnansweredItem();
                if (nextUnansweredItem) {
                    scrollToCard(nextUnansweredItem.index);
                }
            }
        }
        isManualScroll.current = false;
    }

    function findNextUnansweredItem(): { item: PackageItem; index: number } | null {
        const totalItems = discoveredItems.length;

        // Start from the item after current index and wrap around
        for (let i = 1; i < totalItems; i++) {
            const index = (currentCardIndex + i) % totalItems;
            const item = discoveredItems[index];

            const itemResult: TestItemResult | undefined = results?.find(r => r.itemName === item.name);


            // Check if this item has any unanswered and not correct attributes
            const hasUnansweredAttribute = itemResult?.attributeResults?.some(attr => attr.correct === false);

            if (hasUnansweredAttribute) {
                return { item, index };
            }
        }

        return null;
    }

    /**
     * Gets the appropriate keyboard type based on attribute type
     */
    function getKeyboard(attrType: string): 'number-pad' | 'ascii-capable' | 'visible-password' {
        if (attrType === 'number') return 'number-pad';
        if (Platform.OS === 'ios') return 'ascii-capable';
        return 'visible-password';
    }

    const focusInput = React.useCallback((itemName: string, attributeName: string): void => {
        // Find the index of the focused attribute
        const relevantAttributes = attributes.filter(attr =>
            (attr.type === 'string' || attr.type === 'number') && attr.name !== 'name'
        );
        const attributeIndex = relevantAttributes.findIndex(attr => attr.name === attributeName);

        if (attributeIndex !== -1) {
            currentAttributeIndex.current = attributeIndex;
        }

        currentFocusedAttributeRef.current = attributeName;
        const inputRef = getInputRef(itemName, attributeName);
        if (inputRef) {
            inputRef.current?.focus();
        }
    }, [attributes]);

    /**
     * Gets a reference to an AttributeInput by item name and attribute name
     * @param itemName - The name of the item
     * @param attributeName - The name of the attribute
     * @returns The ref to the TextInput, or undefined if not found
     */
    function getInputRef(itemName: string, attributeName: string): React.MutableRefObject<TextInput | null> | undefined {
        const key = `${itemName}_${attributeName}`;
        return inputRefsMap.current.get(key);
    }

    function findNextUnansweredAttribute(startIndex: number = 0): TestAttributeResult | null {
        if (!currentItem || !results || results.length === 0) return null;

        const itemResult: TestItemResult | undefined = results?.find(r => r.itemName === currentItem.name);
        if (!itemResult) return null;

        // Get all attributes for this item (excluding 'name')
        const relevantAttributes = attributes.filter(attr =>
            (attr.type === 'string' || attr.type === 'number') && attr.name !== 'name'
        );

        if (relevantAttributes.length === 0) return null;

        // If current attribute not found, start from beginning
        const actualStartIndex = startIndex === -1 ? 0 : startIndex;

        // Search circularly starting from the current attribute (inclusive)
        for (let i = 0; i < relevantAttributes.length; i++) {
            const index = (actualStartIndex + i) % relevantAttributes.length;
            const attr = relevantAttributes[index];
            const attrResult = itemResult.attributeResults.find(a => a.attributeName === attr.name);

            if (!attrResult || !attrResult.correct) {
                return { attributeName: attr.name } as TestAttributeResult;
            }
        }

        return null;
    }

    /**
     * Handles view changes
     */
    const handleViewChange = React.useCallback((newView: TestView): void => {
        test.dispatch(setCurrentView(newView));
    }, [test]);

    /**
     * Handles scrolling to a specific card
     */
    function scrollToCard(index: number): void {
        if (flatListRef.current) {
            try {
                flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0 });
            } catch (_) {
                // Fallback if index not measured yet
                flatListRef.current.scrollToOffset({ offset: index * screenWidth, animated: true });
            }
        }
        handleCardChange(index);
    }

    const handleCardChange = React.useCallback((index: number): void => {
        test.dispatch(setCurrentItemIndex(index));
    }, [test]);

    /**
     * Checks if an answer is correct based on attribute type
     */
    const checkAnswer = React.useCallback((input: string | number, correctAnswer: string | number, attrType: string): boolean => {
        if (attrType === 'number') {
            return Number(input) === Number(correctAnswer);
        } else if (attrType === 'string') {
            const distance = getDistance(String(input), String(correctAnswer));
            const percent = distance / String(correctAnswer).length;
            return percent < 0.1; // 10% threshold
        }
        return false;
    }, []);


    /**
     * Handles submission of an attribute answer
     */
    const handleAttributeSubmit = React.useCallback((item: PackageItem, attribute: PackageAttribute, input: string | number): boolean => {
        const correctAnswer = item[attribute.name];
        const isCorrect = checkAnswer(input, correctAnswer, attribute.type);

        test.dispatch(submitAttributeAnswer({
            itemName: item.name,
            attributeName: attribute.name,
            input,
            isCorrect,
            correctAnswer
        }));

        return isCorrect;
    }, [checkAnswer, test]);

    

    /**
     * Renders a single card for an item
     */
    const MemoAttributeRow: React.FC<{ attribute: PackageAttribute; answerData?: TestAttributeResult; item: PackageItem; onSubmit: (item: PackageItem, attribute: PackageAttribute, input: string | number) => boolean; }>
        = React.memo(({ attribute, answerData, item, onSubmit }) => {
        // Initialize localInput based on answerData
        const initializeInput = () => {
            if (answerData?.correct) {
                return answerData.answer?.toString() || '';
            }
            return '';
        };

        const [localInput, setLocalInput] = useState<string>(initializeInput());
        const inputRef = useRef<TextInput>(null);

        // Register this ref in the map
        React.useEffect(() => {
            const key = `${item.name}_${attribute.name}`;
            inputRefsMap.current.set(key, inputRef);

            return () => {
                inputRefsMap.current.delete(key);
            };
        }, [item.name, attribute.name]);

        React.useEffect(() => {
            if (answerData?.correct) {
                setLocalInput(answerData.answer?.toString() || '');
            } else {
                setLocalInput('');
            }
        }, [answerData?.correct, answerData?.answer]);

        const isCorrect: boolean = answerData?.correct || false;
        const answeredButWrong: boolean = answerData?.correct === false && answerData?.answered === true;
        const isDisabled: boolean = isCorrect;
        const displayValue: string = isCorrect ? answerData?.answer?.toString() || '' : localInput;

        const handleSubmit = (): void => {
            if (!isDisabled && displayValue.trim()) {
                onSubmit(item, attribute, displayValue);
            }
        };

        return (
            <View style={styles.attribute_container}>
                <Text style={styles.attribute_label}>{attribute.title}:</Text>
                <View style={styles.input_row}>
                    <TextInput
                        ref={inputRef}
                        style={[
                            styles.attribute_input,
                            isCorrect && styles.correct_input,
                            answeredButWrong && styles.wrong_input,
                            !isCorrect && !answeredButWrong && displayValue && styles.normal_input
                        ]}
                        value={displayValue}
                        onChangeText={setLocalInput}
                        keyboardType={getKeyboard(attribute.type)}
                        autoCorrect={false}
                        spellCheck={false}
                        editable={!isDisabled}
                        returnKeyType='done'
                        onSubmitEditing={handleSubmit}
                    />
                    {isCorrect && (
                        <Check style={styles.check_icon} />
                    )}
                </View>
            </View>
        );
    }, (prev, next) => {
        return (
            prev.attribute.name === next.attribute.name &&
            prev.item._id === next.item._id &&
            prev.answerData?.correct === next.answerData?.correct &&
            prev.answerData?.answered === next.answerData?.answered &&
            prev.answerData?.answer === next.answerData?.answer
        );
    });

    const MemoCard: React.FC<{ item: PackageItem; index: number }>
        = React.memo(({ item }) => {
        const itemResult: TestItemResult | undefined = resultsByItem.get(item.name);

        // Build O(1) attribute result map per card
        const attrMap = React.useMemo(() => {
            const m = new Map<string, TestAttributeResult>();
            itemResult?.attributeResults?.forEach(a => m.set(a.attributeName, a));
            return m;
        }, [itemResult]);

        return (
            <View style={styles.card}>
                <View style={styles.card_header}>
                    <Text style={styles.card_title}>{item.name}</Text>
                </View>

                <ScrollView style={styles.attributes_scroll}>
                    {attributes.map(attr => {
                        if ((attr.type !== 'string' && attr.type !== 'number') || attr.name === 'name') return null;
                        const answerData: TestAttributeResult | undefined = attrMap.get(attr.name);
                        return (
                            <MemoAttributeRow
                                key={attr.name}
                                item={item}
                                attribute={attr}
                                answerData={answerData}
                                onSubmit={handleAttributeSubmit}
                            />
                        );
                    })}
                </ScrollView>
            </View>
        );
    }, (prev, next) => prev.item._id === next.item._id);

    if (!discoveredItems || discoveredItems.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.empty_container}>
                    <Text style={styles.empty_text}>
                        No items discovered yet. Go back to name view to discover items!
                    </Text>
                </View>
                <View style={styles.button_container}>
                    <TouchableOpacity
                        style={styles.nav_button}
                        onPress={() => handleViewChange('name')}
                    >
                        <Text style={styles.button_text}>← Names</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Compute adaptive pagination dots (buckets)
    const totalItems = discoveredItems.length;
    const computeStep = React.useCallback((total: number): number => {
        if (total <= 20) return 1;
        const candidates = [5, 10, 20, 50, 100, 200];
        for (const s of candidates) {
            if (Math.ceil(total / s) <= 20) return s;
        }
        // fallback: evenly distribute to <= 20 dots
        return Math.ceil(total / 20);
    }, []);

    const dotIndices = React.useMemo(() => {
        if (totalItems <= 0) return [] as number[];
        const step = computeStep(totalItems);
        const arr: number[] = [];
        for (let i = 0; i < totalItems; i += step) arr.push(i);
        if (arr[arr.length - 1] !== totalItems - 1) arr.push(totalItems - 1);
        return arr;
    }, [totalItems, computeStep]);

    const activeDotIndex = React.useMemo(() => {
        if (dotIndices.length === 0) return -1;
        // highlight the dot whose target index is nearest to the current card index
        let best = dotIndices[0];
        let bestDist = Math.abs(best - (currentCardIndex || 0));
        for (let i = 1; i < dotIndices.length; i++) {
            const candidate = dotIndices[i];
            const dist = Math.abs(candidate - (currentCardIndex || 0));
            if (dist < bestDist) {
                best = candidate;
                bestDist = dist;
            }
        }
        return best;
    }, [dotIndices, currentCardIndex]);

    return (
        <View style={styles.container}>
            {/* Card Carousel (Virtualized) */}
            <FlatList
                ref={flatListRef}
                data={discoveredItems}
                keyExtractor={(item, index) => String(item._id || `${item.name}-${index}`)}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialNumToRender={3}
                windowSize={5}
                maxToRenderPerBatch={3}
                removeClippedSubviews
                onScrollBeginDrag={() => { isManualScroll.current = true; }}
                onMomentumScrollEnd={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                    setCurrentCardIndex(index);
                    handleCardChange(index);
                }}
                getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
                renderItem={({ item, index }) => (
                    <View style={{ width: screenWidth }}>
                        <MemoCard item={item} index={index} />
                    </View>
                )}
                style={styles.carousel}
            />

            {/* Pagination Dots (adaptive, never exceeding screen width) */}
            {dotIndices.length > 0 && (
                <View style={styles.pagination}>
                    {dotIndices.map((targetIndex, idx) => (
                        <TouchableOpacity
                            key={`${targetIndex}-${idx}`}
                            onPress={() => scrollToCard(targetIndex)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={styles.dot_touch}
                        >
                            <View
                                style={[
                                    styles.dot,
                                    activeDotIndex === targetIndex && styles.active_dot
                                ]}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Navigation Buttons */}
            <View style={styles.button_container}>
                <TouchableOpacity
                    style={styles.nav_button}
                    onPress={() => handleViewChange('name')}
                >
                    <Text style={styles.button_text}>← Names</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.nav_button}
                    onPress={() => handleViewChange('list')}
                >
                    <Text style={styles.button_text}>List →</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

TestCardsPanel.displayName = 'TestCardsPanel';

export default TestCardsPanel;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },

    carousel: {
        flex: 1,
    },

    card: {
        width: screenWidth,
        padding: 20,
        flex: 1,
    },

    card_header: {
        borderBottomWidth: 2,
        borderBottomColor: 'white',
        paddingBottom: 10,
        marginBottom: 15,
    },

    card_title: {
        color: 'white',
        fontSize: 24,
        fontWeight: '700',
    },

    attributes_scroll: {
        flex: 1,
    },

    attribute_container: {
        marginBottom: 20,
    },

    attribute_label: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },

    input_row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    attribute_input: {
        flex: 1,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
        fontWeight: '500',
        color: '#222222',
        borderWidth: 2,
        borderColor: 'transparent',
    },

    normal_input: {
        borderColor: '#666',
    },

    correct_input: {
        borderColor: '#2ebf44',
        backgroundColor: '#d4ffd9',
    },

    wrong_input: {
        borderColor: '#ed0e0e',
        backgroundColor: '#ffd4d4',
    },

    check_icon: {
        width: 24,
        height: 24,
        color: '#2ebf44',
    },

    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        width: '100%',
    },

    dot_touch: {
        paddingVertical: 4,
        paddingHorizontal: 2,
    },

    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.35)',
    },

    active_dot: {
        backgroundColor: 'white',
        width: 14,
        height: 14,
        borderRadius: 7,
    },

    button_container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: colors.lightPurple,
    },

    nav_button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 5,
    },

    button_text: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },

    empty_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },

    empty_text: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
});
