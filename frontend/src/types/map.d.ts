/**
 * Types for map components and map-related functionality
 */

import { PackageItem } from "./package";


export type MapType = 'Quiz' | 'Test';

export interface MapProps {
  packName: string;
  div?: string | null;
  divOption?: string | null;
  type: MapType;
  selected: PackageItem | PackageItem[] | null | undefined;
}

export type ContinentInfo = {
    id: string;
    width: number;
    height: number;
    mappedAttributeId: string;
    countries: {
        [key: string]: {
            centerX: number;
            centerY: number;
            width: number;
            height: number;
            path: string;
        }
    }
}


