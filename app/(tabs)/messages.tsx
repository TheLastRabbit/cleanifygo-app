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
import { router } from 'expo-router'
import { useAuth } from '@/lib/auth'
import { fetchConversations } from '@/lib/api'
import type { MarketplaceConversation } from '@/types/marketplace'

function ConversationRow({
  conversation,
  userId,
  onPress,
}: {
  conversation: MarketplaceConversation
  userId: string
  onPress: () => void
}) {
  const otherUserId = conversation.participants.find((p) => p !== userId) ?? ''
  const otherName = conversation.participantNames[otherUserId] ?? 'Unknown'
  const unread = conversation.unreadCount[userId] ?? 0

  const lastAt = new Date(conversation.lastMessageAt).toLocaleDateString('en-NL', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarLetter}>{otherName.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowHeader}>
          <Text style={styles.name}>{otherName}</Text>
          <Text style={styles.time}>{lastAt}</Text>
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {conversation.lastMessagePreview || 'No messages yet'}
        </Text>
      </View>
      {unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{unread}</Text>
        </View>
      )}
    </Pressable>
  )
}

export default function MessagesScreen() {
  const { session, updateSession } = useAuth()
  const [conversations, setConversations] = useState<MarketplaceConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!session) return
    try {
      const { conversations: c, session: s } = await fetchConversations(session)
      setConversations(c)
      updateSession(s)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages.')
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
      data={conversations}
      keyExtractor={(c) => c.conversationId}
      renderItem={({ item }) => (
        <ConversationRow
          conversation={item}
          userId={session?.user.id ?? ''}
          onPress={() =>
            router.push({
              pathname: '/conversation/[id]',
              params: { id: item.conversationId },
            })
          }
        />
      )}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyText}>{error ?? 'No conversations yet.'}</Text>
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { color: '#94a3b8', fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: '#2563eb' },
  rowContent: { flex: 1 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  name: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  time: { fontSize: 12, color: '#94a3b8' },
  preview: { fontSize: 13, color: '#64748b' },
  separator: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 74 },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadCount: { fontSize: 11, fontWeight: '700', color: '#fff' },
})
