import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/core';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from "react-native-modal";

import colors from '../util/colors';
import { useQuiz } from '../hooks/useRedux';
import { resetGame, quickRestart } from '../store/slices/quizSlice';

import Check from '../icons/Check.svg';
import X from '../icons/X.svg';

import type { QuizResultsScreenNavigationProp } from '../types/navigation';
import type { QuizResult } from '../types/quiz';

interface ImageData {
    ar: number;
    image: any;
}

const QuizResultsScreen: React.FC = () => {
    // Redux hooks
    const game = useQuiz();
    const navigation = useNavigation<QuizResultsScreenNavigationProp>();

    const questionType = game.questionType;

    // Local state for UI
    const [selectedImage, setImage] = useState<ImageData | null>(null);
    const [showingModal, setModal] = useState<boolean>(false);

    // Derived state from Redux
    const results = game.results;
    const images = game.images;

    const handlePlay = (): void => {
        // Reset game state for a new game
        game.dispatch(quickRestart());
        navigation.navigate("QuizGame");
    };

    const handleMenu = (): void => {
        // Reset game state when going back to menu
        game.dispatch(resetGame());
        
        // Reset navigation stack to remove QuizGame and QuizResults from history
        navigation.reset({
            index: 0,
            routes: [{ name: "Home" }, { name: "QuizOption" }],
        });
    };

    const handleImage = (image: ImageData): void => {
        setImage(image);
        setModal(true);
    };

    const handleClose = (): void => {
        setImage(null);
        setModal(false);
    };

    // Safety check: if no results, navigate back
    if (!results || results.length === 0) {
        return (
            <SafeAreaView style={styles.main_container}>
                <View style={styles.top_container}>
                    <TouchableOpacity style={styles.title_button} onPress={handleMenu}>
                        <Text style={styles.title_button_text}>Menu</Text>
                    </TouchableOpacity>
                    <Text style={styles.title_text}>Write Quiz Results</Text>
                    <View style={styles.title_button}/>
                </View>
                <View style={styles.results_container}>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: 18, fontWeight: '600'}}>No results available</Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.main_container}>
            <View style={styles.top_container}>
                <TouchableOpacity style={styles.title_button} onPress={handleMenu}>
                    <Text style={styles.title_button_text}>Menu</Text>
                </TouchableOpacity>
                <Text style={styles.title_text}>Write Quiz Results</Text>
                <View style={styles.title_button}/>
            </View>
            <View style={styles.results_container}>
                <View style={styles.row_title}>
                    {questionType !== "map" && <View style={styles.row_item}>
                        <Text style={styles.row_title_text}>Question</Text>
                    </View>}
                    <View style={styles.row_item}>
                        <Text style={styles.row_title_text}></Text>
                    </View>
                    <View style={styles.row_item}>
                        <Text style={styles.row_title_text}>Yours</Text>
                    </View>
                    <View style={styles.row_item}>
                        <Text style={styles.row_title_text}>Correct</Text>
                    </View>
                </View>
                {results.map((item: QuizResult) => {
                    return (
                        <View key={item.question ? item.question : item.answer} style={styles.row_item_container}>
                            {(questionType !== "map") && <View style={styles.row_item}>
                                {questionType === "image" && images && item.itemName && images[item.itemName] ?
                                    <TouchableOpacity style={styles.row_image_container} onPress={() => handleImage(images[item.itemName])}>
                                        <Image 
                                            style={{height: 25, aspectRatio: images[item.itemName].ar}}
                                            source={images[item.itemName].image}
                                        />  
                                    </TouchableOpacity>
                                    :
                                    <Text>{item.question}</Text>
                                }
                            </View>}
                            <View style={[styles.row_item, {justifyContent: 'center', alignItems: 'center'}]}>
                                {item.correct ? 
                                    <Check style={styles.correct_icon}/>
                                    :
                                    <X style={styles.wrong_icon}/>
                                }
                            </View>
                            <View style={styles.row_item}>
                                <Text>{item.input}</Text>
                            </View>
                            <View style={styles.row_item}>
                                <Text>{item.answer}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
            <View style={styles.bottom_container}>
                <TouchableOpacity style={styles.play_button} onPress={handlePlay}>
                    <Text style={styles.play_text}>Play Again!</Text>
                </TouchableOpacity>
            </View>

            <Modal 
                isVisible={showingModal}
                coverScreen={true}
                onBackdropPress={handleClose}
                style={styles.modal_container}
            >
                <TouchableOpacity style={styles.modal_image_container} onPress={handleClose}>
                    {selectedImage && <Image 
                        style={{height: 'auto', width: '100%', aspectRatio: selectedImage.ar}}
                        source={selectedImage.image}
                    />} 
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

export default QuizResultsScreen;

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
        gap: 5,
    },

    row_title: {
        backgroundColor: colors.darkPurple,
        flexDirection: 'row',
        paddingHorizontal: 5,
    },

    row_title_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },

    row_item_container: {
        flexDirection: 'row',
        paddingHorizontal: 5,
    },

    row_item: {
        flex: 1,
        padding: 5,
    },

    row_image_container: {
        justifyContent: 'center',
        alignItems: 'center'
    },

    correct_icon: {
        width: "25%",
        aspectRatio: 1,
        color: '#2ebf44'
    },

    wrong_icon: {
        width: "20%",
        aspectRatio: 1,
        color: '#ed0e0e'
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
        borderRadius: 5
    },

    play_text: {
        color: 'white',
        fontSize: 30,
        fontWeight: '700'
    },

    modal_container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },

    modal_image_container: {
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center'
    },
});

