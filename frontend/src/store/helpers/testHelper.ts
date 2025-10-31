import type { Images, PackageAttribute, PackageItem } from '../../types/package';
import type { TestAttributeResult, TestItemResult } from '../../types/test';
import { getImages } from '../../util/getImages';

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
            if (attribute.type!== 'map') {
                attributeResults.push({
                    attributeName: attribute.name,
                    answer: attribute.type === 'image' ? item.name : item[attribute.name],
                    input: '',
                    correct: false,
                    answered: false,
                    type: attribute.type,
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
 * Gets all images for the given items based on the attribute
 * Returns a map of item names to their image data
 * 
 * @param items - Array of items to get images for
 * @param attribute - The image attribute (used to determine if images should be loaded)
 * @param packageName - Package name to determine which images to load
 * @returns Promise resolving to Images object or null if no images found
 */
export const getAttributeImages = async (
    items: PackageItem[],
    attribute: PackageAttribute,
    packageName: string
): Promise<Images> => {
    // Only proceed if attribute type is 'image'
    if (attribute.type !== 'image') {
        return null;
    }

    // If no items, return null
    if (!items || items.length === 0) {
        return null;
    }

    try {
        // Use existing getImages function to load all images for the items
        const { imgs } = await getImages(items, packageName);
        return imgs;
    } catch (error) {
        console.error('Error loading attribute images:', error);
        return null;
    }
}

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

