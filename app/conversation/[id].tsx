import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useAuth } from '@/lib/auth'
import { fetchMessages, sendMessage } from '@/lib/api'
import type { MarketplaceMessage } from '@/types/marketplace'

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()
  const { session, updateSession } = useAuth()
  const [messages, setMessages] = useState<MarketplaceMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  const load = useCallback(async () => {
    if (!session || !id) return
    const { page, session: s } = await fetchMessages(session, id)
    setMessages(page.messages)
    updateSession(s)
  }, [session, id, updateSession])

  useEffect(() => {
    load().finally(() => setLoading(false))
    navigation.setOptions({ title: 'Conversation' })
  }, [load, navigation])

  const handleSend = useCallback(async () => {
    if (!session || !id || !text.trim()) return
    setSending(true)
    try {
      const { message, session: s } = await sendMessage(session, id, text.trim())
      updateSession(s)
      setMessages((prev) => [...prev, message])
      setText('')
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    } finally {
      setSending(false)
    }
  }, [session, id, text, updateSession])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  const userId = session?.user.id ?? ''

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.messageId}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isMe = item.senderRole !== 'system' &&
            (item.senderEmail === session?.user.email || (session?.user.id === userId && item.senderName === session?.user.name))
          return (
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
              {!isMe && <Text style={styles.senderName}>{item.senderName}</Text>}
              <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{item.content}</Text>
              <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
                {new Date(item.createdAt).toLocaleTimeString('en-NL', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message…"
          placeholderTextColor="#9ca3af"
          value={text}
          onChangeText={setText}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <Pressable
          style={[styles.sendButton, (!text.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          <Text style={styles.sendButtonText}>{sending ? '…' : '↑'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messageList: { padding: 16, gap: 10 },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 2,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomLeftRadius: 4,
  },
  senderName: { fontSize: 11, fontWeight: '600', color: '#64748b', marginBottom: 3 },
  messageText: { fontSize: 15, color: '#0f172a' },
  messageTextMe: { color: '#fff' },
  messageTime: { fontSize: 10, color: '#94a3b8', marginTop: 4, textAlign: 'right' },
  messageTimeMe: { color: 'rgba(255,255,255,0.65)' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.4 },
  sendButtonText: { fontSize: 18, color: '#fff', fontWeight: '700' },
})
