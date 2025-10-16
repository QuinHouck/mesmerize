import { createSlice } from '@reduxjs/toolkit';
import { resetResults } from "../helpers/testHelper";

// Initial state
const initialState = {
  // Package selection
  packageName: null,
  packageInfo: null,
  
  // Division selection
  division: null,
  divisionOption: null,

  // There are 3 views: name, cards, list, map
  currentView: 'name',
  
  // Attribute selection - which attributes to test
  selectedAttributes: [], // Array of attribute objects: {name, title, type}
  
  // Filtered items based on division
  filteredItems: [],
  discoveredItems: [], // Array of discovered item objects
  results: [], // Array of result objects with answers for each item
  
  // Current test progress
  currentItemIndex: 0,
  
  // Test configuration
  timeLimit: 300, // 5 minutes default
  testStarted: false,
  testEnded: false,
  
  // Scoring
  totalItems: 0,
  pointsEarned: 0,
  totalPoints: 0,

  images: null,
  
  // Error handling
  error: null,
};

// Create the slice
const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    // Set package for test
    setTestPackage: (state, action) => {
      const { packageName, packageInfo } = action.payload;
      state.packageName = packageName;
      state.packageInfo = packageInfo;
      // Reset selections when package changes
      state.division = null;
      state.divisionOption = null;
      
      // Always include 'name' attribute if it exists
      const nameAttribute = packageInfo?.attributes?.find(attr => attr.name === 'name');
      state.selectedAttributes = nameAttribute ? [nameAttribute] : [];
      
      state.filteredItems = [];
    },

    // Toggle attribute selection
    toggleAttribute: (state, action) => {
      const attribute = action.payload;
      
      // Prevent toggling off the 'name' attribute
      if (attribute.name === 'name') {
        return;
      }
      
      const index = state.selectedAttributes.findIndex(
        attr => attr.name === attribute.name
      );
      
      if (index !== -1) {
        // Remove if already selected
        state.selectedAttributes.splice(index, 1);
      } else {
        // Add if not selected
        state.selectedAttributes.push(attribute);
      }
    },

    // Set multiple attributes at once
    setTestAttributes: (state, action) => {
      const attributes = action.payload;
      
      // Ensure 'name' attribute is always included if it exists in packageInfo
      const nameAttribute = state.packageInfo?.attributes?.find(attr => attr.name === 'name');
      const hasNameAttribute = attributes.some(attr => attr.name === 'name');
      
      if (nameAttribute && !hasNameAttribute) {
        state.selectedAttributes = [nameAttribute, ...attributes];
      } else {
        state.selectedAttributes = attributes;
      }
    },

    // Initialize test with filtered items
    initializeTest: (state, action) => {
      const { division, divisionOption, filteredItems, timeLimit, selectedAttributes } = action.payload;
      state.filteredItems = filteredItems;
      state.totalItems = filteredItems.length;
      state.division = division;
      state.divisionOption = divisionOption;
      state.timeLimit = timeLimit || 300;
      
      state.testStarted = true;
      state.testEnded = false;
      state.currentView = 'name';
      state.discoveredItems = [];

      if (selectedAttributes) {
        state.selectedAttributes = selectedAttributes;
      }

      state.currentItemIndex = 0;
      state.pointsEarned = 0;
      state.totalPoints = state.totalItems * state.selectedAttributes.length;

      state.results = resetResults(filteredItems, state.selectedAttributes);
    },

    // Set current view (name, cards, list, map)
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },

    // Discover a new item (add to discovered items)
    discoverItem: (state, action) => {
      const item = action.payload;
      // Check if item is not already discovered
      const isAlreadyDiscovered = state.discoveredItems.some(
        discovered => discovered._id === item._id
      );
      if (!isAlreadyDiscovered) {
        state.discoveredItems.push(item);
      }
    },

    // Submit an attribute answer for a discovered item
    submitAttributeAnswer: (state, action) => {
      const { itemName, attributeName, input, isCorrect, correctAnswer } = action.payload;
      
      // Find or create result entry for this item
      let resultIndex = state.results.findIndex(r => r.itemName === itemName);
      
      if (resultIndex === -1) {
        // Create new result entry
        const newResult = {
          itemName,
          answers: state.selectedAttributes.map(attr => ({
            attributeName: attr.name,
            answer: correctAnswer || '',
            input: '',
            correct: false,
          }))
        };
        state.results.push(newResult);
        resultIndex = state.results.length - 1;
      }
      
      // Update the specific attribute answer
      const answerIndex = state.results[resultIndex].answers.findIndex(
        a => a.attributeName === attributeName
      );
      
      if (answerIndex !== -1) {
        state.results[resultIndex].answers[answerIndex].input = input;
        state.results[resultIndex].answers[answerIndex].correct = isCorrect;
        if (isCorrect) {
          state.results[resultIndex].answers[answerIndex].answer = correctAnswer;
        }
      }
    },

    // Submit answer for current item
    submitTestAnswer: (state, action) => {
      const { itemId, answers, correctCount } = action.payload;
      
      state.answeredItems.push({
        itemId,
        answers,
        correctCount,
      });
      
      state.totalCorrect += correctCount;
      state.currentItemIndex += 1;
      
      // Check if test is complete
      if (state.currentItemIndex >= state.filteredItems.length) {
        state.testEnded = true;
        state.testStarted = false;
      }
    },

    // End test early
    endTest: (state) => {
      state.testEnded = true;
      state.testStarted = false;
    },

    // Reset test state
    resetTest: (state) => {
      return initialState;
    },

    // Quick restart with same settings
    quickRestartTest: (state) => {
      state.currentItemIndex = 0;
      state.answeredItems = [];
      state.totalCorrect = 0;
      state.testStarted = false;
      state.testEnded = false;
      state.currentView = 'name';
      state.discoveredItems = [];
      state.results = [];
    },

    // Set error
    setTestError: (state, action) => {
      state.error = action.payload;
    },

    // Clear error
    clearTestError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const {
  setTestPackage,
  setTestDivision,
  toggleAttribute,
  setTestAttributes,
  initializeTest,
  startTest,
  setCurrentView,
  discoverItem,
  submitAttributeAnswer,
  submitTestAnswer,
  endTest,
  resetTest,
  quickRestartTest,
  setTestError,
  clearTestError,
} = testSlice.actions;

// Selectors
export const selectTestPackage = (state) => state.test.packageInfo;
export const selectTestDivision = (state) => ({
  division: state.test.division,
  divisionOption: state.test.divisionOption,
});
export const selectTestAttributes = (state) => state.test.selectedAttributes;
export const selectTestProgress = (state) => ({
  currentItemIndex: state.test.currentItemIndex,
  totalItems: state.test.totalItems,
  totalCorrect: state.test.totalCorrect,
});
export const selectCurrentTestItem = (state) => {
  const { filteredItems, currentItemIndex } = state.test;
  return filteredItems[currentItemIndex] || null;
};
export const selectTestStatus = (state) => ({
  testStarted: state.test.testStarted,
  testEnded: state.test.testEnded,
});
export const selectCurrentView = (state) => state.test.currentView;
export const selectDiscoveredItems = (state) => state.test.discoveredItems;
export const selectTestResults = (state) => state.test.results;
export const selectFilteredItems = (state) => state.test.filteredItems;

// Export reducer
export default testSlice.reducer;

