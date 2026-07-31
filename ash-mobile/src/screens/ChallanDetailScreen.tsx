import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal } from 'react-native';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { colors, spacing, typography } from '../theme/theme';
import {
  Card,
  ScreenTitle,
  Field,
  PrimaryButton,
  OutlineButton,
  TextButton,
  Banner,
  Divider,
  Chip,
} from '../components/UI';
import { getChallan, updateChallan, deleteChallan } from '../api/challansApi';
import { Challan } from '../types';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ChallanDetail'>;
type Route = RouteProp<RootStackParamList, 'ChallanDetail'>;

export default function ChallanDetailScreen({ navigation, route }: { navigation: Nav; route: Route }) {
  const { challanId } = route.params;
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ truckNumber: '', placeOfDelivery: '', challanDate: '', challanTime: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getChallan(challanId);
      setChallan(data);
      setForm({
        truckNumber: data.truckNumber,
        placeOfDelivery: data.placeOfDelivery,
        challanDate: dayjs(data.challanDate).format('YYYY-MM-DD'),
        challanTime: data.challanTime,
      });
    } finally {
      setLoading(false);
    }
  }, [challanId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleSave() {
    if (!form.truckNumber.trim() || !form.placeOfDelivery.trim()) {
      setError('Truck Number and Place Of Delivery are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await updateChallan(challanId, form);
      setChallan(updated);
      setEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update challan');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteReason.trim()) {
      setDeleteError('A reason is required to delete a challan');
      return;
    }
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteChallan(challanId, deleteReason.trim());
      setDeleteOpen(false);
      navigation.goBack();
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || 'Failed to delete challan');
    } finally {
      setDeleting(false);
    }
  }

  if (loading && !challan) {
    return (
      <View style={styles.screen}>
        <Text style={[typography.body, { padding: spacing(2) }]}>Loading…</Text>
      </View>
    );
  }
  if (!challan) return null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenTitle>{challan.challanNumber}</ScreenTitle>

      {error ? (
        <Banner severity="error" onClose={() => setError('')}>
          {error}
        </Banner>
      ) : null}

      <Card>
        {challan.isDeleted ? <Chip label="Deleted" tone="error" /> : <Chip label="Active" tone="success" />}

        {!editing ? (
          <>
            <Divider />
            <Row label="Truck Number" value={challan.truckNumber} />
            <Row label="Place Of Delivery" value={challan.placeOfDelivery} />
            <Row label="Date" value={dayjs(challan.challanDate).format('DD MMM YYYY')} />
            <Row label="Time" value={challan.challanTime} />
            <Row label="Print Count" value={String(challan.printCount)} />
            {challan.lastPrintedAt ? (
              <Row label="Last Printed" value={dayjs(challan.lastPrintedAt).format('DD MMM YYYY, h:mm A')} />
            ) : null}

            {!challan.isDeleted && (
              <View style={{ gap: spacing(1.25), marginTop: spacing(2) }}>
                <PrimaryButton
                  title="Reprint Receipt"
                  onPress={() => navigation.navigate('Receipt', { challanId: challan.id })}
                />
                <OutlineButton title="Edit" onPress={() => setEditing(true)} />
                <TextButton title="Delete Challan" color={colors.error} onPress={() => setDeleteOpen(true)} />
              </View>
            )}
          </>
        ) : (
          <>
            <Divider />
            <Field
              label="Truck Number"
              value={form.truckNumber}
              onChangeText={(v) => setForm((f) => ({ ...f, truckNumber: v }))}
              autoCapitalize="characters"
            />
            <Field
              label="Place Of Delivery"
              value={form.placeOfDelivery}
              onChangeText={(v) => setForm((f) => ({ ...f, placeOfDelivery: v }))}
            />
            <Field
              label="Date (YYYY-MM-DD)"
              value={form.challanDate}
              onChangeText={(v) => setForm((f) => ({ ...f, challanDate: v }))}
              placeholder="2026-07-26"
            />
            <Field
              label="Time (HH:mm)"
              value={form.challanTime}
              onChangeText={(v) => setForm((f) => ({ ...f, challanTime: v }))}
              placeholder="14:30"
            />
            <Banner severity="info">Saving will reprint 4 identical receipts with the updated details.</Banner>
            <View style={{ gap: spacing(1.25) }}>
              <PrimaryButton title={saving ? 'Saving…' : 'Save & Reprint'} onPress={handleSave} loading={saving} />
              <TextButton title="Cancel" onPress={() => setEditing(false)} disabled={saving} />
            </View>
          </>
        )}
      </Card>

      <Modal visible={deleteOpen} transparent animationType="fade" onRequestClose={() => setDeleteOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={typography.h3}>Delete Challan {challan.challanNumber}</Text>
            <Banner severity="warning">
              This action cannot be undone. The challan number will never be reused.
            </Banner>
            {deleteError ? <Banner severity="error">{deleteError}</Banner> : null}
            <Field
              label="Reason for deletion"
              value={deleteReason}
              onChangeText={setDeleteReason}
              placeholder="e.g. Duplicate entry created by mistake"
              multiline
              numberOfLines={3}
            />
            <View style={{ gap: spacing(1.25) }}>
              <PrimaryButton
                title={deleting ? 'Deleting…' : 'Delete Challan'}
                onPress={handleDelete}
                loading={deleting}
                style={{ backgroundColor: colors.error }}
              />
              <TextButton
                title="Cancel"
                onPress={() => {
                  setDeleteOpen(false);
                  setDeleteReason('');
                  setDeleteError('');
                }}
                disabled={deleting}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing(2), paddingBottom: spacing(5) },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing(0.9) },
  rowLabel: { ...typography.caption, fontWeight: '600' },
  rowValue: { ...typography.body },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,37,48,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(2.5),
  },
  modalCard: {
    backgroundColor: colors.paper,
    borderRadius: 16,
    padding: spacing(2.5),
    width: '100%',
    gap: spacing(1),
  },
});
