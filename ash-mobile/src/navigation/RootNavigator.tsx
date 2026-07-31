import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import Tabs from './Tabs';
import AddChallanScreen from '../screens/AddChallanScreen';
import ChallanDetailScreen from '../screens/ChallanDetailScreen';
import ReceiptScreen from '../screens/ReceiptScreen';
import AuditLogsScreen from '../screens/AuditLogsScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Minimum time the animated splash stays visible, regardless of how fast the
// auth/session check finishes. Keeps the splash from flashing on quick loads.
const MIN_SPLASH_MS = 3000;

export default function RootNavigator() {
  const { user, initializing } = useAuth();
  const [splashElapsed, setSplashElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  // Show splash until BOTH the session check is done AND the minimum
  // splash duration has elapsed. Once done, user goes straight to
  // Dashboard (Tabs) if already logged in, otherwise to Login.
  if (initializing || !splashElapsed) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {!user ? (
        <LoginScreen />
      ) : (
        <Stack.Navigator screenOptions={{ headerTintColor: colors.primary, headerTitleStyle: { color: colors.textPrimary } }}>
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="AddChallan" component={AddChallanScreen} options={{ title: 'Add Challan' }} />
          <Stack.Screen name="ChallanDetail" component={ChallanDetailScreen} options={{ title: 'Challan Details' }} />
          <Stack.Screen name="Receipt" component={ReceiptScreen} options={{ title: 'Receipt' }} />
          <Stack.Screen name="AuditLogs" component={AuditLogsScreen} options={{ title: 'Audit Logs' }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}


