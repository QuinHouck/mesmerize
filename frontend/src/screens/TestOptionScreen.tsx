import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useNavigation } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from "react-native-modal";
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePackages, useTest, useUser } from '../hooks/useRedux';

import { loadDownloadedPackages, setCurrentPackage } from '../store/slices/packagesSlice';
import { initializeTest, setTestAttributes, setTestImages, setTestPackage, toggleAttribute } from '../store/slices/testSlice';
import { setLastTestSettings } from '../store/slices/userSlice';
import colors from '../util/colors';
import { getAttributeImages } from '../utils/testHelper';

import type { PackageAttribute, PackageDivision, PackageDivisionOption, PackageInfo, PackageItem } from '../types/package';
import type { InitializeTestPayload } from '../types/test';

import { TestOptionScreenNavigationProp } from 'types/navigation';
import DropDown from '../icons/DropDown.svg';

const TestOptionScreen = () => {
    const packages = usePackages();
    const user = useUser();
    const test = useTest();
    const navigation = useNavigation<TestOptionScreenNavigationProp>();

    // Redux state
    const downloadedPackages = packages.downloaded;
    const selectedPackage = packages.currentPackage;
    const packageInfo = selectedPackage;
    const packagesLoading = packages.loading;

    const selectedAttributes = test.selectedAttributes;

    const [selectedDiv, setSelectedDiv] = useState<PackageDivision | null>(null);
    const [selectedDivOption, setDivOption] = useState<PackageDivisionOption | null>(null);

    const [showDivModal, setDivModal] = useState(false);
    const [showPackModal, setPackModal] = useState(false);
    const [showRangeModal, setRangeModal] = useState(false);
    const [ranged, setRanged] = useState(false);
    const [start, setStart] = useState(1);
    const [end, setEnd] = useState(1);

    const [isLoading, setLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);

    // Load downloaded packages on mount
    useEffect(() => {
        // Load downloaded packages from Redux
        packages.dispatch(loadDownloadedPackages());
    }, []);

    // Initialize selections when packages are loaded
    useEffect(() => {

        if (downloadedPackages.length === 0) return;

        const setDefaultPackage = () => {
            const defaultPkg = downloadedPackages[0];
            packages.dispatch(setCurrentPackage(defaultPkg));
            test.dispatch(setTestPackage({ packageName: defaultPkg.name, packageInfo: defaultPkg }));
        };

        const restoreLastSettings = () => {
            const { pack, attributes, div, divOptionName } = user.lastTestSettings;
            const packageData = downloadedPackages.find((p: PackageInfo) => p.name === pack);

            if (!packageData) {
                setDefaultPackage();
                return;
            }

            // Set package
            packages.dispatch(setCurrentPackage(packageData));
            test.dispatch(setTestPackage({ packageName: packageData.name, packageInfo: packageData }));

            // Set attributes if available
            if (attributes) {
                test.dispatch(setTestAttributes({ attributeNames: attributes }));
            }

            // Set division and option if available
            if (div && divOptionName && packageData.divisions) {
                const divisionObj = packageData.divisions.find((d: PackageDivision) => d.name === div);
                const divOptionObj = divisionObj?.options?.find((o: PackageDivisionOption) => o.name === divOptionName);

                if (divisionObj && divOptionObj) {
                    setSelectedDiv(divisionObj);
                    setDivOption(divOptionObj);
                }
            }
        };

        user.lastTestSettings ? restoreLastSettings() : setDefaultPackage();
        setLoading(false);
    }, [downloadedPackages]);

    useEffect(() => {
        if (!packageInfo || !packageInfo.items || packageInfo.items.length === 0) {
            setStart(1);
            setEnd(1);
            setRanged(false);
            return;
        }

        setStart(1);
        setEnd(packageInfo.items.length);
        setRanged(false);
    }, [packageInfo]);


    async function handleStart(): Promise<void> {
        // Validate attribute selection
        if (selectedAttributes.length === 0) {
            alert('Please select at least one attribute to test');
            return;
        }

        const testData = {
            pack: selectedPackage.name,
            div: selectedDiv ? selectedDiv.name : null,
            divOptionName: selectedDivOption ? selectedDivOption.name : null,
            attributes: selectedAttributes.map((attr: PackageAttribute) => attr.name)
        }

        setIsStarting(true);

        // Save last test settings to Redux (persisted automatically)
        user.dispatch(setLastTestSettings(testData));

        // Filter items based on division selection
        let filteredItems: PackageItem[] = packageInfo.items;
        if (selectedDiv && selectedDivOption) {
            filteredItems = packageInfo.items.filter((item: PackageItem) => {
                return item[selectedDiv.name] === selectedDivOption.name;
            });
        }

        if (ranged && packageInfo.ranged) {
            const attr = packageInfo.ranged;
            filteredItems = filteredItems.filter((item: PackageItem) => {
                const value = Number(item[attr]);
                if (Number.isNaN(value)) {
                    return false;
                }
                return value >= start && value <= end;
            });
        }

        // Initialize test in Redux
        const initializePayload: InitializeTestPayload = {
            division: selectedDiv ? selectedDiv.name : null,
            divisionOption: selectedDivOption ? selectedDivOption.name : null,
            filteredItems: filteredItems,
            timeLimit: packageInfo.test_time || 300,
            selectedAttributes: selectedAttributes,
        };

        // Load images if there are image attributes - wait for them to load before navigating
        const hasImageAttributes = selectedAttributes.some((attr: PackageAttribute) => attr.type === 'image');
        if (hasImageAttributes) {
            const imageAttribute = selectedAttributes.find((attr: PackageAttribute) => attr.type === 'image');
            if (imageAttribute) {
                try {
                    const images = await getAttributeImages(filteredItems, imageAttribute, selectedPackage.name);
                    if (images) {
                        test.dispatch(setTestImages({ images }));
                    }
                } catch (error) {
                    console.error('Error loading images:', error);
                    // Still navigate even if image loading fails - component can handle it
                }
            }
        }

        test.dispatch(initializeTest(initializePayload));

        navigation.navigate("TestGame");
    }

    function handleAttributeToggle(attribute: PackageAttribute): void {
        // Prevent toggling the 'name' attribute
        if (attribute.name === 'name') {
            return;
        }
        test.dispatch(toggleAttribute(attribute));
    }

    function isAttributeSelected(attribute: PackageAttribute): boolean {
        return selectedAttributes.some((attr: PackageAttribute) => attr.name === attribute.name);
    }

    function handleDiv(division: PackageDivision | null): void {
        if (!division) {
            setSelectedDiv(null);
            setDivOption(null);
            setDivModal(false);
        } else {
            setSelectedDiv(division);
            setDivModal(true);
        }
        setRanged(false);
    }

    function handleDivCancel(): void {
        if (!selectedDivOption) {
            setSelectedDiv(null);
        }
        setDivModal(false);
    }

    function handleDivOption(option: PackageDivisionOption): void {
        setDivOption(option);
        setDivModal(false);
        setRanged(false);
    }

    function handlePackCancel(): void {
        setPackModal(false);
    }

    function handlePackOption(option: PackageInfo): void {
        if (selectedPackage !== option.name) {
            packages.dispatch(setCurrentPackage(option));
            setDivOption(null);
            setSelectedDiv(null);
            setRanged(false);
            setStart(1);
            setEnd(option.items ? option.items.length : 1);
            // Clear attributes when switching packages
            test.dispatch(setTestPackage({ packageName: option.name, packageInfo: option }));
        }
        setPackModal(false);
    }

    function handleRange(): void {
        setRangeModal(true);
    }

    function handleCloseRange(submitted: boolean): void {
        if (submitted) {
            setRanged(true);
            setSelectedDiv(null);
            setDivOption(null);
        }
        setRangeModal(false);
    }

    function handleSlider(values: number[]): void {
        setStart(values[0]);
        setEnd(values[1]);
    }

    if (packagesLoading || isLoading || !packageInfo) {
        return (
            <SafeAreaView style={styles.main_container}>
                <View style={styles.loading_container}>
                    <Text style={styles.loading_text}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    };

    if (downloadedPackages.length === 0) {
        return (
            <SafeAreaView style={styles.main_container}>
                <View style={styles.top_container}>
                    <TouchableOpacity style={styles.title_button} onPress={() => navigation.goBack()}>
                        <Text style={styles.title_button_text}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title_text}>Write Test</Text>
                    <View style={styles.title_button} />
                </View>
                <View style={styles.empty_container}>
                    <Text style={styles.empty_text}>Go to the store to download your first package!</Text>
                </View>
            </SafeAreaView>
        );
    };

    return (
        <SafeAreaView style={styles.main_container}>
            <View style={styles.top_container}>
                <TouchableOpacity style={styles.title_button} onPress={() => navigation.goBack()}>
                    <Text style={styles.title_button_text}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title_text}>Write Test</Text>
                <View style={styles.title_button} />
            </View>
            <View style={styles.package_container}>
                <Text style={styles.title_text}>{packageInfo.title}</Text>
                {downloadedPackages.length > 1 && <TouchableOpacity style={styles.button_container} onPress={() => setPackModal(true)}>
                    <DropDown style={styles.button_icon} />
                </TouchableOpacity>}
            </View>
            <View style={styles.division_container}>
                <TouchableOpacity style={(!selectedDiv && !ranged) ? styles.division_button_selected : styles.division_button} onPress={() => handleDiv(null)}>
                    <Text style={(selectedDiv === null && !ranged) ? styles.division_button_title_selected : styles.division_button_title}>All</Text>
                </TouchableOpacity>
                {packageInfo?.divisions && Array.isArray(packageInfo.divisions) && packageInfo.divisions.map((division: PackageDivision) => {
                    return (
                        <TouchableOpacity key={division.name} style={(selectedDiv && selectedDiv.name === division.name) ? styles.division_button_selected : styles.division_button} onPress={() => handleDiv(division)}>
                            <Text style={(selectedDiv && selectedDiv.name === division.name) ? styles.division_button_title_selected : styles.division_button_title}>{(selectedDivOption) ? selectedDivOption.title : division.title}</Text>
                        </TouchableOpacity>
                    );
                })}
                {packageInfo?.ranged &&
                    <TouchableOpacity style={(!selectedDiv && ranged) ? styles.division_button_selected : styles.division_button} onPress={handleRange}>
                        {(selectedDiv === null && ranged) ?
                            <Text style={styles.division_button_title_selected}>{`${start} - ${end}`}</Text>
                            :
                            <Text style={styles.division_button_title}>Range</Text>
                        }
                    </TouchableOpacity>}
            </View>
            <View style={styles.attributes_container}>
                <View style={styles.attributes_title}>
                    <Text style={styles.section_text}>Select Attributes:</Text>
                </View>
                <ScrollView style={styles.attributes_scroll} contentContainerStyle={styles.attributes_content}>
                    {packageInfo && packageInfo.attributes && packageInfo.attributes.filter((attribute: PackageAttribute) => attribute.type !== "map").map((attribute: PackageAttribute) => {
                        const isSelected = isAttributeSelected(attribute);
                        const isRequired = attribute.name === 'name';
                        return (
                            <TouchableOpacity
                                key={attribute.name}
                                style={isSelected ? styles.attribute_button_selected : styles.attribute_button}
                                onPress={() => handleAttributeToggle(attribute)}
                                disabled={isRequired}
                            >
                                <Text style={isSelected ? styles.attribute_text_selected : styles.attribute_text}>{attribute.title}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>

            <View style={styles.bottom_container}>
                <TouchableOpacity style={styles.start_button} onPress={handleStart} disabled={isStarting}>
                    <Text style={styles.start_text}>Start</Text>
                </TouchableOpacity>
            </View>
            {isStarting && (
                <View style={styles.loading_overlay}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles.loading_overlay_text}>Loading images...</Text>
                </View>
            )}
            <Modal
                isVisible={showDivModal}
                coverScreen={true}
                onBackdropPress={handleDivCancel}
                style={styles.modal_container}
            >
                <View style={styles.modal_options_container}>
                    {selectedDiv && selectedDiv.options.map((option: PackageDivisionOption) => {
                        return (
                            <TouchableOpacity key={option.title} style={styles.modal_options_button} onPress={() => handleDivOption(option)}>
                                <Text style={styles.modal_options_text}>{option.title}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </Modal>
            <Modal
                isVisible={showPackModal}
                coverScreen={true}
                onBackdropPress={handlePackCancel}
                style={styles.modal_container}
            >
                <View style={styles.modal_options_container}>
                    {downloadedPackages && downloadedPackages.map((option: PackageInfo) => {
                        return (
                            <TouchableOpacity key={option.name} style={styles.modal_options_button} onPress={() => handlePackOption(option)}>
                                <Text style={styles.modal_options_text}>{option.title}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </Modal>
            <Modal
                isVisible={showRangeModal}
                coverScreen={true}
                onBackdropPress={() => handleCloseRange(false)}
                style={styles.modal_container}
            >
                <View style={styles.slider_container}>
                    <Text style={styles.slider_text}>{`${start} - ${end}`}</Text>
                    <MultiSlider
                        values={[start, end]}
                        isMarkersSeparated={true}
                        onValuesChange={handleSlider}
                        min={1}
                        max={packageInfo?.items ? packageInfo.items.length : 1}
                        step={1}
                        snapped
                        sliderLength={200}
                        containerStyle={styles.slider}
                        unselectedStyle={{
                            backgroundColor: 'white',
                            height: 5,
                        }}
                        selectedStyle={{
                            backgroundColor: colors.darkPurple,
                            height: 5,
                        }}
                    />
                    <TouchableOpacity style={[styles.modal_options_button, { backgroundColor: colors.darkPurple }]} onPress={() => handleCloseRange(true)}>
                        <Text style={styles.modal_options_text}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );

}

export default TestOptionScreen;

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: colors.darkGrey,
    },

    top_container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingVertical: 10,
        backgroundColor: colors.lightPurple,
    },

    title_text: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
    },

    title_button: {
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },

    title_button_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '400',
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 3,
        paddingHorizontal: 5,
    },

    package_container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        maxHeight: 60,
        gap: 10,
        paddingHorizontal: 30,
        paddingVertical: 10,
        backgroundColor: colors.darkPurple
    },

    button_container: {
        height: '75%',
        aspectRatio: 1,
    },

    button_icon: {
        color: 'white',
        height: '100%',
        aspectRatio: 1,
    },

    division_container: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: 30,
        paddingVertical: 10,
        backgroundColor: colors.whitePurple
    },

    attributes_container: {
        flex: 1,
        width: '100%',
        backgroundColor: colors.whitePurple
    },

    attributes_title: {
        padding: 10,
        alignItems: 'center',
        backgroundColor: colors.darkPurple
    },

    section_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '500'
    },

    attributes_scroll: {
        flex: 1,
    },

    attributes_content: {
        alignItems: 'center',
        padding: 20,
        gap: 20,
    },

    attribute_button: {
        width: '100%',
        paddingVertical: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 4,
        borderColor: colors.lightPurple
    },

    attribute_button_selected: {
        width: '100%',
        paddingVertical: 10,
        backgroundColor: colors.lightPurple,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 4,
        borderColor: colors.lightPurple
    },

    attribute_text: {
        color: colors.lightPurple,
        fontSize: 15,
        fontWeight: '600'
    },

    attribute_text_selected: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600'
    },

    division_button: {
        minWidth: '20%',
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 4,
        borderColor: colors.lightPurple
    },

    division_button_selected: {
        minWidth: '20%',
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: colors.lightPurple,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderWidth: 4,
        borderColor: colors.lightPurple
    },

    division_button_title: {
        color: colors.lightPurple,
        fontSize: 15,
        fontWeight: '600'
    },

    division_button_title_selected: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600'
    },

    bottom_container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        backgroundColor: colors.whitePurple,
        padding: 10,
    },

    start_button: {
        backgroundColor: colors.darkPurple,
        padding: 10,
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5
    },

    start_text: {
        color: 'white',
        fontSize: 30,
        fontWeight: '700'
    },

    modal_container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },

    modal_options_container: {
        width: '80%',
        height: '50%',
        backgroundColor: colors.whitePurple,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderRadius: 5,
    },

    modal_options_button: {
        width: '70%',
        paddingVertical: 14,
        backgroundColor: colors.lightPurple,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5
    },

    modal_options_text: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600'
    },

    empty_container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    empty_text: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },

    loading_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loading_text: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },

    slider: {
        width: '80%',
    },

    slider_container: {
        width: '80%',
        height: '50%',
        backgroundColor: colors.lightPurple,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderRadius: 10,
    },

    slider_text: {
        color: 'white',
        fontSize: 50,
        fontWeight: '700'
    },

    loading_overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    loading_overlay_text: {
        marginTop: 20,
        color: 'white',
        fontSize: 18,
        fontWeight: '600'
    },

});