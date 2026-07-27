import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { CompositeNavigationProp, NavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, spacing } from '../theme/theme';
import { Field, ScreenTitle, EmptyState, OutlineButton, Banner } from '../components/UI';
import FilterChip from '../components/FilterChip';
import ChallanCard from '../components/ChallanCard';
import { listChallans } from '../api/challansApi';
import { downloadAndShareExport } from '../api/exportSettingsApi';
import { Challan, ChallanQuery, DurationFilter } from '../types';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Reports'>,
  NavigationProp<RootStackParamList>
>;

const DURATIONS: { value: DurationFilter; label: string }[] = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

export default function ReportsScreen({ navigation }: { navigation: Nav }) {
  const [truckNumber, setTruckNumber] = useState('');
  const [duration, setDuration] = useState<DurationFilter>('');
  const [rows, setRows] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<'' | 'csv' | 'excel' | 'pdf'>('');
  const [error, setError] = useState('');

  const currentFilters: ChallanQuery = {
    truckNumber: truckNumber || undefined,
    duration: duration || undefined,
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listChallans({
        ...currentFilters,
        page: 1,
        limit: 200,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setRows(result.items);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [truckNumber, duration]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleExport(format: 'csv' | 'excel' | 'pdf') {
    setExporting(format);
    setError('');
    try {
      const ext = format === 'excel' ? 'xlsx' : format;
      await downloadAndShareExport(format, currentFilters, `challans-${Date.now()}.${ext}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to export');
    } finally {
      setExporting('');
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <ScreenTitle>Reports</ScreenTitle>
        {error ? (
          <Banner severity="error" onClose={() => setError('')}>
            {error}
          </Banner>
        ) : null}
        <Field
          placeholder="Filter by truck number"
          value={truckNumber}
          onChangeText={setTruckNumber}
          autoCapitalize="characters"
          style={{ marginBottom: spacing(1.5) }}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing(1.5) }}>
          {DURATIONS.map((d) => (
            <FilterChip key={d.value || 'all'} label={d.label} active={duration === d.value} onPress={() => setDuration(d.value)} />
          ))}
        </ScrollView>

        <View style={styles.exportRow}>
          <OutlineButton title={exporting === 'csv' ? 'Exporting…' : 'CSV'} onPress={() => handleExport('csv')} disabled={!!exporting} style={styles.exportBtn} />
          <OutlineButton title={exporting === 'excel' ? 'Exporting…' : 'Excel'} onPress={() => handleExport('excel')} disabled={!!exporting} style={styles.exportBtn} />
          <OutlineButton title={exporting === 'pdf' ? 'Exporting…' : 'PDF'} onPress={() => handleExport('pdf')} disabled={!!exporting} style={styles.exportBtn} />
        </View>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ChallanCard challan={item} onPress={() => navigation.navigate('ChallanDetail', { challanId: item._id })} />
        )}
        refreshing={loading}
        onRefresh={loadData}
        ListEmptyComponent={<EmptyState text={loading ? 'Loading…' : 'No records match the current filters'} />}
        ListFooterComponent={loading && rows.length ? <ActivityIndicator style={{ marginVertical: spacing(2) }} color={colors.primary} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing(2), paddingBottom: 0 },
  exportRow: { flexDirection: 'row', gap: spacing(1), marginBottom: spacing(1) },
  exportBtn: { flex: 1, paddingVertical: spacing(1.1) },
  listContent: { paddingHorizontal: spacing(2), paddingBottom: spacing(5) },
});
