import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { SettingsScreen } from '../screens/app/SettingsScreen';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../types/navigation';
import * as Linking from 'expo-linking';

import { useNotifications } from '../hooks/useNotifications';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [Linking.createURL('/')],
    config: {
        screens: {
            Auth: {
                screens: {
                    Login: 'login',
                    Register: 'register',
                    ForgotPassword: 'forgot-password',
                },
            },
            App: {
                screens: {
                    Home: 'home',
                    ActiveDeliveries: 'deliveries',
                    History: 'history',
                    Profile: 'profile',
                },
            },
            Settings: 'settings',
            NotFound: '*',
        },
    },
};

export const RootNavigator = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);
    const checkAuth = useAuthStore((state) => state.checkAuth);

    // Initialize notifications
    try {
        useNotifications();
    } catch (error) {
        console.warn('Failed to initialize notifications hook:', error);
    }

    useEffect(() => {
        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF8C42" />
            </View>
        );
    }

    return (
        <NavigationContainer linking={linking}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <>
                        <Stack.Screen name="App" component={AppNavigator} />
                        <Stack.Screen name="Settings" component={SettingsScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
});
