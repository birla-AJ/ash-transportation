import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import RNPrint from 'react-native-print';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { colors, spacing, typography } from '../theme/theme';
import { Card, ScreenTitle, PrimaryButton, OutlineButton, Banner, Divider } from '../components/UI';
import { getChallan, registerPrint } from '../api/challansApi';
import { buildReceiptHtml } from '../utils/receiptHtml';
import { Challan } from '../types';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Receipt'>;
type Route = RouteProp<RootStackParamList, 'Receipt'>;

export default function ReceiptScreen({ navigation, route }: { navigation: Nav; route: Route }) {
  const { challanId, copies = 4 } = route.params;
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState('');
  const hasAutoPrinted = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getChallan(challanId);
      setChallan(data);
    } finally {
      setLoading(false);
    }
  }, [challanId]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePrint = useCallback(async () => {
    setPrinting(true);
    setError('');
    try {
      try {
        await registerPrint(challanId);
      } catch (e) {
        // Printing should still proceed even if the audit call fails.
      }
      const html = buildReceiptHtml(challan, copies);
      await RNPrint.print({ html });
    } catch (err: any) {
      setError(err?.message || 'Failed to open print dialog');
    } finally {
      setPrinting(false);
    }
  }, [challan, challanId, copies]);

  useEffect(() => {
    if (challan && !hasAutoPrinted.current) {
      hasAutoPrinted.current = true;
      const timer = setTimeout(() => handlePrint(), 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [challan, handlePrint]);

  if (loading || !challan) {
    return (
      <View style={styles.screen}>
        <Text style={[typography.body, { padding: spacing(2) }]}>Loading receipt…</Text>
      </View>
    );
  }

  const dateStr = dayjs(challan.challanDate).format('DD/MM/YYYY');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenTitle>Receipt Preview</ScreenTitle>
      {error ? (
        <Banner severity="error" onClose={() => setError('')}>
          {error}
        </Banner>
      ) : null}

      <Card style={styles.receiptCard}>
        <Text style={styles.title}>NTPC LIMITED</Text>
        <Text style={styles.subtitle}>(A Govt. of India Enterprises)</Text>
        <Text style={styles.project}>KHARGONE SUPER THERMAL POWER PROJECT</Text>
        <Text style={styles.address}>Post -KHEDI BUJURG, VILL-SELDA BALABAD, MP</Text>
        <Text style={styles.doctype}>DELIVERY CONSIGNMENT FOR ASH</Text>

        <Divider />

        <View style={styles.challanNoRow}>
          <Text style={typography.bodyBold}>CHALLAN NO:</Text>
          <Text style={styles.challanNoValue}>{challan.challanNumber}</Text>
        </View>

        <Field label="Place of delivery" value={challan.placeOfDelivery} />
        <Field label="Truck No." value={challan.truckNumber} />
        <Field label="Date" value={dateStr} />
        <Field label="Time" value={challan.challanTime} />

        <Text style={styles.copiesNote}>{copies} identical copies will be printed / shared as PDF.</Text>
      </Card>

      <View style={{ gap: spacing(1.25), marginTop: spacing(2) }}>
        <PrimaryButton title={printing ? 'Opening print dialog…' : `Print ${copies} Copies`} onPress={handlePrint} loading={printing} />
        <OutlineButton title="Close" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label} :</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing(2), paddingBottom: spacing(5) },
  receiptCard: { borderWidth: 1.5, borderColor: colors.textPrimary },
  title: { textAlign: 'center', fontWeight: '700', fontSize: 17, letterSpacing: 1 },
  subtitle: { textAlign: 'center', fontSize: 11, color: colors.textSecondary },
  project: { textAlign: 'center', fontWeight: '700', fontSize: 13, marginTop: 2 },
  address: { textAlign: 'center', fontSize: 11, color: colors.textSecondary },
  doctype: { textAlign: 'center', fontWeight: '700', fontSize: 13, marginTop: 4, textDecorationLine: 'underline' },
  challanNoRow: { flexDirection: 'row', gap: spacing(1), marginBottom: spacing(1.5) },
  challanNoValue: { color: colors.error, fontWeight: '700', fontSize: 15 },
  fieldRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.divider, paddingVertical: spacing(1) },
  fieldLabel: { fontWeight: '700', fontSize: 13, marginRight: spacing(1) },
  fieldValue: { fontSize: 13, flex: 1 },
  copiesNote: { ...typography.caption, textAlign: 'right', marginTop: spacing(2) },
});
