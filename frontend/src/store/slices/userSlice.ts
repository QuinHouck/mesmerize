import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserPreferences, UserStatistics, Achievement, UpdateStatisticsPayload, QuizSettings, TestSettings } from '../../types/user';

// State interface
interface UserState {
    lastQuizSettings: QuizSettings | null;
    lastTestSettings: TestSettings | null;
    preferences: UserPreferences;
    statistics: UserStatistics;
    achievements: Achievement[];
}

// Initial state
const initialState: UserState = {
    lastQuizSettings: null,
    lastTestSettings: null,
    preferences: {
        soundEnabled: true,
        vibrationEnabled: true,
    },
    statistics: {
        totalQuizzesPlayed: 0,
        totalTestsPlayed: 0,
    },
    achievements: [],
};

// Create the slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // Quiz settings
        setLastQuizSettings: (state, action: PayloadAction<QuizSettings>) => {
            state.lastQuizSettings = action.payload;
        },
        clearLastQuizSettings: (state) => {
            state.lastQuizSettings = null;
        },

        // Test settings
        setLastTestSettings: (state, action: PayloadAction<TestSettings>) => {
            state.lastTestSettings = action.payload;
        },
        clearLastTestSettings: (state) => {
            state.lastTestSettings = null;
        },

        // User preferences
        updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
            state.preferences = { ...state.preferences, ...action.payload };
        },
        setSoundEnabled: (state, action: PayloadAction<boolean>) => {
            state.preferences.soundEnabled = action.payload;
        },
        setVibrationEnabled: (state, action: PayloadAction<boolean>) => {
            state.preferences.vibrationEnabled = action.payload;
        },

        // Statistics
        updateStatistics: (state, action: PayloadAction<UpdateStatisticsPayload>) => {
            const { gameType } = action.payload;

            if (gameType === 'quiz') {
                state.statistics.totalQuizzesPlayed += 1;
            } else if (gameType === 'test') {
                state.statistics.totalTestsPlayed += 1;
            }
        },

        resetStatistics: (state) => {
            state.statistics = {
                totalQuizzesPlayed: 0,
                totalTestsPlayed: 0,
            };
        },

        // Achievements
        addAchievement: (state, action: PayloadAction<Achievement>) => {
            const achievement = action.payload;
            if (!state.achievements.find(a => a.id === achievement.id)) {
                state.achievements.push({
                    ...achievement,
                    unlockedAt: new Date().toISOString(),
                });
            }
        },

        clearAchievements: (state) => {
            state.achievements = [];
        },

        // Reset all user data
        resetUserData: () => {
            return initialState;
        },
    },
});

// Export actions
export const {
    setLastQuizSettings,
    clearLastQuizSettings,
    setLastTestSettings,
    clearLastTestSettings,
    updatePreferences,
    setSoundEnabled,
    setVibrationEnabled,
    updateStatistics,
    resetStatistics,
    addAchievement,
    clearAchievements,
    resetUserData,
} = userSlice.actions;

// Export reducer
export default userSlice.reducer;

