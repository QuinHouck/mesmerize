import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View} from 'react-native';

import AsiaMap from '../images/countries/continents/AsiaMap.js';
import AfricaMap from '../images/countries/continents/AfricaMap.js';
import EuropeMap from '../images/countries/continents/EuropeMap.js';
import NorthMap from '../images/countries/continents/NorthMap.js';
import SouthMap from '../images/countries/continents/SouthMap.js';
import OceaniaMap from '../images/countries/continents/OceaniaMap.js';

import PeriodicTable from '../images/periodic-table/PeriodicTable.js';

const SvgComponent = ({selected, pack, div, divOption, type}) => {

    useEffect(() => {
        // console.log("Pack: ", pack);
        // console.log("Div: ", div);
        // console.log("Option: ", divOption);

    }, [selected]);

    function getMap(){
        switch(pack){
            case "countries":
                let region = "";
                if(!Array.isArray(selected)){
                    region = selected.region;
                } else {
                    region = divOption;
                }
                switch(region){
                    case "Africa":
                        return <AfricaMap selected={selected} type={type}/>
                    case "NA":
                        return <NorthMap selected={selected} type={type}/>
                    case "Asia":
                        return <AsiaMap selected={selected} type={type}/>
                    case "Europe":
                        return <EuropeMap selected={selected} type={type}/>
                    case "Oceania":
                        return <OceaniaMap selected={selected} type={type}/>
                    case "SA":
                        return <SouthMap selected={selected} type={type}/>
                }
                break;
            case "periodic-table":
                return <PeriodicTable selected={selected} type={type}/>
        }
    }


    return (
        <View style={{height: '100%', width: '90%'}}>
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
