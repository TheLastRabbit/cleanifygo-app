export type MarketplaceRole = 'customer' | 'cleaner' | 'admin'
export type MarketplaceCleanerSubscriptionStatus = 'inactive' | 'trialing' | 'active' | 'past_due' | 'cancelled'

export type MarketplaceJobStatus = 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled'
export type MarketplacePaymentStatus = 'pending' | 'requires_payment_method' | 'paid' | 'failed' | 'refunded'
export type MarketplacePayoutStatus = 'pending' | 'held' | 'released'

export interface MarketplaceJob {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  address: string
  serviceType: string
  preferredDate: string
  preferredTime: string
  notes: string
  status: MarketplaceJobStatus
  paymentStatus?: MarketplacePaymentStatus
  payoutStatus?: MarketplacePayoutStatus
  amountTotal?: number
  currency?: string
  paymentIntentId?: string
  checkoutSessionId?: string
  cancellationReason?: string
  assignedAt?: string
  completedAt?: string
  assignedCleanerId?: string
  assignedCleanerName?: string
  createdAt: string
  updatedAt: string
}

export interface MarketplaceMetrics {
  total: number
  open: number
  assigned: number
  inProgress: number
  completed: number
  cancelled: number
  completionRate: number
  avgAssignmentMinutes: number
  cancellationReasons: Record<string, number>
  totalCleaners: number
  trainingPurchases: number
  trainingRevenueEur: number
  trainingConversionRate: number
  trainingPurchasesLast30Days: number
}

export interface MarketplaceAuditLog {
  id: string
  actorId: string
  actorRole: string
  actorEmail: string
  eventType: string
  ip: string
  details: Record<string, unknown>
  createdAt: string
}

export interface MarketplaceSecurityMetrics {
  failedLogins: number
  blockedLogins: number
  failedRefreshes: number
  successfulRefreshes: number
  securityEventsLast24h: number
  recent: MarketplaceAuditLog[]
}

export interface MarketplaceAuthUser {
  id: string
  name: string
  email: string
  role: MarketplaceRole
  provider?: 'password' | 'google' | 'apple'
  authProviders?: Array<'password' | 'google' | 'apple'>
  bio?: string | null
  location?: string | null
  photoUrl?: string | null
  languages?: Array<{ language: string; level: 'native' | 'fluent' | 'conversational' | 'beginner' }>
  specialties?: string[]
  hourlyRate?: number | null
  subscriptionPlan?: string
  subscriptionStatus?: MarketplaceCleanerSubscriptionStatus
  subscriptionTrialEndsAt?: string | null
  subscriptionExpiresAt?: string | null
  isSubscriptionActive?: boolean
  hasCleanerTrainingAccess?: boolean
  cleanerTrainingPurchasedAt?: string | null
}

export interface MarketplaceAuthSession {
  token: string
  accessToken: string
  refreshToken: string
  expiresIn?: string
  user: MarketplaceAuthUser
}

export interface MarketplaceLoginInput {
  email: string
  password: string
}

export interface MarketplaceRegisterInput {
  name: string
  email: string
  password: string
  role?: 'customer' | 'cleaner'
}

export interface MarketplaceProfileUpdateInput {
  name?: string
  bio?: string
  location?: string
  photoUrl?: string
  languages?: Array<{ language: string; level: 'native' | 'fluent' | 'conversational' | 'beginner' }>
  specialties?: string[]
  hourlyRate?: number
  password?: string
}

export interface CreateMarketplaceJobInput {
  customerName: string
  customerEmail: string
  address: string
  serviceType: string
  preferredDate: string
  preferredTime: string
  notes: string
  amountTotal?: number
  currency?: string
}

export interface MarketplaceCheckoutSession {
  checkoutSessionId: string
  url: string
}

export interface MarketplacePublicCleanerProfile {
  id: string
  name: string
  email: string
  location: string
  hourlyRate: number
  availability: 'today' | 'this-week' | 'flexible'
  rating: number
  reviews: number
  completedJobs: number
  bio: string
  badges: string[]
  languages?: Array<{ language: string; level: 'native' | 'fluent' | 'conversational' | 'beginner' }>
  photoUrl?: string | null
}

// ─── Messaging types ────────────────────────────────────────────────────────

export type MarketplaceConversationStatus = 'active' | 'archived'
export type MarketplaceMessageType = 'text' | 'image' | 'system'

export interface MarketplaceConversation {
  conversationId: string
  participants: [string, string]
  participantNames: Record<string, string>
  participantPhotos: Record<string, string | null>
  jobId?: string | null
  lastMessagePreview: string
  lastMessageAt: string
  unreadCount: Record<string, number>
  status: MarketplaceConversationStatus
  createdAt: string
  updatedAt: string
}

export interface MarketplaceMessage {
  conversationId: string
  messageId: string
  sk: string
  senderEmail: string
  senderName: string
  senderRole: MarketplaceRole
  content: string
  type: MarketplaceMessageType
  readAt?: string | null
  createdAt: string
}

export interface MarketplaceMessagePage {
  messages: MarketplaceMessage[]
  hasMore: boolean
}
