import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Images, PackageAttribute, PackageInfo, PackageItem } from '../../types/package';
import type { InitializeTestPayload, SetTestAttributesPayload, SetTestImagesPayload, SetTestPackagePayload, SubmitAttributeAnswerPayload, TestItemResult, TestView } from '../../types/test';
import { resetResults } from "../../utils/testHelper";

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
    results: TestItemResult[];
    lastDiscoveredItem: PackageItem | null;
    currentItemIndex: number;
    timeLimit: number;
    timeElapsed: number;
    testStarted: boolean;
    testEnded: boolean;
    totalItems: number;
    pointsEarned: number;
    totalPoints: number;
    images: Images;
    error: string | null;
    hasMapAttribute: boolean;
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
    lastDiscoveredItem: null,
    currentItemIndex: 0,
    timeLimit: 300,
    timeElapsed: 0,
    testStarted: false,
    testEnded: false,
    totalItems: 0,
    pointsEarned: 0,
    totalPoints: 0,
    images: null,
    error: null,
    hasMapAttribute: false,
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
        setTestAttributes: (state, action: PayloadAction<SetTestAttributesPayload>) => {
            const { attributeNames } = action.payload;

            if (!state.packageInfo?.attributes) {
                return;
            }

            // Find the full PackageAttribute objects based on the names
            const selectedAttributes: PackageAttribute[] = [];

            // Always include the 'name' attribute if it exists
            const nameAttribute = state.packageInfo.attributes.find(attr => attr.name === 'name');
            if (nameAttribute) {
                selectedAttributes.push(nameAttribute);
            }

            // Add other attributes based on the provided names
            for (const attributeName of attributeNames) {
                // Skip 'name' since it's already added above
                if (attributeName === 'name') {
                    continue;
                }

                const attribute = state.packageInfo.attributes.find(attr => attr.name === attributeName);
                if (attribute) {
                    selectedAttributes.push(attribute);
                }
            }

            state.selectedAttributes = selectedAttributes;
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
            state.lastDiscoveredItem = null;

            state.selectedAttributes = selectedAttributes;

            state.currentItemIndex = 0;
            state.pointsEarned = 0;
            state.totalPoints = state.totalItems * state.selectedAttributes.length;
            state.timeElapsed = 0;

            state.results = resetResults(filteredItems, state.selectedAttributes);

            // Todo: remove presdient specific logic
            state.hasMapAttribute = state.packageInfo?.attributes?.some(attr => attr.type === 'map') && state.packageInfo?.name !== 'presidents' || false;
        },

        setCurrentItemIndex: (state, action: PayloadAction<number>) => {
            state.currentItemIndex = action.payload;
        },

        // Set current view (name, cards, list, map)
        setCurrentView: (state, action: PayloadAction<TestView>) => {
            const requestedView = action.payload;
            // Prevent navigation to cards if only name attribute is selected
            const onlyNameSelected = state.selectedAttributes.length === 1 && 
                state.selectedAttributes[0].name === 'name';
            if (requestedView === 'cards' && onlyNameSelected) {
                // Redirect to name view if trying to navigate to cards with only name selected
                state.currentView = 'name';
            } else if (requestedView === 'map') {
                // Only allow navigation to map if package has a map attribute
                if (state.hasMapAttribute) {
                    state.currentView = requestedView;
                }
            } else {
                state.currentView = requestedView;
            }
        },

        // Discover a new item (add to discovered items)
        discoverItem: (state, action: PayloadAction<PackageItem>) => {
            const item = action.payload;
            const isAlreadyDiscovered = state.discoveredItems.some(
                discovered => discovered._id === item._id
            );
            if (!isAlreadyDiscovered) {
                state.discoveredItems.push(item);
                state.lastDiscoveredItem = item;
            }
        },

        // Submit an attribute answer for a discovered item
        submitAttributeAnswer: (state, action: PayloadAction<SubmitAttributeAnswerPayload>) => {
            const { itemName, attributeName, input, isCorrect, correctAnswer } = action.payload;

            // Find the result for this item
            const itemResult = state.results.find(r => r.itemName === itemName);

            if (itemResult) {
                // Find the specific attribute result within the item
                const attributeResult = itemResult.attributeResults.find(
                    attr => attr.attributeName === attributeName
                );

                if (attributeResult) {
                    attributeResult.input = input;
                    attributeResult.correct = isCorrect;
                    attributeResult.answered = true;
                    if (isCorrect) {
                        attributeResult.answer = correctAnswer;
                        state.pointsEarned += 1;
                    }
                }
            }
        },

        // End test early
        endTest: (state, action: PayloadAction<{ timeElapsed: number }>) => {
            state.testEnded = true;
            state.testStarted = false;
            state.timeElapsed = action.payload.timeElapsed;
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
            state.lastDiscoveredItem = null;
            state.pointsEarned = 0;
            state.timeElapsed = 0;

            // Recreate results array with fresh data from filteredItems
            if (state.filteredItems.length > 0 && state.selectedAttributes.length > 0) {
                state.results = resetResults(state.filteredItems, state.selectedAttributes);
            }
        },

        // Set error
        setTestError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },

        // Clear error
        clearTestError: (state) => {
            state.error = null;
        },

        // Set images
        setTestImages: (state, action: PayloadAction<SetTestImagesPayload>) => {
            const { images } = action.payload;
            if (images) {
                state.images = images;
            } else {
                console.log("No images found")
            }
        },
    },
});

// Export actions
export const {
    setTestPackage,
    toggleAttribute,
    setTestAttributes,
    initializeTest,
    setCurrentItemIndex,
    setCurrentView,
    discoverItem,
    submitAttributeAnswer,
    endTest,
    resetTest,
    quickRestartTest,
    setTestError,
    clearTestError,
    setTestImages,
} = testSlice.actions;

// Export reducer
export default testSlice.reducer;

