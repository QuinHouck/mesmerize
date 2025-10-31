// Package/content types

export interface PackageAttribute {
  name: string;
  title: string;
  type: 'string' | 'number' | 'image' | 'map';
  question: boolean;
  answer: boolean;
}

export interface PackageDivisionOption {
  name: string;
  title: string;
  division_id?: string;
}

export interface PackageDivision {
  name: string;
  title: string;
  options: PackageDivisionOption[];
}

export interface PackageInfo {
  _id: string;
  name: string;
  title: string;
  description?: string | null;
  attributes: PackageAttribute[];
  divisions?: PackageDivision[];
  items: PackageItem[];
  test_time: number;
  version: string;
  has_maps: boolean;
  sort_attr: string | null; // Maps to attributes.name. The attribute to be used for the sort filter if the user wants
  ranged: string | null; // Maps to attributes.name. The attribute to be used for the range filter if the user wants
  test_division: string | null; // Maps to divisions.name. The division to be used for the test if the user wants
}

export interface PackageItem {
  _id: string;
  name: string;
  [key: string]: any; // Dynamic attributes
}

// How packs are stored in AsyncStorage in the packs array
export interface PackageListItem {
  title: string;
  name: string;
  version: string;
}

// Image data structure returned by getImages and used to verify/display images for items
export interface ImageData {
  image: any; // React Native ImageSourcePropType (imported asset)
  uri: string; // The resolved URI of the image
  ar: number; // Aspect ratio (width / height) used for proper image display
}

// Images map keyed by item name, used to verify and display images for quiz/test items
export type Images = Record<string, ImageData> | null;