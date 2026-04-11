import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native'
import { useAuth } from '@/lib/auth'
import { router } from 'expo-router'

export default function ProfileScreen() {
  const { session, signOut } = useAuth()
  const user = session?.user

  const handleSignOut = async () => {
    await signOut()
    router.replace('/(auth)/login')
  }

  const roleLabel = user?.role === 'cleaner' ? 'Cleaner' : user?.role === 'admin' ? 'Admin' : 'Customer'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>
            {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name ?? '—'}</Text>
        <Text style={styles.email}>{user?.email ?? '—'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{roleLabel}</Text>
        </View>
      </View>

      {/* Info rows */}
      <View style={styles.section}>
        <InfoRow label="Account type" value={roleLabel} />
        {user?.location ? <InfoRow label="Location" value={user.location} /> : null}
        {user?.hourlyRate != null ? (
          <InfoRow label="Hourly rate" value={`€${user.hourlyRate}/hr`} />
        ) : null}
        {user?.subscriptionStatus ? (
          <InfoRow label="Subscription" value={user.subscriptionStatus} />
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Pressable style={styles.actionRow} onPress={() => {/* TODO: edit profile screen */}}>
          <Text style={styles.actionText}>Edit Profile</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        {user?.role === 'cleaner' && (
          <Pressable style={styles.actionRow} onPress={() => {/* TODO: subscription screen */}}>
            <Text style={styles.actionText}>Manage Subscription</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
      </View>

      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 24, paddingBottom: 60 },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLetter: { fontSize: 36, fontWeight: '700', color: '#2563eb' },
  name: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  email: { fontSize: 14, color: '#64748b', marginBottom: 8 },
  roleBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: { fontSize: 14, color: '#64748b' },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#0f172a' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  actionText: { fontSize: 15, color: '#0f172a' },
  chevron: { fontSize: 20, color: '#94a3b8' },
  signOutButton: {
    marginTop: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutText: { color: '#dc2626', fontWeight: '600', fontSize: 15 },
})
