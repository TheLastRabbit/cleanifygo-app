import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/lib/auth'
import type { MarketplaceRole } from '@/types/marketplace'
import { BrandLogo } from '@/components/BrandLogo'

export default function RegisterScreen() {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<MarketplaceRole>('customer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) return
    setLoading(true)
    setError(null)
    try {
      await signUp({ name: name.trim(), email: email.trim().toLowerCase(), password, role })
      router.replace('/(tabs)/jobs')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <BrandLogo size="lg" showTagline />
        </View>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join the CleanifyGo marketplace</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="#9ca3af"
          textContentType="name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          textContentType="newPassword"
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>I am a…</Text>
        <View style={styles.roleRow}>
          {(['customer', 'cleaner'] as MarketplaceRole[]).map((r) => (
            <Pressable
              key={r}
              style={[styles.roleButton, role === r && styles.roleButtonActive]}
              onPress={() => setRole(r)}
            >
              <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                {r === 'customer' ? 'Customer' : 'Cleaner'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>
            Already have an account? <Text style={styles.linkBold}>Sign in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  logoWrap: {
    marginBottom: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  roleButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  roleTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  button: {
    height: 50,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
  },
  linkBold: {
    color: '#2563eb',
    fontWeight: '600',
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
})
