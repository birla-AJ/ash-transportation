import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import dayjs from 'dayjs';
import { colors, spacing, typography } from '../theme/theme';
import { ScreenTitle, Card, Chip, EmptyState, TextButton } from '../components/UI';
import { listAuditLogs } from '../api/auditLogsApi';
import { AuditLog } from '../types';

const ACTION_TONE: Record<string, 'success' | 'info' | 'error' | 'default'> = {
  CHALLAN_CREATE: 'success',
  CHALLAN_UPDATE: 'info',
  CHALLAN_DELETE: 'error',
  CHALLAN_REPRINT: 'default',
  USER_LOGIN: 'default',
  USER_LOGOUT: 'default',
};

const LIMIT = 20;

export default function AuditLogsScreen() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (targetPage: number, replace: boolean) => {
    if (targetPage === 1) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await listAuditLogs({ page: targetPage, limit: LIMIT });
      setRows((prev) => (replace ? result.items : [...prev, ...result.items]));
      setPage(result.meta.page);
      setTotalPages(result.meta.totalPages);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(1, true);
  }, [load]);

  function loadMore() {
    if (loading || refreshing || page >= totalPages) return;
    load(page + 1, false);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <ScreenTitle>Audit Logs</ScreenTitle>
      </View>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <View style={styles.rowTop}>
              <Chip label={item.action} tone={ACTION_TONE[item.action] || 'default'} />
              <Text style={typography.caption}>{dayjs(item.createdAt).format('DD MMM YYYY, h:mm A')}</Text>
            </View>
            <Text style={typography.bodyBold}>{item.entityType}</Text>
            <Text style={typography.caption}>By {item.performedByUser?.name || '—'}</Text>
            {item.reason ? <Text style={typography.body}>{item.reason}</Text> : null}
          </Card>
        )}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        refreshing={refreshing}
        onRefresh={() => load(1, true)}
        ListEmptyComponent={<EmptyState text={refreshing ? 'Loading…' : 'No audit logs yet'} />}
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: spacing(2) }} color={colors.primary} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing(2), paddingBottom: 0 },
  listContent: { padding: spacing(2), gap: spacing(1.25) },
  row: { marginBottom: spacing(1.25), gap: 4 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
});
