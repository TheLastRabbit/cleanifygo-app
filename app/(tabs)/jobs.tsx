import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useAuth } from '@/lib/auth'
import { claimJob, fetchJobs } from '@/lib/api'
import type { MarketplaceJob } from '@/types/marketplace'
import { BrandLogo } from '@/components/BrandLogo'

const STATUS_COLOR: Record<string, string> = {
  open: '#16a34a',
  assigned: '#2563eb',
  'in-progress': '#d97706',
  completed: '#64748b',
  cancelled: '#dc2626',
}

function JobCard({
  job,
  role,
  onClaim,
}: {
  job: MarketplaceJob
  role: string
  onClaim: (id: string) => void
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.serviceType}>{job.serviceType}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLOR[job.status] + '20' }]}>
          <Text style={[styles.badgeText, { color: STATUS_COLOR[job.status] }]}>{job.status}</Text>
        </View>
      </View>
      <Text style={styles.address}>{job.address}</Text>
      <Text style={styles.date}>
        {job.preferredDate} · {job.preferredTime}
      </Text>
      {job.notes ? <Text style={styles.notes} numberOfLines={2}>{job.notes}</Text> : null}
      {role === 'cleaner' && job.status === 'open' && (
        <Pressable style={styles.claimButton} onPress={() => onClaim(job.id)}>
          <Text style={styles.claimButtonText}>Claim Job</Text>
        </Pressable>
      )}
    </View>
  )
}

export default function JobsScreen() {
  const { session, updateSession } = useAuth()
  const [jobs, setJobs] = useState<MarketplaceJob[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!session) return
    try {
      const { jobs: j, session: s } = await fetchJobs(session)
      setJobs(j)
      updateSession(s)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs.')
    }
  }, [session, updateSession])

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [load])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  const handleClaim = useCallback(async (jobId: string) => {
    if (!session) return
    try {
      const { job, session: s } = await claimJob(session, jobId)
      updateSession(s)
      setJobs((prev) => prev.map((j) => (j.id === job.id ? job : j)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim job.')
    }
  }, [session, updateSession])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={jobs}
      ListHeaderComponent={
        <View style={styles.logoWrap}>
          <BrandLogo size="md" showTagline />
        </View>
      }
      keyExtractor={(j) => j.id}
      renderItem={({ item }) => (
        <JobCard
          job={item}
          role={session?.user.role ?? 'customer'}
          onClaim={handleClaim}
        />
      )}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyText}>{error ?? 'No jobs found.'}</Text>
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: '#f8fafc' },
  listContent: { padding: 16, gap: 12 },
  logoWrap: {
    marginBottom: 6,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { color: '#94a3b8', fontSize: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceType: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  address: { fontSize: 13, color: '#475569', marginBottom: 4 },
  date: { fontSize: 12, color: '#94a3b8', marginBottom: 6 },
  notes: { fontSize: 13, color: '#64748b', fontStyle: 'italic', marginBottom: 10 },
  claimButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  claimButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
})
