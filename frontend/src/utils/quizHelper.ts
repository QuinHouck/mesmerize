import type { PackageItem } from '../types/package';
import type { QuizResult } from '../types/quiz';

export const resetResults = (
    items: PackageItem[],
    question: string,
    answer: string
): QuizResult[] => {
    return items.map((item) => ({
        itemName: item.name,
        question: item[question],
        answer: item[answer],
        input: null,
        correct: false,
    }));
};

export const getSelectedItems = (
    filtered: PackageItem[],
    num: number
): PackageItem[] => {
    // Create a working copy so we don't mutate the original
    let available = [...filtered];
    let chosen: PackageItem[] = [];

    while (chosen.length < num && available.length > 0) {
        // Calculate cumulative weights for remaining items
        let weights: number[] = [];
        let total = 0;
        for (const item of available) {
            const weight = item.weight ?? 1;
            total += weight;
            weights.push(total);
        }

        // Select random item based on weight
        let random = Math.random() * total;
        let selectedIndex = 0;
        for (let i = 0; i < weights.length; i++) {
            if (weights[i] > random) {
                selectedIndex = i;
                break;
            }
        }

        // Add selected item and remove from available pool
        chosen.push(available[selectedIndex]);
        available.splice(selectedIndex, 1);
    }

    // Shuffle the final selection
    chosen = chosen.sort(() => 0.5 - Math.random());
    return chosen;
};

export const updateWeights = (
    items: PackageItem[],
    results: QuizResult[]
): PackageItem[] => {
    for (const result of results) {
        const item = items.find(i => i.name === result.itemName);
        if (!item) continue; // no match found, skip

        if (result.correct) {
            item.weight = Math.max((item.weight ?? 1) - 20, 1); // Subtract 20 from the weight or back to 1
        } else if (result.input !== null && result.input !== "") {
            // Set the weight back to 60 if incorrect and answered
            item.weight = 60;
        }
    }

    return items;
};

