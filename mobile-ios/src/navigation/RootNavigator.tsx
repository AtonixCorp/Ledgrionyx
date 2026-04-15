import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useEnterprise } from '../context/EnterpriseContext';
import { colors } from '../theme/colors';
import LoginScreen from '../screens/LoginScreen';
import ConsoleScreen from '../screens/ConsoleScreen';
import OrganizationSelectorScreen from '../screens/OrganizationSelectorScreen';
import OrganizationOverviewScreen from '../screens/OrganizationOverviewScreen';
import BusinessSuitesScreen from '../screens/BusinessSuitesScreen';
import TaskInboxScreen from '../screens/TaskInboxScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

export type RootStackParamList = {
    Login: undefined;
    Console: undefined;
    OrganizationSelector: undefined;
    OrganizationOverview: undefined;
    BusinessSuites: undefined;
    TaskInbox: undefined;
    Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: colors.background,
        primary: colors.accent,
        card: colors.surface,
        text: colors.ink,
        border: colors.line,
    },
};

function Splash() {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
            <ActivityIndicator size="large" color={colors.accent} />
        </View>
    );
}

export default function RootNavigator() {
    const { isAuthenticated, loading } = useAuth();
    const { bootstrapping } = useEnterprise();

    if (loading || bootstrapping) {
        return <Splash />;
    }

    return (
        <NavigationContainer theme={navTheme}>
            <Stack.Navigator
                initialRouteName={isAuthenticated ? 'Console' : 'Login'}
                screenOptions={{
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.surface },
                    headerTintColor: colors.ink,
                    headerTitleStyle: { fontWeight: '700' },
                }}
            >
                {!isAuthenticated ? (
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                ) : (
                    <>
                        <Stack.Screen name="Console" component={ConsoleScreen} options={{ title: 'Ledgrionyx Console' }} />
                        <Stack.Screen name="OrganizationSelector" component={OrganizationSelectorScreen} options={{ title: 'Organizations' }} />
                        <Stack.Screen name="OrganizationOverview" component={OrganizationOverviewScreen} options={{ title: 'Organization Overview' }} />
                        <Stack.Screen name="BusinessSuites" component={BusinessSuitesScreen} options={{ title: 'Business Suites' }} />
                        <Stack.Screen name="TaskInbox" component={TaskInboxScreen} options={{ title: 'Task Inbox' }} />
                        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}