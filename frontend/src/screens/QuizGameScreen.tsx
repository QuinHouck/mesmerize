import { useIsFocused, useNavigation } from '@react-navigation/core';
import React, { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from "react-native-modal";

import { useQuiz } from '../hooks/useRedux';
import {
    atGameEnd,
    setImages,
    submitAnswer,
} from '../store/slices/quizSlice';
import colors from '../util/colors';
import { getDistance } from '../util/extraFuncs';

import { getImages } from '../util/getImages';

import Map from '../components/Map';

import type { QuizGameScreenNavigationProp } from '../types/navigation';

const QuizGameScreen: React.FC = () => {
    // Redux hooks
    const game = useQuiz();
    const navigation = useNavigation<QuizGameScreenNavigationProp>();
    const isFocused = useIsFocused();

    // Get game data from Redux state instead of route params
    const pack = game.packageName;
    const div = game.division;
    const divOption = game.divisionOption;
    const question = game.question;
    const questionType = game.questionType;
    const answer = game.answer;
    const answerType = game.answerType;
    const range = game.range;
    const timeLimit = game.timeLimit;

    // Local state for UI-specific things
    const [correct, setCorrect] = useState<number>(0); // 0 = no correct answer, 1 = wrong answer, 2 = correct answer

    const [isLoading, setLoading] = useState<boolean>(true); // Loading initial data
    const [isPaused, setIsPaused] = useState<boolean>(false); // Manually paused or not
    const [isUpdating, setIsUpdating] = useState<boolean>(false); // If the user has already answered the question and waiting for state update
    const [gameEnded, setGameEnded] = useState<boolean>(false); // If the game has ended

    const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Derived state from Redux
    const selected = game.selectedItems;
    const totalQuestions = selected.length;
    const points = game.points;

    const [idx, setCurrentIndex] = useState<number>(0); // Index of the question out of selected items
    const [input, setInput] = useState<string>(""); // Whats currently in the input bar

    const images = game.images;
    const imageHeight = game.imageHeight;

    const inputRef = useRef<TextInput>(null);

    const correctThreshold = 0.2;
    const questionCooldown = 2500;

    useEffect(() => {
        if (isFocused) {
            initializeGameState();
        }
    }, [isFocused]);

    useEffect(() => {
        if (isPaused || isUpdating || gameEnded) {
            // Clear interval when paused or updating or game is ended
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        } else if (timeLeft > 0) {
            // Start interval when not paused
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPaused, isUpdating, gameEnded]);

    const initializeGameState = async (): Promise<void> => {
        if (!isFocused) {
            setLoading(true);
            return;
        }

        // Keep loading state true until everything is ready
        setLoading(true);

        // Game is already initialized in QuizOptionScreen, just load images if needed
        let imgs = game.images;
        let imgHeight = game.imageHeight;

        if (questionType === "image" && !imgs && pack) {
            const { imgs: loadedImgs, height } = await getImages(game.selectedItems, pack);
            imgs = loadedImgs;
            imgHeight = height;

            // Update only the images without reinitializing the game
            game.dispatch(setImages({
                images: imgs,
                imageHeight: imgHeight,
            }));
        }

        setCurrentIndex(0);
        setInput("");
        setCorrect(0);
        setIsUpdating(false);
        setTimeLeft(timeLimit);
        setIsPaused(false);
        setGameEnded(false);

        // Only set loading to false after everything is initialized
        setLoading(false);
    };

    const getKeyboard = (): 'number-pad' | 'ascii-capable' | 'visible-password' => {
        if (answerType === "number") return 'number-pad';

        if (Platform.OS === 'ios') return 'ascii-capable';

        return 'visible-password';
    };

    const handleSubmit = async (): Promise<void> => {
        if (isUpdating || !answer) return;
        setIsUpdating(true);

        let distance = 10;
        let percent = 10;

        // Check if the answer is correct
        if (answerType === 'string') {
            distance = await getDistance(input, selected[idx][answer]);
            percent = distance / (selected[idx][answer].length);
        } else if (answerType === 'number') {
            if (Number(input) === Number(selected[idx][answer])) {
                distance = 0;
                percent = 0;
            }
        }

        let correctLocal = false;
        let correctId = 1;
        if (percent < correctThreshold) {
            correctLocal = true;
            correctId = 2;
        } else {
            // Check if the answer is in the accepted list
            if (selected[idx].accepted && answerType === 'string') {
                for (const other of selected[idx].accepted) {
                    distance = getDistance(input, other);
                    percent = distance / (selected[idx][answer].length);
                    if (percent < correctThreshold) {
                        correctLocal = true;
                        correctId = 2;
                        break;
                    }
                }
            }
        }

        setCorrect(correctId);

        // Submit answer to Redux
        game.dispatch(submitAnswer({
            input,
            idx,
            isCorrect: correctLocal,
        }));

        // Make the input the correct answer formatted correctly
        setInput(selected[idx][answer].toString());

        setTimeout(() => {
            if (idx + 1 >= selected.length) {
                endGame();
                return;
            }
            nextQuestion();
            setCorrect(0);
            setIsUpdating(false);
            setTimeLeft(timeLimit);
        }, questionCooldown);
    };

    const nextQuestion = (): void => {
        if (idx < totalQuestions - 1) {
            setCurrentIndex(idx + 1);
            setInput("");
        }
    };

    const handleInput = (newInput: string): void => {
        if (isUpdating) return;
        setInput(newInput);
    };

    const handlePauseGame = (): void => {
        setIsPaused(true);
    };

    const handleResumeGame = (): void => {
        setIsPaused(false);
    };

    const endGame = (): void => {
        setGameEnded(true);
        game.dispatch(atGameEnd());
        navigation.navigate("QuizResults");
    };

    const getTextColor = (): string => {
        switch (correct) {
            case 0:
                return colors.darkGrey;
            case 1:
                return '#ed0e0e';
            case 2:
                return '#2ebf44';
            default:
                return colors.darkGrey;
        }
    };

    const renderQuestion = (): React.ReactNode => {
        if (!question) return null;
        
        switch (questionType) {
            case "image":
                // Safety check: ensure images are loaded and current item exists
                if (!images || !selected[idx] || !images[selected[idx]["name"]]) {
                    return <Text style={styles.question_text}>Loading image...</Text>;
                }
                return <Image
                    style={{ height: imageHeight, aspectRatio: images[selected[idx]["name"]].ar }}
                    source={images[selected[idx]["name"]].image}
                />;
            case "map":
                return (
                    <View style={{ height: '100%', width: "100%", alignItems: 'center' }}>
                        {/* <Map selected={current} pack={pack} div={div} divOption={divOption} type={"Quiz"} style={{ width: '100%' }} /> */}
                    </View>
                );
            default:
                return <Text style={styles.question_text}>{selected[idx][question]}</Text>;
        }
    };

    // Safety check: if game state is invalid/reset, show loading
    if (isLoading || !selected || selected.length === 0) {
        return (
            <SafeAreaView style={styles.main_container}>
                <View style={styles.loading_container}>
                    <Text style={styles.loading_text}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.main_container}>
            <View style={styles.top_container}>
                <TouchableOpacity style={styles.title_button} onPress={handlePauseGame}>
                    <Text style={styles.title_button_text}>Pause</Text>
                </TouchableOpacity>
                <Text style={styles.title_text}>Write Quiz</Text>
                <TouchableOpacity style={styles.title_button} onPress={endGame}>
                    <Text style={styles.title_button_text}>End</Text>
                </TouchableOpacity>
            </View>
            <KeyboardAvoidingView style={styles.second_container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.question_container}>
                    {renderQuestion()}
                </View>
                <View style={styles.stats_container}>
                    <View style={styles.stats_left}>
                        <Text style={styles.stats_left_text}>{`${points} pts`}</Text>
                        <Text style={styles.stats_left_text}>{`${idx + 1}/${selected.length}`}</Text>
                    </View>
                    <View style={styles.stats_left}>
                        <Text style={styles.stats_left_text}>{`00:${timeLeft.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}`}</Text>
                    </View>
                </View>
                <View style={styles.answer_container}>
                    <TextInput
                        style={[styles.input, { color: getTextColor() }]}
                        ref={inputRef}
                        onChangeText={(e) => handleInput(e)}
                        value={input}
                        autoCorrect={false}
                        spellCheck={false}
                        keyboardType={getKeyboard()}
                        blurOnSubmit={false}
                        returnKeyType={answerType === 'number' ? 'done' : 'go'}
                        onSubmitEditing={() => handleSubmit()}
                        autoFocus
                    />
                </View>
            </KeyboardAvoidingView>
            <Modal
                isVisible={isPaused}
                coverScreen={true}
                onBackdropPress={handleResumeGame}
                style={styles.modal_container}
            >
                <View style={styles.modal_middle_container}>
                    <Text style={[styles.resume_button_text, { fontSize: 30 }]}>Paused</Text>
                    <TouchableOpacity style={styles.resume_button} onPress={handleResumeGame}>
                        <Text style={styles.resume_button_text}>Resume</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default QuizGameScreen;

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
        zIndex: 10,
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

    second_container: {
        flex: 1,
    },

    question_container: {
        flex: 5,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

    question_text: {
        color: 'white',
        fontSize: 30,
        fontWeight: '700'
    },

    question_image: {
        height: '50%',
        aspectRatio: 2 / 1,
    },

    stats_container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,

    },

    stats_left: {
        gap: 10,
    },

    stats_left_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        borderBottomWidth: 3,
        borderBottomColor: 'white'
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
        fontWeight: '600'
    },

    // Loading

    loading_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loading_text: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },

    // Paused

    modal_container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },

    modal_middle_container: {
        borderRadius: 10,
        padding: 20,
        gap: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },

    resume_button: {
        minWidth: '40%',
        paddingVertical: 20,
        backgroundColor: colors.lightPurple,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5
    },

    resume_button_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
});

