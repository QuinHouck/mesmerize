import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  lastQuizSettings: null,
  lastTestSettings: null,
  preferences: {
    soundEnabled: true,
    vibrationEnabled: true,
    autoSave: true,
    defaultTimeLimit: 45,
  },
  statistics: {
    totalQuizzesPlayed: 0,
    totalTestsPlayed: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
  },
  achievements: [],
};

// Create the slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Quiz settings
    setLastQuizSettings: (state, action) => {
      state.lastQuizSettings = action.payload;
    },
    clearLastQuizSettings: (state) => {
      state.lastQuizSettings = null;
    },
    
    // Test settings
    setLastTestSettings: (state, action) => {
      state.lastTestSettings = action.payload;
    },
    clearLastTestSettings: (state) => {
      state.lastTestSettings = null;
    },
    
    // User preferences
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setSoundEnabled: (state, action) => {
      state.preferences.soundEnabled = action.payload;
    },
    setVibrationEnabled: (state, action) => {
      state.preferences.vibrationEnabled = action.payload;
    },
    setDefaultTimeLimit: (state, action) => {
      state.preferences.defaultTimeLimit = action.payload;
    },
    
    // Statistics
    updateStatistics: (state, action) => {
      const { gameType, score, timeSpent } = action.payload;
      
      if (gameType === 'quiz') {
        state.statistics.totalQuizzesPlayed += 1;
      } else if (gameType === 'test') {
        state.statistics.totalTestsPlayed += 1;
      }
      
      // Update average score
      const totalGames = state.statistics.totalQuizzesPlayed + state.statistics.totalTestsPlayed;
      if (totalGames > 0) {
        state.statistics.averageScore = 
          (state.statistics.averageScore * (totalGames - 1) + score) / totalGames;
      }
      
      // Update best score
      if (score > state.statistics.bestScore) {
        state.statistics.bestScore = score;
      }
      
      // Update total time spent
      state.statistics.totalTimeSpent += timeSpent;
    },
    
    resetStatistics: (state) => {
      state.statistics = {
        totalQuizzesPlayed: 0,
        totalTestsPlayed: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
      };
    },
    
    // Achievements
    addAchievement: (state, action) => {
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
    resetUserData: (state) => {
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
  setDefaultTimeLimit,
  updateStatistics,
  resetStatistics,
  addAchievement,
  clearAchievements,
  resetUserData,
} = userSlice.actions;

// Export reducer
export default userSlice.reducer;
