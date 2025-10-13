import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/core';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NetInfo from '@react-native-community/netinfo';

import colors from '../util/colors.js';
import { usePackages, useNetwork } from '../hooks/useRedux';
import { 
  fetchAvailablePackages, 
  downloadPackage, 
  loadDownloadedPackages, 
  uninstallPackage,
} from '../store/slices/packagesSlice';
import { setOnlineStatus } from '../store/slices/networkSlice';

import DownloadIcon from '../icons/Download.svg';
import UninstallIcon from '../icons/Uninstall.svg';
import UpdateIcon from '../icons/Update.svg';

const StoreScreen = () => {
    const navigation = useNavigation();
    const { isInternetReachable, dispatch: networkDispatch } = useNetwork();
    const { available, downloaded, loading, error, dispatch } = usePackages();
    const [ selected, setSelected ] = useState("");
    const [ checkingNetwork, setCheckingNetwork ] = useState(false);

    useEffect(() => {
        loadStore();
    }, []);

    async function loadStore() {
        try {
            // Load available packages from server
            await dispatch(fetchAvailablePackages());
            
            // Load downloaded packages from AsyncStorage
            await dispatch(loadDownloadedPackages());
        } catch (error) {
            console.log("Error loading store: ", error);
        }
    }

    async function handleDownloadPackage(packageInfo) {
        try {
            await dispatch(downloadPackage(packageInfo));
            setSelected("");
        } catch (error) {
            console.log("Error downloading package: ", error);
        }
    }

    async function handleUninstallPackage(packageName) {
        try {
            await dispatch(uninstallPackage(packageName));
            setSelected("");
        } catch (error) {
            console.log("Error uninstalling package: ", error);
        }
    }

    async function handleCheckAgain() {
        setCheckingNetwork(true);
        try {
            // Re-fetch network status
            const state = await NetInfo.fetch();
            networkDispatch(setOnlineStatus({
                isConnected: state.isConnected,
                isInternetReachable: state.isInternetReachable,
                type: state.type,
            }));
            
            // If we're back online, try to load the store
            if (state.isInternetReachable) {
                await loadStore();
            }
        } catch (error) {
            console.log("Error checking network: ", error);
        } finally {
            setCheckingNetwork(false);
        }
    }

    // Show loading state
    // if (loading) {
    //     return (
    //         <SafeAreaView style={styles.main_container}>
    //             <View style={styles.top_container}>
    //                 <TouchableOpacity style={styles.title_button} onPress={() => navigation.goBack()}>
    //                     <Text style={styles.title_button_text}>Back</Text>
    //                 </TouchableOpacity>
    //                 <Text style={styles.title_text}>Store</Text>
    //                 <View style={styles.title_button}/>
    //             </View>
    //             <View style={styles.loading_container}>
    //                 <Text style={styles.loading_text}>Loading packages...</Text>
    //             </View>
    //         </SafeAreaView>
    //     );
    // }

    // Show error state
    if (error) {
        return (
            <SafeAreaView style={styles.main_container}>
                <View style={styles.top_container}>
                    <TouchableOpacity style={styles.title_button} onPress={() => navigation.goBack()}>
                        <Text style={styles.title_button_text}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title_text}>Store</Text>
                    <View style={styles.title_button}/>
                </View>
                <View style={styles.error_container}>
                    <Text style={styles.error_text}>Error: {error}</Text>
                    <TouchableOpacity style={styles.retry_button} onPress={loadStore}>
                        <Text style={styles.retry_text}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
    
    // Filter available packages to only show those not downloaded
    const downloadedNames = downloaded.map(d => d.name);
    const availableNotDownloaded = available.filter(p => !downloadedNames.includes(p.name));

    return (
        <SafeAreaView style={styles.main_container}>
            <View style={styles.secondary_container}>
               <View style={styles.top_container}>
                <TouchableOpacity style={styles.title_button} onPress={() => navigation.goBack()}>
                    <Text style={styles.title_button_text}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title_text}>Store</Text>
                <View style={styles.title_button}/>
            </View>
            <View style={styles.store_text_container}>
                <Text style={styles.store_text}>Available</Text>
            </View>
            {!isInternetReachable ? (
                <View style={styles.offline_container}>
                    <Text style={styles.offline_title}>Offline</Text>
                    <TouchableOpacity 
                        style={styles.retry_button} 
                        onPress={handleCheckAgain}
                        disabled={checkingNetwork}
                    >
                        <Text style={styles.retry_text}>
                            {checkingNetwork ? 'Checking...' : 'Check Again'}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : availableNotDownloaded.length === 0 ? (
                <View style={styles.offline_container}>
                    <Text style={styles.offline_text}>No packages available to download</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scroll_container}>
                    <View style={styles.package_options_container}>
                        {availableNotDownloaded.map((p) => {
                            if(selected !== p.name){
                                return (
                                    <TouchableOpacity key={p.name} style={styles.package_option} onPress={() => setSelected(p.name)}>
                                        <LinearGradient 
                                            colors={[colors.lightPurple, colors.lightPurpleShadow]} 
                                            style={styles.option_inside} 
                                            dither={false}
                                            start={{x: 0.49, y: 0.3}}
                                            end={{x: 0.5, y: 1}}
                                        >
                                            <Text style={styles.package_title_text}>{p.title}</Text>
                                        </LinearGradient>
                                    </TouchableOpacity> 
                                ); 
                            } else {
                                return (
                                    <TouchableOpacity key={p.name} style={styles.package_option_selected} onPress={() => setSelected("")}>
                                        <Text style={styles.package_title_selected_text}>{p.title}</Text>
                                        <TouchableOpacity onPress={() => handleDownloadPackage(p)}>
                                            <DownloadIcon style={styles.icon}/>
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ); 
                            }
                        })} 
                    </View>
                </ScrollView>
            )}
            <View style={styles.store_text_container}>
                <Text style={styles.store_text}>Downloaded</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scroll_container}>
                <View style={styles.package_options_container}>
                   {downloaded.map((p) => {
                        if(selected !== p.name){
                            return (
                                <TouchableOpacity key={p.name} style={styles.package_option} onPress={() => setSelected(p.name)}>
                                    <LinearGradient 
                                        colors={[colors.lightPurple, colors.lightPurpleShadow]} 
                                        style={styles.option_inside} 
                                        dither={false}
                                        start={{x: 0.49, y: 0.3}}
                                        end={{x: 0.5, y: 1}}
                                    >
                                        <Text style={styles.package_title_text}>{p.title}</Text>
                                    </LinearGradient>
                                </TouchableOpacity> 
                            ); 
                        } else {
                            return (
                                <TouchableOpacity key={p.name} style={styles.package_option_selected} onPress={() => setSelected("")}>
                                    <Text style={styles.package_title_selected_text}>{p.title}</Text>
                                    <View>
                                        {p.updateable && <TouchableOpacity onPress={() => downloadPackage(p)}>
                                            <UpdateIcon style={styles.icon}/>
                                        </TouchableOpacity>}
                                        <TouchableOpacity onPress={() => handleUninstallPackage(p.name)}>
                                            <UninstallIcon style={styles.icon}/>
                                        </TouchableOpacity>
                                    </View>
                                    
                                </TouchableOpacity>
                            ); 
                        }
                        
                    })} 
                </View>
            </ScrollView> 
            </View>
            
        </SafeAreaView>
    );

}

export default StoreScreen;

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: colors.darkGrey,
    },

    secondary_container: {
        flex: 1
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

    scroll_container: {
        // backgroundColor: 'purple',
        alignItems: 'center',
        justifyContent: 'center',
    },

    package_options_container: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        gap: 20,
        // backgroundColor: 'green',
        padding: 20,
    },

    package_option: {
        width: '80%',
        height: 80,
        borderRadius: 5,
        backgroundColor: colors.lightPurple,
        shadowColor: '#111111',
        shadowOffset: {width: 2, height: 3},
        shadowOpacity: 0.4,
        shadowRadius: 5,
    },

    option_inside: {
        padding: 20,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },

    package_title_text: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
    },

    package_option_selected: {
        flexDirection: 'row',
        width: '80%',
        height: 80,
        backgroundColor: "white",
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 5,
        padding: 20,
        borderRadius: 5,
    }, 

    package_title_selected_text: {
        color: colors.darkGrey,
        fontSize: 20,
        fontWeight: '700',
    },

    icon: {
        height: '90%',
        aspectRatio: 1,
        color: colors.darkGrey,
    },

    store_text_container: {
        borderBottomColor: 'white',
        borderBottomWidth: 2,
        marginHorizontal: 20,
        marginTop: 20,
        padding: 5,
    },

    store_text: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
        
    },

    loading_container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    loading_text: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
    },

    offline_container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        padding: 10,
    },

    error_container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },

    error_text: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },

    retry_button: {
        backgroundColor: colors.lightPurple,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },

    retry_text: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    offline_title: {
        color: 'white',
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },

    offline_text: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
});