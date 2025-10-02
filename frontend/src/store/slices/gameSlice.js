import { createSlice } from '@reduxjs/toolkit';
import { resetResults, getSelectedItems, updateWeights } from "../helpers/gameHelper"

// Initial state
const initialState = {
  // Game configuration
  packageName: null,

  // Game settings
  question: null,
  questionType: null,
  answer: null,
  answerType: null,
  division: null,
  divisionOption: null,
  range: {
    ranged: false,
    start: 1,
    end: 1,
    attr: null,
  },


  filteredItems: [],
  selectedItems: [],
  results: [],

  // Scoring
  points: 0,
  correctAnswers: 0,
  totalQuestions: 0,

  timeLimit: 45,

  // Images (for image-based questions)
  images: null,
  imageHeight: '50%',

  // Error handling
  error: null,
};

// Create the slice
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Game initialization
    initializeGame: (state, action) => {
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

      state.packageName = packageName; // name of package
      state.question = question; // Attribute name of question  
      state.questionType = questionType; // Type of question (image, text, number, etc.)
      state.answer = answer; // Attribute name of answer
      state.answerType = answerType; // Type of answer
      state.division = division; // Division name
      state.divisionOption = divisionOption; // Division option name
      state.range = range;
      state.filteredItems = filteredItems;
      state.images = images;
      state.imageHeight = imageHeight;
      state.timeLimit = timeLimit || 45;
      state.totalQuestions = totalQuestions;

      state.selectedItems = getSelectedItems(filteredItems, totalQuestions);
      // Initialize results array
      state.results = resetResults(state.selectedItems, state.question, state.answer);
      // Reset game state
      state.points = 0;
      state.correctAnswers = 0;
    },

    setImages: (state, action) => {
      const { images, imageHeight } = action.payload;
      state.images = images;
      state.imageHeight = imageHeight;
    },

    // Answer handling
    submitAnswer: (state, action) => {
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
    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Reset game state
    resetGame: (state) => {
      return initialState;
    },

    // Quick actions
    quickRestart: (state) => {
      state.currentIndex = 0;
      state.points = 0;
      state.correctAnswers = 0;
      state.error = null;
      state.images = null;

      state.selectedItems = getSelectedItems(state.filteredItems, state.totalQuestions);
      state.results = resetResults(state.selectedItems, state.question, state.answer);
    },
  },
});

// Export actions
export const {
  initializeGame,
  submitAnswer,
  atGameEnd,
  setError,
  clearError,
  resetGame,
  quickRestart,
} = gameSlice.actions;

// Export reducer
export default gameSlice.reducer;
