import type { PackageAttribute, PackageItem } from '../../types/package';
import type { TestAttributeResult, TestItemResult } from '../../types/test';

/**
 * Creates initial results array for all items with empty answers
 * Returns a flat array of TestResult for each item-attribute combination
 */
export const resetResults = (
    items: PackageItem[],
    attributes: PackageAttribute[]
): TestItemResult[] => {
    const results: TestItemResult[] = [];

    for (const item of items) {

        const attributeResults: TestAttributeResult[] = [];
        for (const attribute of attributes) {
            // Only include string or number attributes
            if (attribute.type === 'string' || attribute.type === 'number') {
                attributeResults.push({
                    attributeName: attribute.name,
                    answer: item[attribute.name],
                    input: '',
                    correct: false,
                    answered: false,
                });
            }
        }

        const itemResult: TestItemResult = {
            itemName: item.name,
            attributeResults: attributeResults,
        };

        results.push(itemResult);
    }

    return results;
};

/**
 * Calculates total correct answers for a specific item
 */
export const getItemCorrectCount = (results: TestItemResult[], itemName: string): number => {
    if (!results) return 0;
    const itemResult = results.find(r => r.itemName === itemName);
    if (!itemResult) return 0;
    return itemResult.attributeResults.filter(attr => attr.correct).length;
};

/**
 * Calculates total correct answers across all results
 */
export const getTotalCorrectCount = (results: TestItemResult[]): number => {
    if (!results) return 0;
    return results.reduce((total, itemResult) => {
        return total + itemResult.attributeResults.filter(attr => attr.correct).length;
    }, 0);
};

/**
 * Calculates percentage of correct answers
 */
export const getCorrectPercentage = (results: TestItemResult[], totalPossible: number): number => {
    if (totalPossible === 0) return 0;
    const correct = getTotalCorrectCount(results);
    return Math.floor((correct / totalPossible) * 100);
};

