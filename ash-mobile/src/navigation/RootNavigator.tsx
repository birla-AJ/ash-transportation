import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';
import LoginScreen from '../screens/LoginScreen';
import Tabs from './Tabs';
import AddChallanScreen from '../screens/AddChallanScreen';
import ChallanDetailScreen from '../screens/ChallanDetailScreen';
import ReceiptScreen from '../screens/ReceiptScreen';
import AuditLogsScreen from '../screens/AuditLogsScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
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

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
