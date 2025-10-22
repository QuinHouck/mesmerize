import type { PackageItem, PackageAttribute } from '../../types/package';
import type { TestResult } from '../../types/test';

/**
 * Creates initial results array for all items with empty answers
 * Returns a flat array of TestResult for each item-attribute combination
 */
export const resetResults = (
    items: PackageItem[],
    attributes: PackageAttribute[]
): TestResult[] => {
    const results: TestResult[] = [];
    
    for (const item of items) {
        for (const attribute of attributes) {
            // Only include string or number attributes
            if (attribute.type === 'string' || attribute.type === 'number') {
                results.push({
                    itemName: item.name,
                    attributeName: attribute.name,
                    answer: item[attribute.name],
                    input: '',
                    correct: false,
                    answered: false,
                });
            }
        }
    }
    
    return results;
};

/**
 * Calculates total correct answers for a specific item
 */
export const getItemCorrectCount = (results: TestResult[], itemName: string): number => {
    if (!results) return 0;
    return results.filter(r => r.itemName === itemName && r.correct).length;
};

/**
 * Calculates total correct answers across all results
 */
export const getTotalCorrectCount = (results: TestResult[]): number => {
    if (!results) return 0;
    return results.filter(r => r.correct).length;
};

/**
 * Calculates percentage of correct answers
 */
export const getCorrectPercentage = (results: TestResult[], totalPossible: number): number => {
    if (totalPossible === 0) return 0;
    const correct = getTotalCorrectCount(results);
    return Math.floor((correct / totalPossible) * 100);
};

