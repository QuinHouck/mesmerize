import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { resetResults } from "../helpers/testHelper";
import type { PackageInfo, PackageAttribute, PackageItem } from '../../types/package';
import type { TestView, SetTestPackagePayload, InitializeTestPayload, TestResult, SubmitAttributeAnswerPayload } from '../../types/test';

// State interface
interface TestState {
    packageName: string | null;
    packageInfo: PackageInfo | null;
    division: string | null;
    divisionOption: string | null;
    currentView: TestView;
    selectedAttributes: PackageAttribute[];
    filteredItems: PackageItem[];
    discoveredItems: PackageItem[];
    results: TestResult[];
    currentItemIndex: number;
    timeLimit: number;
    testStarted: boolean;
    testEnded: boolean;
    totalItems: number;
    pointsEarned: number;
    totalPoints: number;
    images: any;
    error: string | null;
}

// Initial state
const initialState: TestState = {
    packageName: null,
    packageInfo: null,
    division: null,
    divisionOption: null,
    currentView: 'name',
    selectedAttributes: [],
    filteredItems: [],
    discoveredItems: [],
    results: [],
    currentItemIndex: 0,
    timeLimit: 300,
    testStarted: false,
    testEnded: false,
    totalItems: 0,
    pointsEarned: 0,
    totalPoints: 0,
    images: null,
    error: null,
};

// Create the slice
const testSlice = createSlice({
    name: 'test',
    initialState,
    reducers: {
        // Set package for test
        setTestPackage: (state, action: PayloadAction<SetTestPackagePayload>) => {
            const { packageName, packageInfo } = action.payload;
            state.packageName = packageName;
            state.packageInfo = packageInfo;
            state.division = null;
            state.divisionOption = null;

            // Always include 'name' attribute if it exists
            const nameAttribute = packageInfo?.attributes?.find(attr => attr.name === 'name');
            state.selectedAttributes = nameAttribute ? [nameAttribute] : [];

            state.filteredItems = [];
        },

        // Toggle attribute selection
        toggleAttribute: (state, action: PayloadAction<PackageAttribute>) => {
            const attribute = action.payload;

            // Prevent toggling off the 'name' attribute
            if (attribute.name === 'name') {
                return;
            }

            const index = state.selectedAttributes.findIndex(
                attr => attr.name === attribute.name
            );

            if (index !== -1) {
                state.selectedAttributes.splice(index, 1);
            } else {
                state.selectedAttributes.push(attribute);
            }
        },

        // Set multiple attributes at once
        setTestAttributes: (state, action: PayloadAction<PackageAttribute[]>) => {
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
        initializeTest: (state, action: PayloadAction<InitializeTestPayload>) => {
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

            state.selectedAttributes = selectedAttributes;

            state.currentItemIndex = 0;
            state.pointsEarned = 0;
            state.totalPoints = state.totalItems * state.selectedAttributes.length;

            state.results = resetResults(filteredItems, state.selectedAttributes);
        },

        // Set current view (name, cards, list, map)
        setCurrentView: (state, action: PayloadAction<TestView>) => {
            state.currentView = action.payload;
        },

        // Discover a new item (add to discovered items)
        discoverItem: (state, action: PayloadAction<PackageItem>) => {
            const item = action.payload;
            const isAlreadyDiscovered = state.discoveredItems.some(
                discovered => discovered._id === item._id
            );
            if (!isAlreadyDiscovered) {
                state.discoveredItems.push(item);
            }
        },

        // Submit an attribute answer for a discovered item
        submitAttributeAnswer: (state, action: PayloadAction<SubmitAttributeAnswerPayload>) => {
            const { itemName, attributeName, input, isCorrect, correctAnswer } = action.payload;

            // Find the result for this item and attribute
            const result = state.results.find(
                r => r.itemName === itemName && r.attributeName === attributeName
            );

            if (result) {
                result.input = input;
                result.correct = isCorrect;
                result.answered = true;
                if (isCorrect) {
                    result.answer = correctAnswer;
                }
            }
        },

        // End test early
        endTest: (state) => {
            state.testEnded = true;
            state.testStarted = false;
        },

        // Reset test state
        resetTest: () => {
            return initialState;
        },

        // Quick restart with same settings
        quickRestartTest: (state) => {
            state.currentItemIndex = 0;
            state.testStarted = false;
            state.testEnded = false;
            state.currentView = 'name';
            state.discoveredItems = [];
            state.results = [];
        },

        // Set error
        setTestError: (state, action: PayloadAction<string>) => {
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
    toggleAttribute,
    setTestAttributes,
    initializeTest,
    setCurrentView,
    discoverItem,
    submitAttributeAnswer,
    endTest,
    resetTest,
    quickRestartTest,
    setTestError,
    clearTestError,
} = testSlice.actions;

// Export reducer
export default testSlice.reducer;

