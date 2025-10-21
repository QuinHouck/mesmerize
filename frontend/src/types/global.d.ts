// Global type declarations for the project

// SVG imports
declare module "*.svg" {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// Image imports
declare module "*.png" {
  const value: any;
  export default value;
}

declare module "*.jpg" {
  const value: any;
  export default value;
}

declare module "*.jpeg" {
  const value: any;
  export default value;
}

// JSON imports (Lottie animations, etc.)
declare module "*.json" {
  const value: any;
  export default value;
}

// Allow require for dynamic imports (used in React Native)
declare const require: {
  (path: string): any;
  <T>(path: string): T;
  context: (
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp
  ) => {
    keys: () => string[];
    <T>(id: string): T;
  };
};

