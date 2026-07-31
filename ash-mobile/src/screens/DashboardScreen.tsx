import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, NavigationProp, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import dayjs from 'dayjs';
import { colors, spacing, typography } from '../theme/theme';
import { Card, ScreenTitle, PrimaryButton, EmptyState, Divider } from '../components/UI';
import StatCard from '../components/StatCard';
import { getDashboardStats } from '../api/challansApi';
import { DashboardStats } from '../types';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Dashboard'>,
  NavigationProp<RootStackParamList>
>;

export default function DashboardScreen({ navigation }: { navigation: Nav }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (e) {
      setStats((s) => s || {});
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        <ScreenTitle
          right={
            <PrimaryButton title="+ Add Challan" onPress={() => navigation.navigate('AddChallan')} style={styles.addBtn} />
          }>
          Dashboard
        </ScreenTitle>

        <View style={styles.statsGrid}>
          <StatCard label="Today's Trips" value={stats?.todayTrips} color="primary" />
          <StatCard label="Today's Challans" value={stats?.todayChallans} color="secondary" />
          <StatCard label="Monthly Trips" value={stats?.monthlyTrips} color="success" />
          <StatCard label="Yearly Trips" value={stats?.yearlyTrips} color="warning" />
        </View>

        <Card style={{ marginBottom: spacing(2) }}>
          <Text style={typography.h3}>Recent Challans</Text>
          <Divider />
          {stats?.recentChallans?.length ? (
            stats.recentChallans.map((c) => (
              <View key={c.id} style={styles.listRow}>
                <View style={{ flex: 1 }}>
                  <Text style={typography.bodyBold}>{c.challanNumber}</Text>
                  <Text style={typography.caption}>
                    {c.truckNumber} → {c.placeOfDelivery}
                  </Text>
                </View>
                <Text style={typography.caption}>{dayjs(c.challanDate).format('DD MMM')}</Text>
              </View>
            ))
          ) : (
            <EmptyState text={loading ? 'Loading…' : 'No recent challans'} />
          )}
        </Card>

        <Card>
          <Text style={typography.h3}>Latest Activity</Text>
          <Divider />
          {stats?.latestActivity?.length ? (
            stats.latestActivity.map((c) => (
              <View key={c.id} style={styles.listRow}>
                <View style={{ flex: 1 }}>
                  <Text style={typography.bodyBold}>{c.challanNumber}</Text>
                  <Text style={typography.caption}>
                    {c.truckNumber} → {c.placeOfDelivery}
                  </Text>
                </View>
                <Text style={typography.caption}>{dayjs(c.updatedAt).format('h:mm A')}</Text>
              </View>
            ))
          ) : (
            <EmptyState text={loading ? 'Loading…' : 'No recent activity'} />
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing(2), paddingBottom: spacing(5) },
  addBtn: { paddingHorizontal: spacing(1.75), paddingVertical: spacing(1) },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing(0.5),
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing(1),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
});
