import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ScreenTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.titleRow}>
      <Text style={typography.h2}>{children}</Text>
      {right}
    </View>
  );
}

interface FieldProps extends TextInputProps {
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function Field({ label, style, ...props }: FieldProps) {
  return (
    <View style={[{ marginBottom: spacing(2) }, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput style={styles.input} placeholderTextColor={colors.textSecondary} {...props} />
    </View>
  );
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: ReactNode;
  color?: string;
}

export function PrimaryButton({ title, onPress, loading, disabled, style, icon }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.btnPrimary, (disabled || loading) && styles.btnDisabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <View style={styles.btnContent}>
          {icon}
          <Text style={styles.btnPrimaryText}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function OutlineButton({ title, onPress, loading, disabled, style, color }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.btnOutline, color ? { borderColor: color } : null, disabled ? styles.btnDisabled : null, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color={color || colors.primary} />
      ) : (
        <Text style={[styles.btnOutlineText, color ? { color } : null]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function TextButton({
  title,
  onPress,
  disabled,
  color,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={styles.btnText}>
      <Text style={[styles.btnTextText, color ? { color } : null]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Chip({ label, tone = 'default' }: { label: string; tone?: 'default' | 'success' | 'error' | 'warning' | 'info' }) {
  const toneStyles =
    {
      default: { bg: colors.divider, fg: colors.textSecondary },
      success: { bg: colors.successBg, fg: colors.success },
      error: { bg: colors.errorBg, fg: colors.error },
      warning: { bg: colors.warningBg, fg: colors.warning },
      info: { bg: colors.infoBg, fg: colors.info },
    }[tone] || { bg: colors.divider, fg: colors.textSecondary };

  return (
    <View style={[styles.chip, { backgroundColor: toneStyles.bg }]}>
      <Text style={[styles.chipText, { color: toneStyles.fg }]}>{label}</Text>
    </View>
  );
}

export function Banner({
  severity = 'info',
  children,
  onClose,
}: {
  severity?: 'info' | 'success' | 'error' | 'warning';
  children: ReactNode;
  onClose?: () => void;
}) {
  const map = {
    info: { bg: colors.infoBg, fg: colors.info },
    success: { bg: colors.successBg, fg: colors.success },
    error: { bg: colors.errorBg, fg: colors.error },
    warning: { bg: colors.warningBg, fg: colors.warning },
  };
  const tone = map[severity] || map.info;
  return (
    <View style={[styles.banner, { backgroundColor: tone.bg }]}>
      <Text style={[styles.bannerText, { color: tone.fg }]}>{children}</Text>
      {onClose ? (
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.bannerClose, { color: tone.fg }]}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={{ color: colors.textSecondary }}>{text}</Text>
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: spacing(2.5),
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(2.5),
  },
  label: {
    ...typography.caption,
    marginBottom: spacing(0.5),
    fontWeight: '600',
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.md,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1.3),
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing(1.6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: { color: colors.white, fontWeight: '600', fontSize: 15 },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing(1.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  btnDisabled: { opacity: 0.5 },
  btnText: { paddingVertical: spacing(1), alignItems: 'center' },
  btnTextText: { color: colors.textSecondary, fontWeight: '600' },
  chip: {
    paddingHorizontal: spacing(1.2),
    paddingVertical: spacing(0.4),
    borderRadius: radius.xl,
    alignSelf: 'flex-start',
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  banner: {
    borderRadius: radius.md,
    padding: spacing(1.5),
    marginBottom: spacing(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: { flex: 1, fontSize: 13.5, fontWeight: '500' },
  bannerClose: { fontSize: 16, marginLeft: spacing(1), fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing(6) },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.divider, marginVertical: spacing(2) },
});
