import React, { useRef, useState } from 'react';
import {
    Dimensions,
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

const screenWidth = Dimensions.get('window').width;

/**
 * TestCardsPanel - Component for filling out attributes of discovered items
 * Displays a horizontal carousel of cards for each discovered item
 */
const TestCardsPanel = React.memo(() => {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const scrollViewRef = useRef(null);

    const test = useTest();

    const attributes = test.selectedAttributes;
    const discoveredItems = test.discoveredItems;
    const results = test.results;

    const currentItemIndex = test.currentItemIndex;
    const currentItem = discoveredItems[currentItemIndex];
    const currentResult = results[currentItemIndex];


    /**
     * Gets the appropriate keyboard type based on attribute type
     */
    function getKeyboard(attrType) {
        if (attrType === 'number') return 'number-pad';
        if (Platform.OS === 'ios') return 'ascii-capable';
        return 'visible-password';
    }

    /**
     * Handles view changes
     */
    function handleViewChange(newView) {
        test.dispatch(setCurrentView(newView));
    }

    /**
     * Handles scrolling to a specific card
     */
    function scrollToCard(index) {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
                x: index * screenWidth,
                animated: true
            });
        }
        handleCardChange(index);
    }

    function handleCardChange(index) {
        test.dispatch(setCurrentItemIndex(index));
    }

    /**
     * Checks if an answer is correct based on attribute type
     */
    function checkAnswer(input, correctAnswer, attrType) {
        if (attrType === 'number') {
            return Number(input) === Number(correctAnswer);
        } else if (attrType === 'string') {
            const distance = getDistance(input, correctAnswer);
            const percent = distance / correctAnswer.length;
            return percent < 0.1; // 10% threshold
        }
        return false;
    }

    /**
     * Handles submission of an attribute answer
     */
    function handleAttributeSubmit(item, attribute, input) {
        const correctAnswer = item[attribute.name];
        const isCorrect = checkAnswer(input, correctAnswer, attribute.type);

        test.dispatch(submitAttributeAnswer({
            itemName: item.name,
            attributeName: attribute.name,
            input,
            isCorrect,
            correctAnswer
        }));
    }

    /**
     * AttributeInput - Component for a single attribute input field
     */
    const AttributeInput = ({ item, attribute, answerData }) => {
        const [localInput, setLocalInput] = useState(answerData?.input || '');
        const [showWrong, setShowWrong] = useState(false);
        const isCorrect = answerData?.correct || false;
        const isDisabled = isCorrect;

        // Sync local input with answer data when it changes
        React.useEffect(() => {
            if (answerData?.correct) {
                setLocalInput(answerData.answer);
            }
        }, [answerData]);

        // If correct, display the correct answer
        const displayValue = isCorrect ? answerData.answer : localInput;

        /**
         * Handles submission of attribute answer
         */
        const handleSubmit = () => {
            if (!isDisabled && localInput.trim()) {
                const isAnswerCorrect = checkAnswer(localInput, item[attribute.name], attribute.type);
                handleAttributeSubmit(item, attribute, localInput);

                // If wrong, show red border briefly then clear
                if (!isAnswerCorrect) {
                    setShowWrong(true);
                    setTimeout(() => {
                        setShowWrong(false);
                        setLocalInput('');
                    }, 500);
                }
            }
        };

        return (
            <View style={styles.attribute_container}>
                <Text style={styles.attribute_label}>{attribute.title}:</Text>
                <View style={styles.input_row}>
                    <TextInput
                        style={[
                            styles.attribute_input,
                            isCorrect && styles.correct_input,
                            showWrong && styles.wrong_input,
                            !isCorrect && !showWrong && localInput && styles.normal_input
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
    function renderCard(item, index) {
        const itemResult = results?.find(r => r.itemName === item.name);

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

                        const answerData = itemResult?.answers.find(
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
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                    setCurrentCardIndex(index);
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

