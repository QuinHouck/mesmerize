// User types for preferences, statistics, and achievements

export interface UserPreferences {
    soundEnabled: boolean;
    vibrationEnabled: boolean;
}

export interface UserStatistics {
    totalQuizzesPlayed: number;
    totalTestsPlayed: number;
}

export interface Achievement {
    id: string;
    unlockedAt?: string;
    [key: string]: any; // For additional achievement properties
}

export interface UpdateStatisticsPayload {
    gameType: 'quiz' | 'test';
}

// Settings types - these can store any game configuration
export type QuizSettings = {
    pack: string,
    div: string,
    divOptionName: string,
    question: string,
    questionType: string,
    answer: string,
    answerType: string
};

export type TestSettings = {
    pack: string,
    div: string | null,
    divOptionName: string | null,
    attributes: string[]
};