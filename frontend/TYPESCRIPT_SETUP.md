# TypeScript Setup for Frontend

## 📦 Required Packages to Install

Run the following command in the `frontend` directory:

```bash
npm install --save-dev typescript @types/react @types/react-native @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Package Breakdown:

1. **typescript** - The TypeScript compiler
2. **@types/react** - Type definitions for React
3. **@types/react-native** - Type definitions for React Native
4. **@typescript-eslint/parser** - ESLint parser for TypeScript
5. **@typescript-eslint/eslint-plugin** - ESLint plugin for TypeScript rules

### Optional but Recommended Packages:

```bash
npm install --save-dev @types/node
```

This adds Node.js type definitions (useful for build scripts and utilities).

## ✅ What's Been Configured

### 1. TypeScript Configuration (`tsconfig.json`)
- Strict mode enabled for better type safety
- React Native JSX mode
- Module resolution configured for React Native
- Custom type declarations directory at `src/types`

### 2. Type Declaration Files
Created in `src/types/`:
- `global.d.ts` - SVG, PNG, JPG, JSON import declarations
- `redux.d.ts` - Redux store types (RootState, AppDispatch)
- `navigation.d.ts` - React Navigation types for all screens
- `package.d.ts` - Package/content data types
- `env.d.ts` - Environment configuration types

### 3. Metro Bundler Configuration
- Updated to process `.ts` and `.tsx` files
- Maintains existing SVG transformer support

### 4. ESLint Configuration
- Added TypeScript parser and plugin
- Configured TypeScript-specific rules
- Disabled conflicting JavaScript rules

### 5. Package.json Scripts
Added new script:
- `npm run type-check` - Run TypeScript compiler to check for errors without emitting files

## 🚀 Next Steps After Installing Packages

1. **Install the packages** (command above)

2. **Test the TypeScript setup:**
   ```bash
   npm run type-check
   ```

3. **Start converting files:**
   - Start with utility files (simplest)
   - Then convert Redux slices
   - Then components
   - Finally screens

4. **File conversion process:**
   - Rename `.js` to `.ts` (or `.tsx` for files with JSX)
   - Add type annotations
   - Fix any type errors
   - Test the file

## 📝 TypeScript Migration Tips

### Gradual Migration
- You can mix `.js` and `.ts` files during migration
- JavaScript files can import TypeScript files and vice versa
- Convert one file at a time and test

### Common Type Patterns

#### Typing React Components:
```typescript
import React from 'react';

interface MyComponentProps {
  title: string;
  count?: number;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, count = 0 }) => {
  return <Text>{title}: {count}</Text>;
};
```

#### Typing Redux Hooks:
```typescript
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../types/redux';

const MyComponent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const data = useSelector((state: RootState) => state.test.data);
  
  // ...
};
```

#### Typing Navigation:
```typescript
import { useNavigation } from '@react-navigation/native';
import type { HomeScreenNavigationProp } from '../types/navigation';

const MyComponent = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  navigation.navigate('QuizOption'); // Type-safe!
};
```

## 🔧 Adjusting Strictness

If TypeScript is too strict initially, you can relax some settings in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": false,  // or disable individual strict flags
    "noImplicitAny": false,
    "strictNullChecks": false
  }
}
```

Then gradually enable strict mode as you convert files.

## ⚠️ Common Issues

### Issue: `require` is not defined
**Solution:** Use ES6 imports instead, or the types in `global.d.ts` should handle it.

### Issue: Cannot find module for SVG imports
**Solution:** Already handled in `global.d.ts`. Make sure TypeScript can find it.

### Issue: Redux types are complex
**Solution:** The types in `redux.d.ts` provide `RootState` and `AppDispatch` - use these throughout.

### Issue: Navigation types are confusing
**Solution:** Update `navigation.d.ts` with your actual route parameters as you discover them.

## 📚 Resources

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React Native TypeScript Guide](https://reactnative.dev/docs/typescript)
- [Redux Toolkit TypeScript Guide](https://redux-toolkit.js.org/usage/usage-with-typescript)
- [React Navigation TypeScript Guide](https://reactnavigation.org/docs/typescript/)

