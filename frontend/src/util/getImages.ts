import { Image } from 'react-native';
import type { PackageItem } from '../types/package';

// Type definitions
interface ImageConfig {
    loader: () => Record<string, any>;
    fileNameExtractor: (item: PackageItem) => string;
    height: string;
}

interface ImageData {
    image: any;
    uri: string;
    ar: number;
}

interface GetImagesResult {
    imgs: Record<string, ImageData>;
    height: string;
}

/**
 * Helper function to import all images from a directory using webpack's require.context
 */
function importAll(r: ReturnType<typeof require.context>): Record<string, any> {
    const images: Record<string, any> = {};
    r.keys().forEach((item: string) => {
        images[item.replace('./', '')] = r(item);
    });
    return images;
}

// Define image loaders for each package at module level (must be static for require.context)
const countriesImages = importAll(require.context('../images/countries/flag', false, /\.(png|jpe?g|svg)$/));
const presidentsImages = importAll(require.context('../images/presidents', false, /\.(png|jpe?g|svg)$/));
const nflImages = importAll(require.context('../images/sports/nfl', false, /\.(png|jpe?g|svg)$/));

/**
 * Configuration for each package type that needs images
 * Maps package names to their image loading configuration
 */
const PACKAGE_IMAGE_CONFIG: Record<string, ImageConfig> = {
    countries: {
        loader: () => countriesImages,
        fileNameExtractor: (item: PackageItem) => `${item['iso2'] as string}.png`.toLowerCase(),
        height: '50%'
    },
    presidents: {
        loader: () => presidentsImages,
        fileNameExtractor: (item: PackageItem) => `${item['number'] as number}.jpg`,
        height: '70%'
    },
    nfl: {
        loader: () => nflImages,
        fileNameExtractor: (item: PackageItem) => `${item['name'] as string}.png`,
        height: '60%'
    }
};

/**
 * Helper function to get image size information as a Promise
 */
function getImageSize(uri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        Image.getSize(
            uri,
            (width, height) => resolve({ width, height }),
            (error) => reject(error)
        );
    });
}

/**
 * Main function to dynamically load images based on package configuration
 * 
 * @param chosen - Array of items to load images for
 * @param pack - Package name (must exist in PACKAGE_IMAGE_CONFIG)
 * @returns Promise with image data and recommended height
 */
export async function getImages(chosen: PackageItem[], pack: string): Promise<GetImagesResult> {
    try {
        // Check if package has image configuration
        const config = PACKAGE_IMAGE_CONFIG[pack];
        
        if (!config) {
            console.warn(`No image configuration found for pack: ${pack}`);
            return { imgs: {}, height: '50%' };
        }

        // Load images using the configured loader function
        const images = config.loader();

        const obj: Record<string, ImageData> = {};

        for (const item of chosen) {
            try {
                // Extract filename using the configured extractor function
                const key = config.fileNameExtractor(item);

                // Check if image exists
                if (!images[key]) {
                    console.warn(`Image not found for item: ${item.name} (${key})`);
                    continue;
                }

                // Resolve asset source to get URI
                const assetSource = Image.resolveAssetSource(images[key]);
                if (!assetSource || !assetSource.uri) {
                    console.warn(`Could not resolve asset source for: ${item.name}`);
                    continue;
                }

                const uri = assetSource.uri;

                // Get image dimensions
                const { width, height } = await getImageSize(uri);
                const aspectRatio = width / height;

                // Store image data keyed by item name
                obj[item.name] = {
                    image: images[key],
                    uri,
                    ar: aspectRatio
                };
            } catch (error) {
                console.error(`Error loading image for ${item.name}:`, error);
                // Continue to next image instead of crashing
            }
        }

        return {
            imgs: obj,
            height: config.height
        };
    } catch (error) {
        console.error('Error loading images:', error);
        return { imgs: {}, height: '50%' };
    }
}

