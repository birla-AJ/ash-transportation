import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, CompositeNavigationProp, NavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, spacing } from '../theme/theme';
import { Field, ScreenTitle, EmptyState } from '../components/UI';
import FilterChip from '../components/FilterChip';
import ChallanCard from '../components/ChallanCard';
import { listChallans } from '../api/challansApi';
import { Challan, DurationFilter } from '../types';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Challans'>,
  NavigationProp<RootStackParamList>
>;

const DURATIONS: { value: DurationFilter; label: string }[] = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

const PAGE_SIZE = 20;

export default function ChallansListScreen({ navigation }: { navigation: Nav }) {
  const [search, setSearch] = useState('');
  const [duration, setDuration] = useState<DurationFilter>('');
  const [items, setItems] = useState<Challan[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (targetPage: number, replace: boolean) => {
      if (targetPage === 1) setRefreshing(true);
      else setLoading(true);
      try {
        const result = await listChallans({
          page: targetPage,
          limit: PAGE_SIZE,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          search: search || undefined,
          duration: duration || undefined,
        });
        setItems((prev) => (replace ? result.items : [...prev, ...result.items]));
        setPage(result.meta.page);
        setTotalPages(result.meta.totalPages);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, duration],
  );

  useEffect(() => {
    load(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, duration]);

  useFocusEffect(
    useCallback(() => {
      load(1, true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  function loadMore() {
    if (loading || refreshing || page >= totalPages) return;
    load(page + 1, false);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <ScreenTitle>Challans</ScreenTitle>
        <Field
          placeholder="Search truck no., place, challan no."
          value={search}
          onChangeText={setSearch}
          style={{ marginBottom: spacing(1.5) }}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing(1) }}>
          {DURATIONS.map((d) => (
            <FilterChip key={d.value || 'all'} label={d.label} active={duration === d.value} onPress={() => setDuration(d.value)} />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ChallanCard challan={item} onPress={() => navigation.navigate('ChallanDetail', { challanId: item.id })} />
        )}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        refreshing={refreshing}
        onRefresh={() => load(1, true)}
        ListEmptyComponent={<EmptyState text={refreshing ? 'Loading…' : 'No challans found'} />}
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: spacing(2) }} color={colors.primary} /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing(2), paddingBottom: 0 },
  listContent: { paddingHorizontal: spacing(2), paddingBottom: spacing(5) },
});
