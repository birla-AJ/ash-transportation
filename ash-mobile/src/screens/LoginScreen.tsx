import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Field, PrimaryButton, Banner, Card } from '../components/UI';
import { colors, spacing, typography } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      await login({ email: email.trim(), password, rememberMe });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandIcon}>🚚</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>Ash Transportation</Text>
            <Text style={styles.brandSubtitle}>Management System</Text>
          </View>
        </View>

        <Card style={{ width: '100%' }}>
          {error ? <Banner severity="error">{error}</Banner> : null}

          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="••••••••"
          />
          <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
            <Text style={styles.toggleText}>{showPassword ? 'Hide password' : 'Show password'}</Text>
          </TouchableOpacity>

          <View style={styles.rememberRow}>
            <Switch value={rememberMe} onValueChange={setRememberMe} trackColor={{ true: colors.secondary }} />
            <Text style={styles.rememberText}>Remember me</Text>
          </View>

          <PrimaryButton
            title={loading ? 'Signing in…' : 'Sign In'}
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: spacing(1) }}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primaryDark },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(3),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    marginBottom: spacing(3),
  },
  brandBadge: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    padding: spacing(1.2),
  },
  brandIcon: { fontSize: 22 },
  brandTitle: { ...typography.h2, color: colors.white },
  brandSubtitle: { ...typography.caption, color: '#C7D2D6' },
  toggleText: { color: colors.secondaryDark, fontSize: 13, fontWeight: '600', marginBottom: spacing(1.5) },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1), marginBottom: spacing(2) },
  rememberText: { ...typography.body },
});
