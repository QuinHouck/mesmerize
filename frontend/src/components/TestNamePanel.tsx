import React, { useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTest } from '../hooks/useRedux';
import {
    discoverItem,
    setCurrentView,
    submitAttributeAnswer
} from '../store/slices/testSlice';

import colors from '../util/colors';
import { getDistance } from '../util/extraFuncs';

import Check from '../icons/Check.svg';
import X from '../icons/X.svg';

import type { PackageItem } from '../types/package';
import type { TestView } from '../types/test';

type FeedbackType = 'correct' | 'already' | 'wrong' | null;

/**
 * TestNamePanel - Component for guessing item names in test mode
 * Users enter guesses and items are discovered if they match within distance threshold
 */
const TestNamePanel = React.memo((): React.JSX.Element => {
    const [input, setInput] = useState<string>("");
    const [lastInput, setLastInput] = useState<string>("");
    const [feedback, setFeedback] = useState<FeedbackType>(null);

    const test = useTest();

    const inputRef = useRef<TextInput>(null);

    const items: PackageItem[] = test.filteredItems;
    const discoveredItems: PackageItem[] = test.discoveredItems;

    /**
     * Gets the appropriate keyboard type for the platform
     */
    function getKeyboard(): 'ascii-capable' | 'visible-password' {
        if (Platform.OS === 'ios') return 'ascii-capable';
        return 'visible-password';
    }

    /**
     * Handles view changes
     */
    function handleViewChange(newView: TestView): void {
        test.dispatch(setCurrentView(newView));
    }

    /**
     * Checks if input matches a word within acceptable distance threshold
     */
    const isMatch = (input: string, word: string): boolean => {
        const distance = getDistance(input, word);
        return distance / word.length < 0.1;
    };

    /**
     * Handles user submission of a name guess
     * Checks if the input matches any item name or accepted alternative
     */
    async function handleSubmit(): Promise<void> {
        if (!input.trim()) return;

        let matchedItem: PackageItem | null = null;

        // Search through all items for a match
        for (const item of items) {
            // Check main name
            if (isMatch(input, item.name)) {
                matchedItem = item;
                break;
            }
            // Check accepted alternatives
            if (item.accepted?.some((alt: string) => isMatch(input, alt))) {
                matchedItem = item;
                break;
            }
        }

        // Determine feedback based on match result
        if (matchedItem) {
            if (discoveredItems.some(discovered => discovered._id === matchedItem!._id)) {
                // Already discovered
                setFeedback('already');
                setLastInput(matchedItem.name);
            } else {
                // New discovery
                setFeedback('correct');
                setLastInput(matchedItem.name);
                test.dispatch(discoverItem(matchedItem));

                test.dispatch(submitAttributeAnswer({
                    itemName: matchedItem.name,
                    attributeName: "name",
                    input,
                    isCorrect: true,
                    correctAnswer: matchedItem.name
                }));
            }
        } else {
            // No match
            setFeedback('wrong');
            setLastInput(input);
        }

        // Clear input
        setInput("");
    }

    /**
     * Renders the feedback symbol (checkmark or X) based on last guess
     */
    function getFeedbackSymbol(): React.JSX.Element | null {
        switch (feedback) {
            case 'correct':
                return <Check style={styles.symbol} fill="green" />;
            case 'already':
                return <Check style={styles.symbol} fill="orange" />;
            case 'wrong':
                return <X style={styles.symbol} fill="red" />;
            default:
                return null;
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Feedback Symbol Display */}
            <View style={styles.symbol_container}>
                {getFeedbackSymbol()}
            </View>

            {/* Stats and Navigation */}
            <View style={styles.stats_container}>
                <View style={styles.stats_left}>
                    <View style={{ borderColor: 'white', borderBottomWidth: 2, width: '100%' }}>
                        <Text style={styles.stats_left_text}>Last Answer</Text>
                    </View>
                    <Text style={styles.stats_left_text}>{lastInput}</Text>
                </View>
                <View style={[styles.stats_left, { paddingBottom: 10 }]}>
                    <TouchableOpacity
                        style={[styles.button]}
                        onPress={() => handleViewChange('list')}
                    >
                        <Text style={styles.button_text}>List</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button]}
                        onPress={() => handleViewChange('cards')}
                    >
                        <Text style={styles.button_text}>Cards</Text>
                    </TouchableOpacity>
                    {/* {hasMaps && (
                        <TouchableOpacity 
                            style={[styles.button]} 
                            onPress={() => onViewChange('map')}
                        >
                            <Text style={styles.button_text}>Map</Text>
                        </TouchableOpacity>
                    )} */}
                </View>
            </View>

            {/* Input Field */}
            <View style={styles.answer_container}>
                <TextInput
                    style={styles.input}
                    ref={inputRef}
                    onChangeText={setInput}
                    value={input}
                    autoCorrect={false}
                    spellCheck={false}
                    keyboardType={getKeyboard()}
                    returnKeyType='go'
                    blurOnSubmit={false}
                    onSubmitEditing={handleSubmit}
                    autoFocus
                />
            </View>
        </KeyboardAvoidingView>
    );
});

export default TestNamePanel;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
    },

    symbol_container: {
        flex: 5,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

    symbol: {
        height: '40%',
        aspectRatio: 1,
    },

    stats_container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
    },

    stats_left: {
        gap: 15,
        minWidth: '25%',
        marginBottom: 5
    },

    stats_left_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        borderBottomWidth: 3,
        borderBottomColor: 'white',
        paddingLeft: 15,
    },

    button: {
        alignSelf: 'flex-end',
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },

    button_text: {
        color: 'white',
        fontSize: 16,
        fontWeight: '400',
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 3,
        paddingHorizontal: 5,
    },

    answer_container: {
        backgroundColor: colors.lightPurple,
        padding: 10,
    },

    input: {
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 5,
        fontSize: 18,
        fontWeight: '600',
        color: '#222222'
    },
});

TestNamePanel.displayName = 'TestNamePanel';
