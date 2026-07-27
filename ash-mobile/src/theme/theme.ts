// Deep steel-blue + warm amber palette, evoking heavy transport / freight
// operations — mirrors ash-website/src/theme/theme.js

export const colors = {
  primary: '#1B3A4B',
  primaryLight: '#2E5266',
  primaryDark: '#0F2530',
  secondary: '#C97B2E',
  secondaryLight: '#E0954E',
  secondaryDark: '#9A5D1F',
  background: '#F4F5F3',
  paper: '#FFFFFF',
  textPrimary: '#1C2427',
  textSecondary: '#5B6B72',
  success: '#2E7D32',
  successBg: '#EAF4EA',
  error: '#C62828',
  errorBg: '#FBEAEA',
  warning: '#C97B2E',
  warningBg: '#FBF1E4',
  info: '#2E5266',
  infoBg: '#EAF0F3',
  divider: '#E1E5E4',
  white: '#FFFFFF',
  disabled: '#B7C0C3',
} as const;

export const spacing = (n: number): number => n * 8;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.textPrimary },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, color: colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '400' as const, color: colors.textSecondary },
  button: { fontSize: 15, fontWeight: '600' as const },
};

export default { colors, spacing, radius, typography };
