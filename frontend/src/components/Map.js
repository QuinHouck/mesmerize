import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View} from 'react-native';

import AsiaMap from '../images/countries/continents/AsiaMap.js';
import AfricaMap from '../images/countries/continents/AfricaMap.js';
import EuropeMap from '../images/countries/continents/EuropeMap.js';
import NorthMap from '../images/countries/continents/NorthMap.js';
import SouthMap from '../images/countries/continents/SouthMap.js';
import OceaniaMap from '../images/countries/continents/OceaniaMap.js';

const SvgComponent = ({selected, pack, divName, divOption}) => {

    useEffect(() => {

    }, [selected]);

    function getMap(){
        switch(pack){
            case "countries":
                switch(divOption){
                    case "Africa":
                        return <AfricaMap selected={selected}/>
                    case "NA":
                        return <NorthMap selected={selected}/>
                    case "Asia":
                        return <AsiaMap selected={selected}/>
                    case "Europe":
                        return <EuropeMap selected={selected}/>
                    case "Oceania":
                        return <OceaniaMap selected={selected}/>
                    case "SA":
                        return <SouthMap selected={selected}/>
                }
        }
    }


    return (
        <View style={{height: '100%', width: "90%"}}>
            {getMap()}
        </View>
    )
}

export default SvgComponent;

const styles = StyleSheet.create({
    country: {
        strokeWidth: '0.5px',
        strokeLinecap: "round",
        stroke: "#222222", 
        fill: 'white'
    },

    selected: {
        strokeWidth: '0.5px',
        strokeLinecap: "round",
        stroke: "#222222", 
        fill: '#F9D949'
    },
});
