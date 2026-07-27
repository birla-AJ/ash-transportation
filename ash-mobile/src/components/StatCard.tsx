import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

const COLOR_MAP: Record<string, string> = {
  primary: colors.primary,
  secondary: colors.secondary,
  success: colors.success,
  warning: colors.warning,
};

interface StatCardProps {
  label: string;
  value?: number | null;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
}

export default function StatCard({ label, value, color = 'primary' }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.badge, { backgroundColor: COLOR_MAP[color] || colors.primary }]} />
      <Text style={styles.value}>{value ?? '—'}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: spacing(2),
    marginBottom: spacing(1.5),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  badge: { width: 32, height: 6, borderRadius: 3, marginBottom: spacing(1) },
  value: { fontSize: 26, fontWeight: '700', color: colors.textPrimary },
  label: { fontSize: 12.5, color: colors.textSecondary, marginTop: 2 },
});
