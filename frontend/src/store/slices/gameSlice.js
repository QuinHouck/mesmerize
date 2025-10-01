import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  // Game configuration
  packageName: null,
  packageData: null,
  
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
  
  // Game state
  isActive: false,
  isPaused: false,
  isEnded: false,
  
  // Current question
  currentIndex: 0,
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
        selectedItems,
        images,
        imageHeight,
        timeLimit,
      } = action.payload;

      state.packageName = packageName; // name of package
      state.question = question; // Attribute name of question  
      state.questionType = questionType; // Type of question (image, text, number, etc.)
      state.answer = answer; // Attribute name of answer
      state.answerType = answerType; // Type of answer
      state.division = division; // Division name
      state.divisionOption = divisionOption; // Division option name
      state.range = range;
      state.selectedItems = selectedItems;
      state.images = images;
      state.imageHeight = imageHeight;
      state.timeLimit = timeLimit || 45;
      
      // Initialize results array
      state.results = selectedItems.map((item) => ({
        question: item[question],
        answer: item[answer],
        input: '',
        name: item.name,
        correct: false,
      }));
      
      // Reset game state
      state.points = 0;
      state.correctAnswers = 0;
      state.totalQuestions = selectedItems.length;
    },
    
    // Answer handling
    submitAnswer: (state, action) => {
      const { input, isCorrect } = action.payload;
      const currentResult = state.results[state.currentIndex];
      
      currentResult.input = input;
      currentResult.correct = isCorrect;
      
      if (isCorrect) {
        state.points += 1;
        state.correctAnswers += 1;
      }
    },
    
    setCurrentInput: (state, action) => {
      state.currentInput = action.payload;
    },
    
    // Timer management
    setTimer: (state, action) => {
      state.timerId = action.payload;
    },
    
    clearTimer: (state) => {
      state.timerId = null;
    },
    
    updateTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    
    resetTimer: (state) => {
      state.timeRemaining = state.timeLimit;
    },
    
    // Results management
    updateResult: (state, action) => {
      const { index, result } = action.payload;
      if (index >= 0 && index < state.results.length) {
        state.results[index] = { ...state.results[index], ...result };
      }
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
      state.currentInput = '';
      state.timeRemaining = state.timeLimit;
      state.isActive = true;
      state.isPaused = false;
      state.isEnded = false;
      state.error = null;
      
      // Reset results
      state.results = state.results.map(result => ({
        ...result,
        input: '',
        correct: false,
      }));
    },
  },
});

// Export actions
export const {
  initializeGame,
  startGame,
  pauseGame,
  resumeGame,
  endGame,
  nextQuestion,
  previousQuestion,
  goToQuestion,
  submitAnswer,
  setCurrentInput,
  setTimer,
  clearTimer,
  updateTimeRemaining,
  resetTimer,
  updateResult,
  setError,
  clearError,
  resetGame,
  quickRestart,
} = gameSlice.actions;

// Export reducer
export default gameSlice.reducer;
