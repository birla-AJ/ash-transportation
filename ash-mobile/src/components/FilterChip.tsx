import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

export default function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.9),
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.paper,
    marginRight: spacing(1),
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  textActive: { color: colors.white },
});
