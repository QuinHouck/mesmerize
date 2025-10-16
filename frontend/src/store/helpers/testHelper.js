/**
 * Creates initial results array for all items with empty answers
 */
export const resetResults = (items, attributes) => {
    return items.map((item) => ({
        itemName: item.name,
        answers: attributes
            .filter(attr => attr.type === 'string' || attr.type === 'number')
            .map((attribute) => ({
                attributeName: attribute.name,
                answer: item[attribute.name],
                input: '',
                correct: false,
            })),
    }));
};

/**
 * Creates a result entry for a single discovered item
 */
export const createItemResult = (item, attributes) => {
    return {
        itemName: item.name,
        answers: attributes
            .filter(attr => attr.type === 'string' || attr.type === 'number')
            .map((attribute) => ({
                attributeName: attribute.name,
                answer: item[attribute.name],
                input: '',
                correct: false,
            })),
    };
};

/**
 * Calculates total correct answers for an item
 */
export const getItemCorrectCount = (result) => {
    if (!result || !result.answers) return 0;
    return result.answers.filter(answer => answer.correct).length;
};

/**
 * Calculates total correct answers across all results
 */
export const getTotalCorrectCount = (results) => {
    if (!results) return 0;
    return results.reduce((total, result) => {
        return total + getItemCorrectCount(result);
    }, 0);
};

/**
 * Calculates percentage of correct answers
 */
export const getCorrectPercentage = (results, totalPossible) => {
    if (totalPossible === 0) return 0;
    const correct = getTotalCorrectCount(results);
    return Math.floor((correct / totalPossible) * 100);
};