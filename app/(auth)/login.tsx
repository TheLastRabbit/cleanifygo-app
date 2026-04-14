import { useState } from 'react'
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/lib/auth'
import { BrandLogo } from '@/components/BrandLogo'

export default function LoginScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    if (!email.trim() || !password) return
    setLoading(true)
    setError(null)
    try {
      await signIn({ email: email.trim().toLowerCase(), password })
      router.replace('/(tabs)/jobs')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <View style={styles.logoWrap}>
          <BrandLogo size="lg" showTagline />
        </View>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {error && <Text style={styles.error}>{error}</Text>}

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
          textContentType="password"
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleLogin}
          returnKeyType="go"
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.link}>
            Don't have an account? <Text style={styles.linkBold}>Sign up</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoWrap: {
    marginBottom: 22,
  },
  title: {
    fontSize: 32,
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
  button: {
    height: 50,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
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
