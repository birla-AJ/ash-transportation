import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../theme/theme';
import { Card, ScreenTitle, Field, PrimaryButton, OutlineButton, TextButton, Banner } from '../components/UI';
import { createChallan } from '../api/challansApi';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddChallan'>;

const emptyForm = { truckNumber: '', placeOfDelivery: '' };

export default function AddChallanScreen({ navigation }: { navigation: Nav }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function set(field: keyof typeof emptyForm) {
    return (value: string) => setForm((f) => ({ ...f, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setError('');
    setSuccess('');
  }

  function validate(): string {
    if (!form.truckNumber.trim()) return 'Truck Number is required';
    if (!form.placeOfDelivery.trim()) return 'Place Of Delivery is required';
    return '';
  }

  async function handleSave(andPrint: boolean) {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSaving(true);
    try {
      const challan = await createChallan(form);
      setSuccess(`Challan ${challan.challanNumber} saved successfully`);
      setForm(emptyForm);
      if (andPrint) {
        navigation.navigate('Receipt', { challanId: challan.id });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save challan');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenTitle>Add Challan</ScreenTitle>

      <Card>
        {error ? (
          <Banner severity="error" onClose={() => setError('')}>
            {error}
          </Banner>
        ) : null}
        {success ? (
          <Banner severity="success" onClose={() => setSuccess('')}>
            {success}
          </Banner>
        ) : null}

        <Field
          label="Truck Number *"
          value={form.truckNumber}
          onChangeText={set('truckNumber')}
          placeholder="e.g. GJ01AB1234"
          autoCapitalize="characters"
        />
        <Field
          label="Place Of Delivery *"
          value={form.placeOfDelivery}
          onChangeText={set('placeOfDelivery')}
          placeholder="e.g. Rajkot Site"
        />

        <Banner severity="info">Challan Number, Date and Time are generated automatically on save.</Banner>

        <View style={{ gap: spacing(1.25) }}>
          <PrimaryButton title={saving ? 'Saving…' : 'Save & Print'} onPress={() => handleSave(true)} loading={saving} />
          <OutlineButton title="Save" onPress={() => handleSave(false)} disabled={saving} />
          <TextButton title="Reset" onPress={resetForm} disabled={saving} />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing(2), paddingBottom: spacing(5) },
});
