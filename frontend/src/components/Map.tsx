import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { MapProps } from '../types/map';

import { Africa, Asia, Europe, NA, Oceania, SA } from 'images/countries/continents/countries';
import { ContinentInfo } from 'types/map';
import ContinentMap from '../images/countries/continents/ContinentMap';


/**
 * Map component that displays SVG maps and highlights selected items
 * Supports both country maps and periodic table
 */
const Map: React.FC<MapProps> = ({ selected, packName, div, divOption, type }) => {
  const getContinentInfo = (): ContinentInfo | null => {
    switch (divOption) {
      case 'SA':
        return SA;
      case 'Africa':
        return Africa;
      case 'Asia':
        return Asia;
      case 'NA':
        return NA;
      case 'Oceania':
        return Oceania;
      case 'Europe':
        return Europe;
      default:
        return null;
    }
  };

  const renderMap = (): React.ReactElement | null => {
    if (packName === 'countries') {
      const continentInfo = getContinentInfo();

      if (!continentInfo) {
        return null;
      }

      return <ContinentMap continentInfo={continentInfo} selected={selected} type={type} />;
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {renderMap()}
    </View>
  );
};

export default React.memo(Map);

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '90%',
  },
});

