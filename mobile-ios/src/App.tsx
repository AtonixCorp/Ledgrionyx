import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { EnterpriseProvider } from './context/EnterpriseContext';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <EnterpriseProvider>
                    <RootNavigator />
                </EnterpriseProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}