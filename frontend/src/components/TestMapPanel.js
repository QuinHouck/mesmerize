import React from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';

import { useTest } from '../hooks/useRedux';
import Map from './Map';

import colors from '../util/colors';

/**
 * TestMapPanel - Component for displaying discovered items on a map
 */
const TestMapPanel = React.memo(() => {
    const test = useTest();
    
    const discoveredItems = test.discoveredItems;
    const pack = test.packageName;
    const div = test.division;
    const divOption = test.divisionOption;

    return (
        <View style={styles.map_container}>
            <Map selected={discoveredItems} pack={pack} div={div} divOption={divOption} type={"Test"} />
        </View>
    );
});

TestMapPanel.displayName = 'TestMapPanel';

export default TestMapPanel;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
    },

    symbol_container: {
        flex: 5,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

    symbol: {
        height: '40%',
        aspectRatio: 1,
    },

    stats_container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
    },

    stats_left: {
        gap: 15,
        minWidth: '25%',
        marginBottom: 5
    },

    stats_left_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        borderBottomWidth: 3,
        borderBottomColor: 'white',
        paddingLeft: 15,
    },

    button: {
        alignSelf: 'flex-end',
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },

    button_text: {
        color: 'white',
        fontSize: 16,
        fontWeight: '400',
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 3,
        paddingHorizontal: 5,
    },

    answer_container: {
        backgroundColor: colors.lightPurple,
        padding: 10,
    },

    input: {
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 5,
        fontSize: 18,
        fontWeight: '600',
        color: '#222222'
    },
});

