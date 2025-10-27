// Test types for write-in test functionality

import type { PackageInfo, PackageAttribute, PackageItem } from './package';

export type TestView = 'name' | 'cards' | 'list' | 'map';

export interface TestAttributeResult {
    attributeName: string;
    answer: string | number;
    input: string | number;
    correct: boolean;
    answered: boolean;
}

export interface TestItemResult {
    itemName: string;
    attributeResults: TestAttributeResult[];
}

export interface SetTestPackagePayload {
    packageName: string;
    packageInfo: PackageInfo;
}

export interface InitializeTestPayload {
    division: string | null;
    divisionOption: string | null;
    filteredItems: PackageItem[];
    timeLimit: number;
    selectedAttributes: PackageAttribute[];
}

// Additional types needed for actions
export interface SubmitAttributeAnswerPayload {
    itemName: string;
    attributeName: string;
    input: string | number;
    isCorrect: boolean;
    correctAnswer: string | number;
}

export interface SetTestAttributesPayload {
    attributeNames: string[];
}

