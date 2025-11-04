import React, { useEffect, useState } from 'react';
import Svg, { Path, G } from "react-native-svg";

import type { ContinentInfo, MapType } from '../../../types/map';
import { PackageItem } from 'types/package';

interface ContinentMapProps {
    continentInfo: ContinentInfo;
    selected: PackageItem | PackageItem[] | null | undefined;
    type: MapType;
}

export const mapStyles = {
    country: {
        strokeWidth: '0.5px',
        strokeLinecap: 'round' as const,
        stroke: '#222222',
        fill: 'white',
    },
    selected: {
        strokeWidth: '0.5px',
        strokeLinecap: 'round' as const,
        stroke: '#222222',
        fill: '#F9D949',
    },
} as const;

const ContinentMap = ({ continentInfo, selected, type }: ContinentMapProps) => {
    const [matrix, setMatrix] = useState([1, 0, 0, 1, 0, 0]);

    // Extract all SVG properties from the imported SA data
    const { id, width, height, mappedAttributeId, countries } = continentInfo;

    useEffect(() => {
        // Only apply transform if selected is a single item (not an array) and type is Quiz
        if (type !== "Quiz" || Array.isArray(selected) || !selected || !selected[mappedAttributeId]) {
            setMatrix([1, 0, 0, 1, 0, 0]);
            return;
        }

        const countryCode = selected[mappedAttributeId] as string;
        if (!countries[countryCode]) {
            setMatrix([1, 0, 0, 1, 0, 0]);
            return;
        }

        const transformMatrix = [1, 0, 0, 1, ((width / 2) - countries[countryCode].centerX), ((height / 2) - countries[countryCode].centerY)];
        let centerX = countries[countryCode].centerX;
        let centerY = countries[countryCode].centerY;
        let scale = Math.min((height * 0.75) / countries[countryCode].height, (width * 0.75) / countries[countryCode].width, 5);

        for (var i = 0; i < 4; i++) {
            transformMatrix[i] *= scale;
        }
        transformMatrix[4] += (1 - scale) * centerX;
        transformMatrix[5] += (1 - scale) * centerY;

        setMatrix(transformMatrix);
    }, [selected, type, width, height, mappedAttributeId, countries]);

    function isSelected(itemId: string, selected: PackageItem | PackageItem[] | null | undefined): boolean {
        if (!selected) return false;
        if (!Array.isArray(selected)) {
            return selected[mappedAttributeId] === itemId;
        } else {
            return selected.some((item) => item[mappedAttributeId] === itemId);
        }
    }

    function getStyle(abbr: string) {
        const isHighlighted = isSelected(abbr, selected);
        return isHighlighted ? mapStyles.selected : mapStyles.country;
    }

    return (
        <Svg
            id={id}
            viewBox={`0 0 ${width} ${height}`}
            style={(type === "Quiz") ? { backgroundColor: '#91E8F8' } : { width: '100%', aspectRatio: 1 }}
        >
            <G transform={`matrix(${matrix.join(' ')})`}>
                {Object.entries(countries).map(([countryCode, countryData]) => {
                    const pathStyle = getStyle(countryCode);
                    return (
                        <Path
                            key={countryCode}
                            id={countryCode}
                            d={countryData.path}
                            {...pathStyle}
                        />
                    );
                })}
            </G>
        </Svg>
    )
}

export default ContinentMap;
