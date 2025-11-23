import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppTabParamList } from '../types/navigation';
import { HomeScreen } from '../screens/app/HomeScreen';
import { ActiveDeliveriesScreen } from '../screens/app/ActiveDeliveriesScreen';
import { HistoryScreen } from '../screens/app/HistoryScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';
import { PendingApprovalScreen } from '../screens/app/PendingApprovalScreen';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator<AppTabParamList>();

export const AppNavigator = () => {
    const user = useAuthStore((state) => state.user);
    const { theme } = useTheme();

    // If user is pending approval, show only the pending screen
    if (user?.status === 'pending') {
        return <PendingApprovalScreen />;
    }

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Home') {
                        iconName = focused ? 'map' : 'map-outline';
                    } else if (route.name === 'ActiveDeliveries') {
                        iconName = focused ? 'bicycle' : 'bicycle-outline';
                    } else if (route.name === 'History') {
                        iconName = focused ? 'time' : 'time-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else {
                        iconName = 'help';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.tabBarActive,
                tabBarInactiveTintColor: theme.colors.tabBarInactive,
                tabBarStyle: {
                    backgroundColor: theme.colors.tabBarBackground,
                    borderTopColor: theme.colors.tabBarBorder,
                    borderTopWidth: 1,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
            <Tab.Screen name="ActiveDeliveries" component={ActiveDeliveriesScreen} options={{ title: 'Entregas' }} />
            <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Histórico' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
        </Tab.Navigator>
    );
};
