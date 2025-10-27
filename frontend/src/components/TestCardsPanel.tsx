import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
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

// Component props interface
interface AttributeInputProps {
    item: PackageItem;
    attribute: PackageAttribute;
    answerData?: TestAttributeResult;
}

/**
 * TestCardsPanel - Component for filling out attributes of discovered items
 * Displays a horizontal carousel of cards for each discovered item
 */
const TestCardsPanel = React.memo(() => {
    const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const test = useTest();

    const attributes: PackageAttribute[] = test.selectedAttributes;
    const discoveredItems: PackageItem[] = test.discoveredItems;
    const results: TestItemResult[] = test.results;

    const currentItem = discoveredItems[currentCardIndex];
    const currentItemResult = results?.find(r => r.itemName === currentItem?.name);

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

    function focusInput(itemName: string, attributeName: string): void {
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
    }

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
    function handleViewChange(newView: TestView): void {
        test.dispatch(setCurrentView(newView));
    }

    /**
     * Handles scrolling to a specific card
     */
    function scrollToCard(index: number): void {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
                x: index * screenWidth,
                animated: true
            });
        }
        handleCardChange(index);
    }

    function handleCardChange(index: number): void {
        test.dispatch(setCurrentItemIndex(index));
    }

    /**
     * Checks if an answer is correct based on attribute type
     */
    function checkAnswer(input: string | number, correctAnswer: string | number, attrType: string): boolean {
        if (attrType === 'number') {
            return Number(input) === Number(correctAnswer);
        } else if (attrType === 'string') {
            const distance = getDistance(String(input), String(correctAnswer));
            const percent = distance / String(correctAnswer).length;
            return percent < 0.1; // 10% threshold
        }
        return false;
    }


    /**
     * Handles submission of an attribute answer
     */
    function handleAttributeSubmit(item: PackageItem, attribute: PackageAttribute, input: string | number): boolean {
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
    }

    /**
     * AttributeInput - Component for a single attribute input field
     */
    const AttributeInput: React.FC<AttributeInputProps> = ({ item, attribute, answerData }) => {
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

            // Cleanup on unmount
            return () => {
                inputRefsMap.current.delete(key);
            };
        }, [item.name, attribute.name]);

        // Reset localInput when answerData changes
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

        // If correct, display the correct answer
        const displayValue: string = isCorrect ? answerData?.answer?.toString() || '' : localInput;

        /**
         * Handles submission of attribute answer
         */
        const handleSubmit = (): void => {
            if (!isDisabled && localInput.trim()) {
                handleAttributeSubmit(item, attribute, localInput);
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
                            !isCorrect && !answeredButWrong && localInput && styles.normal_input
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
    };

    /**
     * Renders a single card for an item
     */
    function renderCard(item: PackageItem, index: number): React.ReactElement {
        const itemResult: TestItemResult | undefined = results?.find(r => r.itemName === item.name);

        return (
            <View key={item._id || index} style={styles.card}>
                {/* Card Header */}
                <View style={styles.card_header}>
                    <Text style={styles.card_title}>{item.name}</Text>
                </View>

                {/* Attributes Section */}
                <ScrollView style={styles.attributes_scroll}>
                    {attributes.map(attr => {
                        // Only show string and number attributes
                        if ((attr.type !== 'string' && attr.type !== 'number') || attr.name === 'name') return null;

                        const answerData: TestAttributeResult | undefined = itemResult?.attributeResults?.find(
                            a => a.attributeName === attr.name
                        );

                        return (
                            <AttributeInput
                                key={attr.name}
                                item={item}
                                attribute={attr}
                                answerData={answerData}
                            />
                        );
                    })}
                </ScrollView>
            </View>
        );
    }

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

    return (
        <View style={styles.container}>
            {/* Card Carousel */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScrollBeginDrag={() => {
                    isManualScroll.current = true;
                }}
                onMomentumScrollEnd={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                    setCurrentCardIndex(index);
                    handleCardChange(index);
                }}
                style={styles.carousel}
            >
                {discoveredItems.map((item, index) => renderCard(item, index))}
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {discoveredItems.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.dot,
                            index === currentCardIndex && styles.active_dot
                        ]}
                        onPress={() => scrollToCard(index)}
                    />
                ))}
            </View>

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
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        gap: 8,
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },

    active_dot: {
        backgroundColor: 'white',
        width: 10,
        height: 10,
        borderRadius: 5,
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
