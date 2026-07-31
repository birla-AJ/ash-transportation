import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeNavigationProp, NavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, spacing, typography } from '../theme/theme';
import { Card, ScreenTitle, Field, PrimaryButton, TextButton, Banner, Divider } from '../components/UI';
import { getSettings, updateSettings } from '../api/exportSettingsApi';
import { useAuth } from '../context/AuthContext';
import { AppSettings } from '../types';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Settings'>,
  NavigationProp<RootStackParamList>
>;

export default function SettingsScreen({ navigation }: { navigation: Nav }) {
  const { user, logout } = useAuth();
  const [form, setForm] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    getSettings().then(setForm).catch(() => {});
  }, []);

  function set<K extends keyof AppSettings>(field: K) {
    return (value: string) =>
      setForm((f) => (f ? { ...f, [field]: field === 'copiesPerPrint' || field === 'printerWidthMm' ? Number(value) || 0 : value } : f));
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    setMessage('');
    try {
      const updated = await updateSettings(form);
      setForm(updated);
      setMessage('Settings saved successfully');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenTitle>Settings</ScreenTitle>

      <Card style={{ marginBottom: spacing(2) }}>
        <Text style={typography.h3}>Profile</Text>
        <Divider />
        <Text style={typography.bodyBold}>{user?.name}</Text>
        <Text style={typography.caption}>{user?.email}</Text>
        <TextButton title="View Audit Logs" onPress={() => navigation.navigate('AuditLogs')} />
        <PrimaryButton
          title={loggingOut ? 'Signing out…' : 'Sign Out'}
          onPress={handleLogout}
          loading={loggingOut}
          style={{ backgroundColor: colors.error, marginTop: spacing(1) }}
        />
      </Card>

      {form ? (
        <Card>
          <Text style={typography.h3}>Company Info</Text>
          <Divider />
          {message ? (
            <Banner severity="success" onClose={() => setMessage('')}>
              {message}
            </Banner>
          ) : null}
          <Field label="Company Name" value={form.companyName} onChangeText={set('companyName')} />
          <Field label="Company Address" value={form.companyAddress} onChangeText={set('companyAddress')} />
          <Field label="Company Phone" value={form.companyPhone} onChangeText={set('companyPhone')} keyboardType="phone-pad" />

          <Divider />
          <Text style={typography.h3}>Printing</Text>
          <View style={{ height: spacing(1) }} />
          <Field
            label="Copies Per Print"
            value={String(form.copiesPerPrint)}
            onChangeText={set('copiesPerPrint')}
            keyboardType="number-pad"
          />
          <Field label="Printer Name" value={form.printerName} onChangeText={set('printerName')} />
          <Field
            label="Printer Width (mm)"
            value={String(form.printerWidthMm)}
            onChangeText={set('printerWidthMm')}
            keyboardType="number-pad"
          />

          <PrimaryButton title={saving ? 'Saving…' : 'Save Settings'} onPress={handleSave} loading={saving} />
        </Card>
      ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing(2), paddingBottom: spacing(5) },
});
