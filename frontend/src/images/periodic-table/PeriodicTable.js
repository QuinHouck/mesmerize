import React, { useState, useEffect, useRef } from 'react';
import Svg, { G, Path, Text, TSpan } from "react-native-svg"
import { StyleSheet } from 'react-native';

function SvgComponent({selected, type}) {

    useEffect(( )=> {
        console.log(type);
    }, [])
  return (
    <Svg
    //   width={1205}
    //   height={638}
      viewBox="3 3 673 358"
      xmlns="http://www.w3.org/2000/svg"
    >
      <G xmlns="http://www.w3.org/2000/svg" stroke="#000" id="g260">
        <G id="NG">
          <Path id={36} d="M645 145H675V175H645z" style={(selected && selected.atomic_number === 36) ? styles.selected : styles.regular}/>
          <Path id={54} d="M645 180H675V210H645z" style={(selected && selected.atomic_number === 54) ? styles.selected : styles.regular}/>
          <Path id={86} d="M645 215H675V245H645z" style={(selected && selected.atomic_number === 86) ? styles.selected : styles.regular}/>
          <Path id={10} d="M645 75H675V105H645z" style={(selected && selected.atomic_number === 10) ? styles.selected : styles.regular}/>
          <Path id={18} d="M645 110H675V140H645z" style={(selected && selected.atomic_number === 18) ? styles.selected : styles.regular}/>
          <Path id={2} d="M645 40H675V70H645z" style={(selected && selected.atomic_number === 2) ? styles.selected : styles.regular}/>
          <Path id={118} d="M645 250H675V280H645z" style={(selected && selected.atomic_number === 118) ? styles.selected : styles.regular}/>
        </G>
        <G id="MOID">
          <Path id={32} d="M505 145H535V175H505z" style={(selected && selected.atomic_number === 32) ? styles.selected : styles.regular}/>
          <Path id={33} d="M540 145H570V175H540z" style={(selected && selected.atomic_number === 33) ? styles.selected : styles.regular}/>
          <Path id={51} d="M540 180H570V210H540z" style={(selected && selected.atomic_number === 51) ? styles.selected : styles.regular}/>
          <Path id={52} d="M575 180H605V210H575z" style={(selected && selected.atomic_number === 52) ? styles.selected : styles.regular}/>
          <Path id={5} d="M470 75H500V105H470z" style={(selected && selected.atomic_number === 5) ? styles.selected : styles.regular}/>
          <Path id={14} d="M505 110H535V140H505z" style={(selected && selected.atomic_number === 14) ? styles.selected : styles.regular}/>
        </G>
        <G id="PTM">
          <Path id={31} d="M470 145H500V175H470z" style={(selected && selected.atomic_number === 31) ? styles.selected : styles.regular}/>
          <Path id={49} d="M470 180H500V210H470z" style={(selected && selected.atomic_number === 49) ? styles.selected : styles.regular}/>
          <Path id={81} d="M470 215H500V245H470z" style={(selected && selected.atomic_number === 81) ? styles.selected : styles.regular}/>
          <Path id={50} d="M505 180H535V210H505z" style={(selected && selected.atomic_number === 50) ? styles.selected : styles.regular}/>
          <Path id={82} d="M505 215H535V245H505z" style={(selected && selected.atomic_number === 82) ? styles.selected : styles.regular}/>
          <Path id={83} d="M540 215H570V245H540z" style={(selected && selected.atomic_number === 83) ? styles.selected : styles.regular}/>
          <Path id={84} d="M575 215H605V245H575z" style={(selected && selected.atomic_number === 84) ? styles.selected : styles.regular}/>
          <Path id={13} d="M470 110H500V140H470z" style={(selected && selected.atomic_number === 13) ? styles.selected : styles.regular}/>
          <Path id={113} d="M470 250H500V280H470z" style={(selected && selected.atomic_number === 113) ? styles.selected : styles.regular}/>
          <Path id={114} d="M505 250H535V280H505z" style={(selected && selected.atomic_number === 114) ? styles.selected : styles.regular}/>
          <Path id={115} d="M540 250H570V280H540z" style={(selected && selected.atomic_number === 115) ? styles.selected : styles.regular}/>
          <Path id={116} d="M575 250H605V280H575z" style={(selected && selected.atomic_number === 116) ? styles.selected : styles.regular}/>
        </G>
        <G id="HAL">
          <Path id={9} d="M610 75H640V105H610z" style={(selected && selected.atomic_number === 9) ? styles.selected : styles.regular}/>
          <Path id={17} d="M610 110H640V140H610z" style={(selected && selected.atomic_number === 17) ? styles.selected : styles.regular}/>
          <Path id={35} d="M610 145H640V175H610z" style={(selected && selected.atomic_number === 35) ? styles.selected : styles.regular}/>
          <Path id={53} d="M610 180H640V210H610z" style={(selected && selected.atomic_number === 53) ? styles.selected : styles.regular}/>
          <Path id={85} d="M610 215H640V245H610z" style={(selected && selected.atomic_number === 85) ? styles.selected : styles.regular}/>
          <Path id={117} d="M610 250H640V280H610z" style={(selected && selected.atomic_number === 117) ? styles.selected : styles.regular}/>
        </G>
        <G id="AN">
          <Path id={89} d="M120 330H150V360H120z" style={(selected && selected.atomic_number === 89) ? styles.selected : styles.regular}/>
          <Path id={90} d="M155 330H185V360H155z" style={(selected && selected.atomic_number === 90) ? styles.selected : styles.regular}/>
          <Path id={91} d="M190 330H220V360H190z" style={(selected && selected.atomic_number === 91) ? styles.selected : styles.regular}/>
          <Path id={92} d="M225 330H255V360H225z" style={(selected && selected.atomic_number === 92) ? styles.selected : styles.regular}/>
          <Path id={93} d="M260 330H290V360H260z" style={(selected && selected.atomic_number === 93) ? styles.selected : styles.regular}/>
          <Path id={94} d="M295 330H325V360H295z" style={(selected && selected.atomic_number === 94) ? styles.selected : styles.regular}/>
          <Path id={95} d="M330 330H360V360H330z" style={(selected && selected.atomic_number === 95) ? styles.selected : styles.regular}/>
          <Path id={96} d="M365 330H395V360H365z" style={(selected && selected.atomic_number === 96) ? styles.selected : styles.regular}/>
          <Path id={97} d="M400 330H430V360H400z" style={(selected && selected.atomic_number === 97) ? styles.selected : styles.regular}/>
          <Path id={98} d="M435 330H465V360H435z" style={(selected && selected.atomic_number === 98) ? styles.selected : styles.regular}/>
          <Path id={99} d="M470 330H500V360H470z" style={(selected && selected.atomic_number === 99) ? styles.selected : styles.regular}/>
          <Path id={100} d="M505 330H535V360H505z" style={(selected && selected.atomic_number === 100) ? styles.selected : styles.regular}/>
          <Path id={101} d="M540 330H570V360H540z" style={(selected && selected.atomic_number === 101) ? styles.selected : styles.regular}/>
          <Path id={102} d="M575 330H605V360H575z" style={(selected && selected.atomic_number === 102) ? styles.selected : styles.regular}/>
          <Path id={103} d="M120 250H150V280H120z" style={(selected && selected.atomic_number === 103) ? styles.selected : styles.regular}/>
        </G>
        <G id="LN">
          <Path id={57} d="M120 295H150V325H120z" style={(selected && selected.atomic_number === 57) ? styles.selected : styles.regular}/>
          <Path id={58} d="M155 295H185V325H155z" style={(selected && selected.atomic_number === 58) ? styles.selected : styles.regular}/>
          <Path id={59} d="M190 295H220V325H190z" style={(selected && selected.atomic_number === 59) ? styles.selected : styles.regular}/>
          <Path id={60} d="M225 295H255V325H225z" style={(selected && selected.atomic_number === 60) ? styles.selected : styles.regular}/>
          <Path id={61} d="M260 295H290V325H260z" style={(selected && selected.atomic_number === 61) ? styles.selected : styles.regular}/>
          <Path id={62} d="M295 295H325V325H295z" style={(selected && selected.atomic_number === 62) ? styles.selected : styles.regular}/>
          <Path id={63} d="M330 295H360V325H330z" style={(selected && selected.atomic_number === 63) ? styles.selected : styles.regular}/>
          <Path id={64} d="M365 295H395V325H365z" style={(selected && selected.atomic_number === 64) ? styles.selected : styles.regular}/>
          <Path id={65} d="M400 295H430V325H400z" style={(selected && selected.atomic_number === 65) ? styles.selected : styles.regular}/>
          <Path id={66} d="M435 295H465V325H435z" style={(selected && selected.atomic_number === 66) ? styles.selected : styles.regular}/>
          <Path id={67} d="M470 295H500V325H470z" style={(selected && selected.atomic_number === 67) ? styles.selected : styles.regular}/>
          <Path id={68} d="M505 295H535V325H505z" style={(selected && selected.atomic_number === 68) ? styles.selected : styles.regular}/>
          <Path id={69} d="M540 295H570V325H540z" style={(selected && selected.atomic_number === 69) ? styles.selected : styles.regular}/>
          <Path id={70} d="M575 295H605V325H575z" style={(selected && selected.atomic_number === 70) ? styles.selected : styles.regular}/>
          <Path id={71} d="M120 215H150V245H120z" style={(selected && selected.atomic_number === 71) ? styles.selected : styles.regular}/>
        </G>
        <G id="TM">
          <Path id={30} d="M435 145H465V175H435z" style={(selected && selected.atomic_number === 30) ? styles.selected : styles.regular}/>
          <Path id={48} d="M435 180H465V210H435z" style={(selected && selected.atomic_number === 48) ? styles.selected : styles.regular}/>
          <Path id={80} d="M435 215H465V245H435z" style={(selected && selected.atomic_number === 80) ? styles.selected : styles.regular}/>
          <Path id={112} d="M435 250H465V280H435z" style={(selected && selected.atomic_number === 112) ? styles.selected : styles.regular}/>
          <Path id={109} d="M330 250H360V280H330z" style={(selected && selected.atomic_number === 109) ? styles.selected : styles.regular}/>
          <Path id={110} d="M365 250H395V280H365z" style={(selected && selected.atomic_number === 110) ? styles.selected : styles.regular}/>
          <Path id={111} d="M400 250H430V280H400z" style={(selected && selected.atomic_number === 111) ? styles.selected : styles.regular}/>
          <Path id={21} d="M120 145H150V175H120z" style={(selected && selected.atomic_number === 21) ? styles.selected : styles.regular}/>
          <Path id={39} d="M120 180H150V210H120z" style={(selected && selected.atomic_number === 39) ? styles.selected : styles.regular}/>
          <Path id={22} d="M155 145H185V175H155z" style={(selected && selected.atomic_number === 22) ? styles.selected : styles.regular}/>
          <Path id={40} d="M155 180H185V210H155z" style={(selected && selected.atomic_number === 40) ? styles.selected : styles.regular}/>
          <Path id={72} d="M155 215H185V245H155z" style={(selected && selected.atomic_number === 72) ? styles.selected : styles.regular}/>
          <Path id={104} d="M155 250H185V280H155z" style={(selected && selected.atomic_number === 104) ? styles.selected : styles.regular}/>
          <Path id={23} d="M190 145H220V175H190z" style={(selected && selected.atomic_number === 23) ? styles.selected : styles.regular}/>
          <Path id={41} d="M190 180H220V210H190z" style={(selected && selected.atomic_number === 41) ? styles.selected : styles.regular}/>
          <Path id={73} d="M190 215H220V245H190z" style={(selected && selected.atomic_number === 73) ? styles.selected : styles.regular}/>
          <Path id={105} d="M190 250H220V280H190z" style={(selected && selected.atomic_number === 105) ? styles.selected : styles.regular}/>
          <Path id={24} d="M225 145H255V175H225z" style={(selected && selected.atomic_number === 24) ? styles.selected : styles.regular}/>
          <Path id={42} d="M225 180H255V210H225z" style={(selected && selected.atomic_number === 42) ? styles.selected : styles.regular}/>
          <Path id={74} d="M225 215H255V245H225z" style={(selected && selected.atomic_number === 74) ? styles.selected : styles.regular}/>
          <Path id={106} d="M225 250H255V280H225z" style={(selected && selected.atomic_number === 106) ? styles.selected : styles.regular}/>
          <Path id={25} d="M260 145H290V175H260z" style={(selected && selected.atomic_number === 25) ? styles.selected : styles.regular}/>
          <Path id={43} d="M260 180H290V210H260z" style={(selected && selected.atomic_number === 43) ? styles.selected : styles.regular}/>
          <Path id={75} d="M260 215H290V245H260z" style={(selected && selected.atomic_number === 75) ? styles.selected : styles.regular}/>
          <Path id={107} d="M260 250H290V280H260z" style={(selected && selected.atomic_number === 107) ? styles.selected : styles.regular}/>
          <Path id={26} d="M295 145H325V175H295z" style={(selected && selected.atomic_number === 26) ? styles.selected : styles.regular}/>
          <Path id={44} d="M295 180H325V210H295z" style={(selected && selected.atomic_number === 44) ? styles.selected : styles.regular}/>
          <Path id={76} d="M295 215H325V245H295z" style={(selected && selected.atomic_number === 76) ? styles.selected : styles.regular}/>
          <Path id={108} d="M295 250H325V280H295z" style={(selected && selected.atomic_number === 108) ? styles.selected : styles.regular}/>
          <Path id={27} d="M330 145H360V175H330z" style={(selected && selected.atomic_number === 27) ? styles.selected : styles.regular}/>
          <Path id={45} d="M330 180H360V210H330z" style={(selected && selected.atomic_number === 45) ? styles.selected : styles.regular}/>
          <Path id={77} d="M330 215H360V245H330z" style={(selected && selected.atomic_number === 77) ? styles.selected : styles.regular}/>
          <Path id={28} d="M365 145H395V175H365z" style={(selected && selected.atomic_number === 28) ? styles.selected : styles.regular}/>
          <Path id={46} d="M365 180H395V210H365z" style={(selected && selected.atomic_number === 46) ? styles.selected : styles.regular}/>
          <Path id={78} d="M365 215H395V245H365z" style={(selected && selected.atomic_number === 78) ? styles.selected : styles.regular}/>
          <Path id={29} d="M400 145H430V175H400z" style={(selected && selected.atomic_number === 29) ? styles.selected : styles.regular}/>
          <Path id={47} d="M400 180H430V210H400z" style={(selected && selected.atomic_number === 47) ? styles.selected : styles.regular}/>
          <Path id={79} d="M400 215H430V245H400z" style={(selected && selected.atomic_number === 79) ? styles.selected : styles.regular}/>
        </G>
        <G id="AM">
          <Path id={3} d="M40 75H70V105H40z" style={(selected && selected.atomic_number === 3) ? styles.selected : styles.regular}/>
          <Path id={11} d="M40 110H70V140H40z" style={(selected && selected.atomic_number === 11) ? styles.selected : styles.regular}/>
          <Path id={19} d="M40 145H70V175H40z" style={(selected && selected.atomic_number === 19) ? styles.selected : styles.regular}/>
          <Path id={37} d="M40 180H70V210H40z" style={(selected && selected.atomic_number === 37) ? styles.selected : styles.regular}/>
          <Path id={55} d="M40 215H70V245H40z" style={(selected && selected.atomic_number === 55) ? styles.selected : styles.regular}/>
          <Path id={87} d="M40 250H70V280H40z" style={(selected && selected.atomic_number === 87) ? styles.selected : styles.regular}/>
        </G>
        <G id="AEM">
          <Path id={4} d="M75 75H105V105H75z" style={(selected && selected.atomic_number === 4) ? styles.selected : styles.regular}/>
          <Path id={12} d="M75 110H105V140H75z" style={(selected && selected.atomic_number === 12) ? styles.selected : styles.regular}/>
          <Path id={20} d="M75 145H105V175H75z" style={(selected && selected.atomic_number === 20) ? styles.selected : styles.regular}/>
          <Path id={38} d="M75 180H105V210H75z" style={(selected && selected.atomic_number === 38) ? styles.selected : styles.regular}/>
          <Path id={56} d="M75 215H105V245H75z" style={(selected && selected.atomic_number === 56) ? styles.selected : styles.regular}/>
          <Path id={88} d="M75 250H105V280H75z" style={(selected && selected.atomic_number === 88) ? styles.selected : styles.regular}/>
        </G>
        <G id="NM">
          <Path id={1} d="M40 40H70V70H40z" style={(selected && selected.atomic_number === 1) ? styles.selected : styles.regular}/>
          <Path id={7} d="M540 75H570V105H540z" style={(selected && selected.atomic_number === 7) ? styles.selected : styles.regular}/>
          <Path id={8} d="M575 75H605V105H575z" style={(selected && selected.atomic_number === 8) ? styles.selected : styles.regular}/>
          <Path id={34} d="M575 145H605V175H575z" style={(selected && selected.atomic_number === 34) ? styles.selected : styles.regular}/>
          <Path id={6} d="M505 75H535V105H505z" style={(selected && selected.atomic_number === 6) ? styles.selected : styles.regular}/>
          <Path id={15} d="M540 110H570V140H540z" style={(selected && selected.atomic_number === 15) ? styles.selected : styles.regular}/>
          <Path id={16} d="M575 110H605V140H575z" style={(selected && selected.atomic_number === 16) ? styles.selected : styles.regular}/>
        </G>
      </G>
      <G fontSize={14} fontFamily="Noto Sans" textAnchor="middle" fill='white'>
        <Text y={58} transform="translate(20)">
          {"1"}
        </Text>
        <Text y={93} transform="translate(20)">
          {"2"}
        </Text>
        <Text y={128} transform="translate(20)">
          {"3"}
        </Text>
        <Text y={163} transform="translate(20)">
          {"4"}
        </Text>
        <Text y={198} transform="translate(20)">
          {"5"}
        </Text>
        <Text y={233} transform="translate(20)">
          {"6"}
        </Text>
        <Text y={268} transform="translate(20)">
          {"7"}
        </Text>
        <G>
          <Text transform="translate(0 22) translate(55)">{"1"}</Text>
          {type === "Test" && <G>
            <Text y={32} transform="translate(0 22) translate(55)">
                {"1"}
                <TSpan x={0} dy={11.5}>
                {"H"}
                </TSpan>
            </Text>
            <Text y={67} transform="translate(0 22) translate(55)">
                {"3"}
                <TSpan x={0} dy={11.5}>
                {"Li"}
                </TSpan>
            </Text>
            <Text y={102} transform="translate(0 22) translate(55)">
                {"11"}
                <TSpan x={0} dy={11.5}>
                {"Na"}
                </TSpan>
            </Text>
            <Text y={137} transform="translate(0 22) translate(55)">
                {"19"}
                <TSpan x={0} dy={11.5}>
                {"K"}
                </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(55)">
                {"37"}
                <TSpan x={0} dy={11.5}>
                {"Rb"}
                </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(55)">
                {"55"}
                <TSpan x={0} dy={11.5}>
                {"Cs"}
                </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(55)">
                {"87"}
                <TSpan x={0} dy={11.5}>
                {"Fr"}
                </TSpan>
            </Text>
          </G>}
          <Text transform="translate(0 22) translate(90)">{"2"}</Text>
          {type === "Test" && <G>
            <Text y={67} transform="translate(0 22) translate(90)">
                {"4"}
                <TSpan x={0} dy={11.5}>
                {"Be"}
                </TSpan>
            </Text>
            <Text y={102} transform="translate(0 22) translate(90)">
                {"12"}
                <TSpan x={0} dy={11.5}>
                {"Mg"}
                </TSpan>
            </Text>
            <Text y={137} transform="translate(0 22) translate(90)">
                {"20"}
                <TSpan x={0} dy={11.5}>
                {"Ca"}
                </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(90)">
                {"38"}
                <TSpan x={0} dy={11.5}>
                {"Sr"}
                </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(90)">
                {"56"}
                <TSpan x={0} dy={11.5}>
                {"Ba"}
                </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(90)">
                {"88"}
                <TSpan x={0} dy={11.5}>
                {"Ra"}
                </TSpan>
            </Text>
            <Text y={208} transform="translate(0 22) translate(112)">
                {"*"}
            </Text>
            <Text y={243} transform="translate(0 22) translate(112)">
                {"*"}
                <TSpan x={0} dy={12}>
                {"*"}
                </TSpan>
            </Text>
            <Text y={288} transform="translate(0 22) translate(112)">
                {"*"}
            </Text>
            <Text y={323} transform="translate(0 22) translate(112)">
                {"*"}
                <TSpan x={0} dy={12}>
                {"*"}
                </TSpan>
            </Text>
        </G>}
        <Text transform="translate(0 22) translate(135)">{"3"}</Text>
        {type === "Test" && <G>
            <Text y={137} transform="translate(0 22) translate(135)">
              {"21"}
              <TSpan x={0} dy={11.5}>
                {"Sc"}
              </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(135)">
              {"39"}
              <TSpan x={0} dy={11.5}>
                {"Y"}
              </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(135)">
              {"71"}
              <TSpan x={0} dy={11.5}>
                {"Lu"}
              </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(135)">
              {"103"}
              <TSpan x={0} dy={11.5}>
                {"Lr"}
              </TSpan>
            </Text>
            <Text y={287} transform="translate(0 22) translate(135)">
              {"57"}
              <TSpan x={0} dy={11.5}>
                {"La"}
              </TSpan>
            </Text>
            <Text y={322} transform="translate(0 22) translate(135)">
              {"89"}
              <TSpan x={0} dy={11.5}>
                {"Ac"}
              </TSpan>
            </Text>
        </G>}
        <Text transform="translate(0 22) translate(170)">{"4"}</Text>
        {type === "Test" && <G>
            <Text y={137} transform="translate(0 22) translate(170)">
              {"22"}
              <TSpan x={0} dy={11.5}>
                {"Ti"}
              </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(170)">
              {"40"}
              <TSpan x={0} dy={11.5}>
                {"Zr"}
              </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(170)">
              {"72"}
              <TSpan x={0} dy={11.5}>
                {"Hf"}
              </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(170)">
              {"104"}
              <TSpan x={0} dy={11.5}>
                {"Rf"}
              </TSpan>
            </Text>
            <Text y={287} transform="translate(0 22) translate(170)">
              {"58"}
              <TSpan x={0} dy={11.5}>
                {"Ce"}
              </TSpan>
            </Text>
            <Text y={322} transform="translate(0 22) translate(170)">
              {"90"}
              <TSpan x={0} dy={11.5}>
                {"Th"}
              </TSpan>
            </Text>
        </G>}
        <Text transform="translate(0 22) translate(205)">{"5"}</Text>
        {type === "Test" && <G>
            <Text y={137} transform="translate(0 22) translate(205)">
              {"23"}
              <TSpan x={0} dy={11.5}>
                {"V"}
              </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(205)">
              {"41"}
              <TSpan x={0} dy={11.5}>
                {"Nb"}
              </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(205)">
              {"73"}
              <TSpan x={0} dy={11.5}>
                {"Ta"}
              </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(205)">
              {"105"}
              <TSpan x={0} dy={11.5}>
                {"Db"}
              </TSpan>
            </Text>
            <Text y={287} transform="translate(0 22) translate(205)">
              {"59"}
              <TSpan x={0} dy={11.5}>
                {"Pr"}
              </TSpan>
            </Text>
            <Text y={322} transform="translate(0 22) translate(205)">
              {"91"}
              <TSpan x={0} dy={11.5}>
                {"Pa"}
              </TSpan>
            </Text>
        </G>}
        <Text transform="translate(0 22) translate(240)">{"6"}</Text>
        {type === "Test" && <G>
            <Text y={137} transform="translate(0 22) translate(240)">
              {"24"}
              <TSpan x={0} dy={11.5}>
                {"Cr"}
              </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(240)">
              {"42"}
              <TSpan x={0} dy={11.5}>
                {"Mo"}
              </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(240)">
              {"74"}
              <TSpan x={0} dy={11.5}>
                {"W"}
              </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(240)">
              {"106"}
              <TSpan x={0} dy={11.5}>
                {"Sg"}
              </TSpan>
            </Text>
            <Text y={287} transform="translate(0 22) translate(240)">
              {"60"}
              <TSpan x={0} dy={11.5}>
                {"Nd"}
              </TSpan>
            </Text>
            <Text y={322} transform="translate(0 22) translate(240)">
              {"92"}
              <TSpan x={0} dy={11.5}>
                {"U"}
              </TSpan>
            </Text>
        </G>}
        <Text transform="translate(0 22) translate(275)">{"7"}</Text>
        {type === "Test" && <G>
            <Text y={137} transform="translate(0 22) translate(275)">
              {"25"}
              <TSpan x={0} dy={11.5}>
                {"Mn"}
              </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(275)">
              {"43"}
              <TSpan x={0} dy={11.5}>
                {"Tc"}
              </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(275)">
              {"75"}
              <TSpan x={0} dy={11.5}>
                {"Re"}
              </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(275)">
              {"107"}
              <TSpan x={0} dy={11.5}>
                {"Bh"}
              </TSpan>
            </Text>
            <Text y={287} transform="translate(0 22) translate(275)">
              {"61"}
              <TSpan x={0} dy={11.5}>
                {"Pm"}
              </TSpan>
            </Text>
            <Text y={322} transform="translate(0 22) translate(275)">
              {"93"}
              <TSpan x={0} dy={11.5}>
                {"Np"}
              </TSpan>
            </Text>
        </G>}
        <Text transform="translate(0 22) translate(310)">{"8"}</Text>
        {type === "Test" && <G>
            <Text y={137} transform="translate(0 22) translate(310)">
              {"26"}
              <TSpan x={0} dy={11.5}>
                {"Fe"}
              </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(310)">
              {"44"}
              <TSpan x={0} dy={11.5}>
                {"Ru"}
              </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(310)">
              {"76"}
              <TSpan x={0} dy={11.5}>
                {"Os"}
              </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(310)">
              {"108"}
              <TSpan x={0} dy={11.5}>
                {"Hs"}
              </TSpan>
            </Text>
            <Text y={287} transform="translate(0 22) translate(310)">
              {"62"}
              <TSpan x={0} dy={11.5}>
                {"Sm"}
              </TSpan>
            </Text>
            <Text y={322} transform="translate(0 22) translate(310)">
              {"94"}
              <TSpan x={0} dy={11.5}>
                {"Pu"}
              </TSpan>
            </Text>
        </G>}
        <Text transform="translate(0 22) translate(345)">{"9"}</Text>
        {type === "Test" && <G>
            <Text y={137} transform="translate(0 22) translate(345)">
              {"27"}
              <TSpan x={0} dy={11.5}>
                {"Co"}
              </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(345)">
              {"45"}
              <TSpan x={0} dy={11.5}>
                {"Rh"}
              </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(345)">
              {"77"}
              <TSpan x={0} dy={11.5}>
                {"Ir"}
              </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(345)">
              {"109"}
              <TSpan x={0} dy={11.5}>
                {"Mt"}
              </TSpan>
            </Text>
            <Text y={287} transform="translate(0 22) translate(345)">
              {"63"}
              <TSpan x={0} dy={11.5}>
                {"Eu"}
              </TSpan>
            </Text>
            <Text y={322} transform="translate(0 22) translate(345)">
              {"95"}
              <TSpan x={0} dy={11.5}>
                {"Am"}
              </TSpan>
            </Text>
        </G>}
        <Text transform="translate(0 22) translate(380)">{"10"}</Text>
        {type === "Test" && <G>
            <Text y={137} transform="translate(0 22) translate(380)">
              {"28"}
              <TSpan x={0} dy={11.5}>
                {"Ni"}
              </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(380)">
              {"46"}
              <TSpan x={0} dy={11.5}>
                {"Pd"}
              </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(380)">
              {"78"}
              <TSpan x={0} dy={11.5}>
                {"Pt"}
              </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(380)">
              {"110"}
              <TSpan x={0} dy={11.5}>
                {"Ds"}
              </TSpan>
            </Text>
            <Text y={287} transform="translate(0 22) translate(380)">
              {"64"}
              <TSpan x={0} dy={11.5}>
                {"Gd"}
              </TSpan>
            </Text>
            <Text y={322} transform="translate(0 22) translate(380)">
              {"96"}
              <TSpan x={0} dy={11.5}>
                {"Cm"}
              </TSpan>
            </Text>
        </G>}
        <Text transform="translate(0 22) translate(415)">{"11"}</Text>
        {type === "Test" && <G>
            <Text y={137} transform="translate(0 22) translate(415)">
              {"29"}
              <TSpan x={0} dy={11.5}>
                {"Cu"}
              </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(415)">
              {"47"}
              <TSpan x={0} dy={11.5}>
                {"Ag"}
              </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(415)">
              {"79"}
              <TSpan x={0} dy={11.5}>
                {"Au"}
              </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(415)">
              {"111"}
              <TSpan x={0} dy={11.5}>
                {"Rg"}
              </TSpan>
            </Text>
            <Text y={287} transform="translate(0 22) translate(415)">
              {"65"}
              <TSpan x={0} dy={11.5}>
                {"Tb"}
              </TSpan>
            </Text>
            <Text y={322} transform="translate(0 22) translate(415)">
              {"97"}
              <TSpan x={0} dy={11.5}>
                {"Bk"}
              </TSpan>
            </Text>
        </G>}
        <Text transform="translate(0 22) translate(450)">{"12"}</Text>
        {type === "Test" && <G>
            <Text y={137} transform="translate(0 22) translate(450)">
              {"30"}
              <TSpan x={0} dy={11.5}>
                {"Zn"}
              </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(450)">
              {"48"}
              <TSpan x={0} dy={11.5}>
                {"Cd"}
              </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(450)">
              {"80"}
              <TSpan x={0} dy={11.5}>
                {"Hg"}
              </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(450)">
              {"112"}
              <TSpan x={0} dy={11.5}>
                {"Cn"}
              </TSpan>
            </Text>
            <Text y={287} transform="translate(0 22) translate(450)">
              {"66"}
              <TSpan x={0} dy={11.5}>
                {"Dy"}
              </TSpan>
            </Text>
            <Text y={322} transform="translate(0 22) translate(450)">
              {"98"}
              <TSpan x={0} dy={11.5}>
                {"Cf"}
              </TSpan>
            </Text>
        </G>}
        <Text transform="translate(0 22) translate(485)">{"13"}</Text>
        {type === "Test" && <G>
            <Text y={67} transform="translate(0 22) translate(485)">
              {"5"}
              <TSpan x={0} dy={11.5}>
                {"B"}
              </TSpan>
            </Text>
            <Text y={102} transform="translate(0 22) translate(485)">
              {"13"}
              <TSpan x={0} dy={11.5}>
                {"Al"}
              </TSpan>
            </Text>
            <Text y={137} transform="translate(0 22) translate(485)">
              {"31"}
              <TSpan x={0} dy={11.5}>
                {"Ga"}
              </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(485)">
              {"49"}
              <TSpan x={0} dy={11.5}>
                {"In"}
              </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(485)">
              {"81"}
              <TSpan x={0} dy={11.5}>
                {"Tl"}
              </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(485)">
              {"113"}
              <TSpan x={0} dy={11.5}>
                {"Nh"}
              </TSpan>
            </Text>
            <Text y={287} transform="translate(0 22) translate(485)">
              {"67"}
              <TSpan x={0} dy={11.5}>
                {"Ho"}
              </TSpan>
            </Text>
            <Text y={322} transform="translate(0 22) translate(485)">
              {"99"}
              <TSpan x={0} dy={11.5}>
                {"Es"}
              </TSpan>
            </Text>
        </G>}
        <Text transform="translate(0 22) translate(520)">{"14"}</Text>
        {type === "Test" && <G>
            <Text y={67} transform="translate(0 22) translate(520)">
              {"6"}
              <TSpan x={0} dy={11.5}>
                {"C"}
              </TSpan>
            </Text>
            <Text y={102} transform="translate(0 22) translate(520)">
              {"14"}
              <TSpan x={0} dy={11.5}>
                {"Si"}
              </TSpan>
            </Text>
            <Text y={137} transform="translate(0 22) translate(520)">
              {"32"}
              <TSpan x={0} dy={11.5}>
                {"Ge"}
              </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(520)">
              {"50"}
              <TSpan x={0} dy={11.5}>
                {"Sn"}
              </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(520)">
              {"82"}
              <TSpan x={0} dy={11.5}>
                {"Pb"}
              </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(520)">
              {"114"}
              <TSpan x={0} dy={11.5}>
                {"Fl"}
              </TSpan>
            </Text>
            <Text y={287} transform="translate(0 22) translate(520)">
              {"68"}
              <TSpan x={0} dy={11.5}>
                {"Er"}
              </TSpan>
            </Text>
            <Text y={322} transform="translate(0 22) translate(520)">
              {"100"}
              <TSpan x={0} dy={11.5}>
                {"Fm"}
              </TSpan>
            </Text>
        </G>}
        <Text transform="translate(0 22) translate(555)">{"15"}</Text>
        {type === "Test" && <G>
            <Text y={67} transform="translate(0 22) translate(555)">
              {"7"}
              <TSpan x={0} dy={11.5}>
                {"N"}
              </TSpan>
            </Text>
            <Text y={102} transform="translate(0 22) translate(555)">
              {"15"}
              <TSpan x={0} dy={11.5}>
                {"P"}
              </TSpan>
            </Text>
            <Text y={137} transform="translate(0 22) translate(555)">
              {"33"}
              <TSpan x={0} dy={11.5}>
                {"As"}
              </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(555)">
              {"51"}
              <TSpan x={0} dy={11.5}>
                {"Sb"}
              </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(555)">
              {"83"}
              <TSpan x={0} dy={11.5}>
                {"Bi"}
              </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(555)">
              {"115"}
              <TSpan x={0} dy={11.5}>
                {"Mc"}
              </TSpan>
            </Text>
            <Text y={287} transform="translate(0 22) translate(555)">
              {"69"}
              <TSpan x={0} dy={11.5}>
                {"Tm"}
              </TSpan>
            </Text>
            <Text y={322} transform="translate(0 22) translate(555)">
              {"101"}
              <TSpan x={0} dy={11.5}>
                {"Md"}
              </TSpan>
            </Text>
        </G>}
        <Text transform="translate(0 22) translate(590)">{"16"}</Text>
        {type === "Test" && <G>
            <Text y={67} transform="translate(0 22) translate(590)">
              {"8"}
              <TSpan x={0} dy={11.5}>
                {"O"}
              </TSpan>
            </Text>
            <Text y={102} transform="translate(0 22) translate(590)">
              {"16"}
              <TSpan x={0} dy={11.5}>
                {"S"}
              </TSpan>
            </Text>
            <Text y={137} transform="translate(0 22) translate(590)">
              {"34"}
              <TSpan x={0} dy={11.5}>
                {"Se"}
              </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(590)">
              {"52"}
              <TSpan x={0} dy={11.5}>
                {"Te"}
              </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(590)">
              {"84"}
              <TSpan x={0} dy={11.5}>
                {"Po"}
              </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(590)">
              {"116"}
              <TSpan x={0} dy={11.5}>
                {"Lv"}
              </TSpan>
            </Text>
            <Text y={287} transform="translate(0 22) translate(590)">
              {"70"}
              <TSpan x={0} dy={11.5}>
                {"Yb"}
              </TSpan>
            </Text>
            <Text y={322} transform="translate(0 22) translate(590)">
              {"102"}
              <TSpan x={0} dy={11.5}>
                {"No"}
              </TSpan>
            </Text>
        </G>}
        <Text transform="translate(0 22) translate(625)">{"17"}</Text>
        {type === "Test" && <G>
            <Text y={67} transform="translate(0 22) translate(625)">
              {"9"}
              <TSpan x={0} dy={11.5}>
                {"F"}
              </TSpan>
            </Text>
            <Text y={102} transform="translate(0 22) translate(625)">
              {"17"}
              <TSpan x={0} dy={11.5}>
                {"Cl"}
              </TSpan>
            </Text>
            <Text y={137} transform="translate(0 22) translate(625)">
              {"35"}
              <TSpan x={0} dy={11.5}>
                {"Br"}
              </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(625)">
              {"53"}
              <TSpan x={0} dy={11.5}>
                {"I"}
              </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(625)">
              {"85"}
              <TSpan x={0} dy={11.5}>
                {"At"}
              </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(625)">
              {"117"}
              <TSpan x={0} dy={11.5}>
                {"Ts"}
              </TSpan>
            </Text>
        </G>}
        <Text transform="translate(0 22) translate(660)">{"18"}</Text>
        {type === "Test" && <G>
            <Text y={32} transform="translate(0 22) translate(660)">
              {"2"}
              <TSpan x={0} dy={11.5}>
                {"He"}
              </TSpan>
            </Text>
            <Text y={67} transform="translate(0 22) translate(660)">
              {"10"}
              <TSpan x={0} dy={11.5}>
                {"Ne"}
              </TSpan>
            </Text>
            <Text y={102} transform="translate(0 22) translate(660)">
              {"18"}
              <TSpan x={0} dy={11.5}>
                {"Ar"}
              </TSpan>
            </Text>
            <Text y={137} transform="translate(0 22) translate(660)">
              {"36"}
              <TSpan x={0} dy={11.5}>
                {"Kr"}
              </TSpan>
            </Text>
            <Text y={172} transform="translate(0 22) translate(660)">
              {"54"}
              <TSpan x={0} dy={11.5}>
                {"Xe"}
              </TSpan>
            </Text>
            <Text y={207} transform="translate(0 22) translate(660)">
              {"86"}
              <TSpan x={0} dy={11.5}>
                {"Rn"}
              </TSpan>
            </Text>
            <Text y={242} transform="translate(0 22) translate(660)">
              {"118"}
              <TSpan x={0} dy={11.5}>
                {"Og"}
              </TSpan>
            </Text>
          </G>}
        </G>
      </G>
    </Svg>
  )
}

export default SvgComponent

const styles = StyleSheet.create({
    regular: {
        strokeWidth: '1px',
        stroke: "#222222", 
        fill: 'black'
    },

    selected: {
        strokeWidth: '1px',
        stroke: "#222222", 
        fill: '#F9D949'
    },
});
