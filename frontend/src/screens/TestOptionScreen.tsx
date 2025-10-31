import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/core';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import Modal from "react-native-modal";
import { useTest, usePackages, useUser } from '../hooks/useRedux';

import colors from '../util/colors';
import { setTestPackage, toggleAttribute, initializeTest, setTestAttributes } from '../store/slices/testSlice';
import { loadDownloadedPackages, setCurrentPackage } from '../store/slices/packagesSlice';
import { setLastTestSettings } from '../store/slices/userSlice';

import type { PackageInfo, PackageAttribute, PackageItem, PackageDivision, PackageDivisionOption } from '../types/package';
import type { InitializeTestPayload } from '../types/test';

import DropDown from '../icons/DropDown.svg';
import Check from '../icons/Check.svg';
import { TestOptionScreenNavigationProp } from 'types/navigation';

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

    const [isLoading, setLoading] = useState(true);

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


    function handleStart(): void {
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

        // Save last test settings to Redux (persisted automatically)
        user.dispatch(setLastTestSettings(testData));

        // Filter items based on division selection
        let filteredItems: PackageItem[] = packageInfo.items;
        if (selectedDiv && selectedDivOption) {
            filteredItems = packageInfo.items.filter((item: PackageItem) => {
                return item[selectedDiv.name] === selectedDivOption.name;
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
        setSelectedDiv(division);
        setDivModal(division ? true : false);
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
    }

    function handlePackCancel(): void {
        setPackModal(false);
    }

    function handlePackOption(option: PackageInfo): void {
        if (selectedPackage !== option.name) {
            packages.dispatch(setCurrentPackage(option));
            setDivOption(null);
            setSelectedDiv(null);
            // Clear attributes when switching packages
            test.dispatch(setTestPackage({ packageName: option.name, packageInfo: option }));
        }
        setPackModal(false);
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

            <ScrollView style={styles.content_scroll}>
                {/* Division Selection */}
                <View style={styles.section_container}>
                    <Text style={styles.section_title}>Select Division (Optional)</Text>
                    <View style={styles.division_container}>
                        <TouchableOpacity style={(!selectedDiv) ? styles.division_button_selected : styles.division_button} onPress={() => handleDiv(null)}>
                            <Text style={(selectedDiv === null) ? styles.division_button_title_selected : styles.division_button_title}>All</Text>
                        </TouchableOpacity>
                        {packageInfo.divisions && packageInfo.divisions.map((division: PackageDivision) => {
                            return (
                                <TouchableOpacity key={division.title} style={(selectedDiv && selectedDiv.name === division.name) ? styles.division_button_selected : styles.division_button} onPress={() => handleDiv(division)}>
                                    <Text style={(selectedDiv && selectedDiv.name === division.name) ? styles.division_button_title_selected : styles.division_button_title}>{(selectedDivOption) ? selectedDivOption.title : division.title}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>

                {/* Attribute Selection */}
                <View style={styles.section_container}>
                    <Text style={styles.section_title}>Select Attributes to Test</Text>
                    <Text style={styles.section_subtitle}>
                        {selectedAttributes.length > 0
                            ? `${selectedAttributes.length} attribute(s) selected`
                            : 'No attributes selected'}
                    </Text>
                    <View style={styles.attributes_container}>
                        {packageInfo.attributes && packageInfo.attributes.filter((attribute: PackageAttribute) => attribute.type !== "map").map((attribute: PackageAttribute) => {
                            const isSelected = isAttributeSelected(attribute);
                            const isRequired = attribute.name === 'name';
                            return (
                                <TouchableOpacity
                                    key={attribute.name}
                                    style={[
                                        styles.attribute_button,
                                        isSelected && styles.attribute_button_selected
                                    ]}
                                    onPress={() => handleAttributeToggle(attribute)}
                                    disabled={isRequired}
                                >
                                    <Text style={[
                                        styles.attribute_button_text,
                                        isSelected && styles.attribute_button_text_selected
                                    ]}>
                                        {attribute.title}
                                    </Text>
                                    {isSelected && (
                                        <Check style={styles.check_icon} />
                                    )}
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.bottom_container}>
                <TouchableOpacity style={styles.start_button} onPress={handleStart}>
                    <Text style={styles.start_text}>Start</Text>
                </TouchableOpacity>
            </View>
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
        </SafeAreaView>
    );

}

export default TestOptionScreen;

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "#222222",
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

    content_scroll: {
        flex: 1,
        backgroundColor: colors.whitePurple,
    },

    section_container: {
        paddingHorizontal: 30,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
    },

    section_title: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },

    section_subtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '400',
        marginBottom: 15,
    },

    division_container: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 15,
    },

    attributes_container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },

    attribute_button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.lightPurple,
        gap: 8,
    },

    attribute_button_selected: {
        backgroundColor: colors.lightPurple,
        borderColor: colors.lightPurple,
    },

    attribute_button_text: {
        color: colors.lightPurple,
        fontSize: 16,
        fontWeight: '500',
    },

    attribute_button_text_selected: {
        color: 'white',
    },

    check_icon: {
        width: 18,
        height: 18,
        color: 'white',
    },

    division_button: {
        minWidth: '50%',
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
        minWidth: '50%',
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
        fontSize: 20,
        fontWeight: '600'
    },

    division_button_title_selected: {
        color: 'white',
        fontSize: 20,
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
        width: '70%',
        height: '50%',
        backgroundColor: colors.whitePurple,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderRadius: 5,
        borderWidth: 5,
        borderColor: colors.lightPurple
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
        color: 'white'
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

});