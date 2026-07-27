import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { colors, radius, spacing } from '../theme/theme';
import { Challan } from '../types';

export default function ChallanCard({ challan, onPress }: { challan: Challan; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <Text style={styles.challanNumber}>{challan.challanNumber}</Text>
        <Text style={styles.date}>
          {dayjs(challan.challanDate).format('DD MMM YYYY')} · {challan.challanTime}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.truck}>{challan.truckNumber}</Text>
        <Text style={styles.arrow}>→</Text>
        <Text style={styles.place} numberOfLines={1}>
          {challan.placeOfDelivery}
        </Text>
      </View>
      {challan.printCount > 0 ? <Text style={styles.printInfo}>Printed {challan.printCount}×</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    padding: spacing(1.75),
    marginBottom: spacing(1.25),
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  challanNumber: { fontWeight: '700', fontSize: 15, color: colors.primary },
  date: { fontSize: 12, color: colors.textSecondary },
  truck: { fontWeight: '600', fontSize: 14, color: colors.textPrimary },
  arrow: { marginHorizontal: 6, color: colors.textSecondary },
  place: { fontSize: 14, color: colors.textSecondary, flexShrink: 1 },
  printInfo: { fontSize: 11, color: colors.secondaryDark, marginTop: 4, fontWeight: '600' },
});
