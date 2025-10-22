import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { resetResults, getSelectedItems, updateWeights } from "../helpers/quizHelper";
import type { PackageItem } from '../../types/package';
import type { QuizRange, QuizResult, InitializeGamePayload, SubmitAnswerPayload, SetImagesPayload } from '../../types/quiz';

// State interface
interface QuizState {
    packageName: string | null;
    question: string | null;
    questionType: string | null;
    answer: string | null;
    answerType: string | null;
    division: string | null;
    divisionOption: string | null;
    range: QuizRange | null;
    filteredItems: PackageItem[];
    selectedItems: PackageItem[];
    results: QuizResult[];
    points: number;
    correctAnswers: number;
    totalQuestions: number;
    timeLimit: number;
    images: any;
    imageHeight: string;
    error: string | null;
}

// Initial state
const initialState: QuizState = {
    packageName: null,
    question: null,
    questionType: null,
    answer: null,
    answerType: null,
    division: null,
    divisionOption: null,
    range: null,
    filteredItems: [],
    selectedItems: [],
    results: [],
    points: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    timeLimit: 45,
    images: null,
    imageHeight: '50%',
    error: null,
};

// Create the slice
const quizSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        // Game initialization
        initializeGame: (state, action: PayloadAction<InitializeGamePayload>) => {
            const {
                packageName,
                question,
                questionType,
                answer,
                answerType,
                division,
                divisionOption,
                range,
                filteredItems,
                images,
                imageHeight,
                timeLimit,
                totalQuestions,
            } = action.payload;

            state.packageName = packageName;
            state.question = question;
            state.questionType = questionType;
            state.answer = answer;
            state.answerType = answerType;
            state.division = division;
            state.divisionOption = divisionOption;
            state.range = range;
            state.filteredItems = filteredItems;
            state.images = images;
            state.imageHeight = imageHeight;
            state.timeLimit = timeLimit || 45;
            state.totalQuestions = totalQuestions;

            state.selectedItems = getSelectedItems(filteredItems, totalQuestions);
            state.results = resetResults(state.selectedItems, question, answer);
            state.points = 0;
            state.correctAnswers = 0;
        },

        setImages: (state, action: PayloadAction<SetImagesPayload>) => {
            const { images, imageHeight } = action.payload;
            state.images = images;
            state.imageHeight = imageHeight;
        },

        // Answer handling
        submitAnswer: (state, action: PayloadAction<SubmitAnswerPayload>) => {
            const { input, idx, isCorrect } = action.payload;
            const currentResult = state.results[idx];

            currentResult.input = input;
            currentResult.correct = isCorrect;

            if (isCorrect) {
                state.points += 1;
                state.correctAnswers += 1;
            }
        },

        atGameEnd: (state) => {
            state.filteredItems = updateWeights(state.filteredItems, state.results);
        },

        // Error handling
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },

        clearError: (state) => {
            state.error = null;
        },

        // Reset game state
        resetGame: () => {
            return initialState;
        },

        // Quick actions
        quickRestart: (state) => {
            state.points = 0;
            state.correctAnswers = 0;
            state.error = null;
            state.images = null;

            if (state.question && state.answer) {
                state.selectedItems = getSelectedItems(state.filteredItems, state.totalQuestions);
                state.results = resetResults(state.selectedItems, state.question, state.answer);
            }
        },
    },
});

// Export actions
export const {
    initializeGame,
    setImages,
    submitAnswer,
    atGameEnd,
    setError,
    clearError,
    resetGame,
    quickRestart,
} = quizSlice.actions;

// Export reducer
export default quizSlice.reducer;

