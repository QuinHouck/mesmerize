# Mesmerize Quiz App - Frontend

## Overview
This is a React Native/Expo quiz application that allows users to download educational packages from a backend server and take quizzes/tests offline. The app features a modern architecture with Redux state management, offline-first design, and comprehensive package management.

**Tech Stack:**
- **Framework**: React Native with Expo SDK 53
- **State Management**: Redux Toolkit with Redux Persist
- **Navigation**: React Navigation v6
- **Storage**: AsyncStorage for offline data persistence
- **Styling**: React Native StyleSheet with custom color system

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── icons/              # SVG icons and assets
│   ├── images/             # Static images and maps
│   ├── screens/            # Main app screens
│   ├── services/           # API service layer
│   ├── store/              # Redux store and slices
│   └── util/               # Utility functions
├── App.js                  # Main app component with Redux Provider
├── app.json               # Expo configuration
└── metro.config.js        # Metro bundler configuration
```

## State Management Architecture

### Redux Store Structure
The app uses Redux Toolkit with three main slices:

#### 1. Packages Slice (`store/slices/packagesSlice.js`)
**Purpose**: Manages all package-related data and operations

**State Structure**:
```javascript
{
  available: [],           // Packages available for download
  downloaded: [],          // Locally stored packages
  currentPackage: null,    // Currently selected package
  loading: false,          // Loading state
  error: null,            // Error messages
  lastUpdated: null       // Last fetch timestamp
}
```

**Key Actions**:
- `fetchAvailablePackages()` - Gets packages from server
- `downloadPackage(packageInfo)` - Downloads and stores package locally
- `loadDownloadedPackages()` - Loads packages from AsyncStorage
- `uninstallPackage(packageName)` - Removes package and cleans storage
- `setCurrentPackage(package)` - Sets active package

**AsyncStorage Integration**:
- Automatically saves downloaded packages
- Maintains package metadata in "packs" key
- Handles package updates and versioning

#### 2. User Slice (`store/slices/userSlice.js`)
**Purpose**: Manages user preferences, settings, and statistics

**State Structure**:
```javascript
{
  lastQuizSettings: null,     // Last quiz configuration
  lastTestSettings: null,     // Last test configuration
  preferences: {              // User preferences
    soundEnabled: true,
    vibrationEnabled: true,
    autoSave: true,
    defaultTimeLimit: 45
  },
  statistics: {               // User performance data
    totalQuizzesPlayed: 0,
    totalTestsPlayed: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0
  },
  achievements: []           // Unlocked achievements
}
```

**Key Actions**:
- `setLastQuizSettings()` - Saves quiz configuration
- `updatePreferences()` - Updates user preferences
- `updateStatistics()` - Tracks performance metrics
- `addAchievement()` - Unlocks achievements

#### 3. Game Slice (`store/slices/gameSlice.js`)
**Purpose**: Manages active game state (quiz or test)

**State Structure**:
```javascript
{
  // Game Configuration
  gameType: null,            // 'quiz' or 'test'
  packageName: null,         // Current package
  packageData: null,         // Package metadata
  
  // Game Settings
  question: null,            // Question field
  questionType: null,       // 'text', 'image', 'map'
  answer: null,              // Answer field
  answerType: null,          // 'string', 'number'
  division: null,            // Filter division
  divisionOption: null,      // Filter option
  range: {                   // Range filter
    ranged: false,
    start: 1,
    end: 1,
    attr: null
  },
  
  // Game State
  isActive: false,          // Game running
  isPaused: false,         // Game paused
  isEnded: false,          // Game finished
  
  // Current Question
  currentIndex: 0,         // Current question index
  selectedItems: [],       // Questions to answer
  results: [],             // User answers and scores
  
  // Scoring
  points: 0,               // Current score
  correctAnswers: 0,       // Correct count
  totalQuestions: 0,      // Total questions
  
  // Timer
  timeRemaining: 45,      // Time left
  timeLimit: 45,          // Total time
  timerId: null,          // Timer reference
  
  // Input
  currentInput: '',       // Current answer input
  
  // Images (for image questions)
  images: null,           // Image data
  imageHeight: '50%'      // Image display height
}
```

**Key Actions**:
- `initializeGame()` - Sets up new game
- `startGame()` - Begins game
- `pauseGame()` / `resumeGame()` - Game control
- `submitAnswer()` - Processes user answer
- `nextQuestion()` - Advances to next question
- `endGame()` - Finishes game

### Redux Persist Configuration
- **Packages**: Automatically persisted to AsyncStorage
- **User**: Automatically persisted to AsyncStorage
- **Game**: Not persisted (temporary state)

## Screen Architecture

### 1. HomeScreen (`screens/HomeScreen.js`)
**Purpose**: Main landing page with game mode selection

**Features**:
- Animated logo on startup
- Game mode buttons (Quiz, Test)
- Navigation to Store and Acknowledgements
- Uses Redux for any future user preferences

**Navigation Flow**:
- Quiz → QuizOptionScreen
- Test → TestOptionScreen
- Store → StoreScreen

### 2. StoreScreen (`screens/StoreScreen.js`)
**Purpose**: Package management and download interface

**Redux Integration**:
- Uses `usePackages()` hook for state access
- Dispatches `fetchAvailablePackages()` and `loadDownloadedPackages()`
- Handles download/uninstall operations through Redux actions
- Shows loading and error states from Redux

**Features**:
- Lists available packages from server
- Shows downloaded packages
- Package download/update/uninstall
- Version checking and updates
- Error handling with retry functionality

### 3. QuizOptionScreen (`screens/QuizOptionScreen.js`)
**Purpose**: Quiz configuration and package selection

**Current State**: Uses local state and AsyncStorage directly
**Needs Update**: Should be converted to use Redux

**Features**:
- Package selection dropdown
- Division filtering (All, specific divisions, ranges)
- Question/Answer field selection
- Game settings persistence
- Range slider for filtered questions

### 4. TestOptionScreen (`screens/TestOptionScreen.js`)
**Purpose**: Test configuration and package selection

**Current State**: Uses local state and AsyncStorage directly
**Needs Update**: Should be converted to use Redux

**Features**:
- Similar to QuizOptionScreen
- Test-specific settings
- Time limit configuration

### 5. QuizGameScreen (`screens/QuizGameScreen.js`)
**Purpose**: Active quiz gameplay

**Current State**: Uses local state and navigation params
**Needs Update**: Should be converted to use Redux game slice

**Features**:
- Question display (text, image, map)
- Answer input handling
- Timer management
- Scoring system
- Pause/resume functionality
- Navigation between questions

### 6. TestGameScreen (`screens/TestGameScreen.js`)
**Purpose**: Active test gameplay

**Current State**: Uses local state and navigation params
**Needs Update**: Should be converted to use Redux game slice

**Features**:
- Similar to QuizGameScreen
- Test-specific scoring
- Time-based evaluation

### 7. QuizResultsScreen (`screens/QuizResultsScreen.js`)
**Purpose**: Displays quiz results and statistics

**Current State**: Uses navigation params
**Needs Update**: Should use Redux for results data

**Features**:
- Score display
- Question-by-question review
- Statistics tracking
- Navigation back to options

## Component Architecture

### Custom Hooks (`hooks/useRedux.js`)
**Purpose**: Simplified Redux access patterns

**Available Hooks**:
- `usePackages()` - Package state and actions
- `useUser()` - User state and actions  
- `useGame()` - Game state and actions
- `useApp()` - Combined app state

**Usage Example**:
```javascript
const { available, downloaded, loading, dispatch } = usePackages();
const { preferences, updatePreferences } = useUser();
```

### Reusable Components (`components/`)
- **Map.js**: Interactive map component for geography questions
- **Custom UI**: Consistent styling and behavior

## Service Layer (`services/`)

### Package Service (`services/package.service.js`)
**Purpose**: API communication with backend

**Methods**:
- `getAvailable()` - Fetch available packages
- `getPackage(name)` - Download specific package
- `create(data)` - Create new package (admin)

**Configuration**:
- Base URL: `http://3.91.197.7:8080/api/packages`
- Uses Axios for HTTP requests
- Handles package data serialization

## Utility Functions (`util/`)

### Colors (`util/colors.js`)
**Purpose**: Centralized color system
- Consistent theming across app
- Dark/light mode support
- Brand color definitions

### Extra Functions (`util/extraFuncs.js`)
**Purpose**: Helper functions
- String distance calculation for answer matching
- Data processing utilities
- Common algorithms

### Image Handling (`util/getImages.js`)
**Purpose**: Image management for questions
- Dynamic image loading
- Aspect ratio calculation
- Image optimization

## Configuration Files

### App Configuration (`app.json`)
**Expo SDK 53 Features**:
- New Architecture enabled
- Android edge-to-edge display
- Development client plugin
- Asset bundle patterns
- Platform-specific settings

### Metro Configuration (`metro.config.js`)
**Features**:
- SVG transformer for custom icons
- Package exports disabled (SDK 53 compatibility)
- Custom asset handling

## Data Flow Architecture

### Package Download Flow
1. **StoreScreen** → `fetchAvailablePackages()` → Backend API
2. **User Selection** → `downloadPackage()` → Backend API + AsyncStorage
3. **Redux Update** → Package added to downloaded state
4. **Persistence** → Redux Persist saves to AsyncStorage

### Game Initialization Flow
1. **Option Screen** → User configures game settings
2. **Game Start** → `initializeGame()` action dispatched
3. **Redux State** → Game state populated with settings
4. **Screen Navigation** → Game screen accesses Redux state
5. **Gameplay** → Actions update game state in real-time

### Offline Data Flow
1. **Package Download** → Full package data stored in AsyncStorage
2. **App Startup** → Redux Persist rehydrates state
3. **Offline Usage** → All data available without network
4. **Sync on Return** → Updates available when online

## Development Workflow

### Adding New Features
1. **Define State** → Add to appropriate Redux slice
2. **Create Actions** → Define action creators
3. **Update Components** → Use Redux hooks
4. **Test Offline** → Ensure AsyncStorage persistence

### Debugging
- **Redux DevTools**: Available in development
- **AsyncStorage**: Check stored data in device storage
- **Console Logs**: Redux actions logged automatically

### Performance Considerations
- **Lazy Loading**: Packages loaded on demand
- **Image Optimization**: Dynamic image sizing
- **Memory Management**: Game state cleared after completion
- **Storage Cleanup**: Unused packages can be removed

## Future Enhancements

### Planned Updates
1. **Complete Redux Migration**: Update remaining screens
2. **Offline Sync**: Background sync when online
3. **User Accounts**: Authentication and cloud sync
4. **Analytics**: User behavior tracking
5. **Achievements**: Gamification features

### Technical Debt
1. **TypeScript Migration**: Convert to TypeScript
2. **Testing**: Add unit and integration tests
3. **Error Boundaries**: Better error handling
4. **Performance**: Optimize large package handling
