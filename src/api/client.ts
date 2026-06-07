import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../config/firebase';
import type {
  User, UpdateProfilePayload,
  MatchSuggestion, Match, MatchType,
  Conversation, Message,
  Post, ActivityType, PostVisibility, Comment,
  Team, TeamPrivacy,
  SubscriptionLimits, SubscriptionTier,
} from '../config/types';

function call<TData, TResult>(name: string) {
  const fn = httpsCallable<TData, TResult>(functions, name);
  return async (data: TData): Promise<TResult> => {
    // Forzar refresh del token antes de llamadas autenticadas
    // Evita el error "unauthenticated" justo después del login
    if (auth.currentUser) {
      await auth.currentUser.getIdToken(false);
    }
    const result = await fn(data);
    return result.data;
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    createUser: call<
      { email: string; password: string; username: string },
      { uid: string; email: string; username: string }
    >('createUser'),

    updateProfile: call<UpdateProfilePayload, void>('updateUserProfile'),

    deleteAccount: call<Record<string, never>, void>('deleteUserAccount'),

    sendVerificationCode: call<Record<string, never>, { success: boolean; code?: string }>('sendVerificationCode'),

    verifyEmailCode: call<{ code: string }, { success: boolean }>('verifyEmailCode'),
  },

  // ── Matching ────────────────────────────────────────────────────────────────

  matching: {
    getSuggestions: call<{ limit?: number; radius_km?: number }, MatchSuggestion[]>('getMatchingSuggestions'),

    createMatch: call<
      { targetUserId: string; matchType?: MatchType },
      { matchId: string }
    >('createMatch'),

    respond: call<
      { matchId: string; response: 'accept' | 'reject' },
      { status: string; conversationId?: string }
    >('respondToMatch'),

    getHistory: call<
      { limit?: number; startAfter?: string },
      { matches: Match[]; nextCursor: string | null }
    >('getMatchHistory'),
  },

  // ── Messaging ───────────────────────────────────────────────────────────────

  messaging: {
    sendMessage: call<
      { conversationId: string; text: string; attachments?: object[] },
      { messageId: string }
    >('sendMessage'),

    getConversations: call<Record<string, never>, Conversation[]>('getConversations'),

    getMessages: call<
      { conversationId: string; limit?: number; startAfter?: string },
      { messages: Message[]; nextCursor: string | null }
    >('getMessages'),

    markAsRead: call<{ conversationId: string }, void>('markAsRead'),

    deleteMessage: call<
      { messageId: string; conversationId: string },
      void
    >('deleteMessage'),
  },

  // ── Community ───────────────────────────────────────────────────────────────

  community: {
    createPost: call<
      {
        title: string;
        description: string;
        activityType: ActivityType;
        tags?: string[];
        images?: string[];
        visibility?: PostVisibility;
        location?: object;
      },
      { postId: string }
    >('createPost'),

    likePost: call<{ postId: string }, void>('likePost'),

    comment: call<{ postId: string; text: string }, { commentId: string }>('commentOnPost'),

    getFeed: call<
      { filters?: { activityType?: ActivityType }; limit?: number; startAfter?: string },
      { posts: Post[]; nextCursor: string | null }
    >('getPostFeed'),

    deletePost: call<{ postId: string }, void>('deletePost'),

    getComments: call<
      { postId: string; limit?: number; startAfter?: string },
      { comments: Comment[]; nextCursor: string | null }
    >('getPostComments'),
  },

  // ── Teams ───────────────────────────────────────────────────────────────────

  teams: {
    create: call<
      { name: string; description: string; privacyType?: TeamPrivacy },
      { teamId: string }
    >('createTeam'),

    invite: call<{ teamId: string; invitedUserId: string }, { inviteId: string }>('inviteToTeam'),

    acceptInvite: call<
      { teamId: string; inviteId: string },
      void
    >('acceptTeamInvite'),

    addActivity: call<{ teamId: string; activityIds: string[] }, void>('addActivityToTeam'),

    getDetails: call<{ teamId: string }, Team>('getTeamDetails'),

    list: call<
      { limit?: number; startAfter?: string; search?: string },
      { teams: Team[]; nextCursor: string | null }
    >('listTeams'),

    join: call<{ teamId: string }, void>('joinTeam'),
  },

  // ── Verification ────────────────────────────────────────────────────────────

  verification: {
    submit: call<{ documentPhotoURL: string }, { status: string }>('submitProfileVerification'),

    getStatus: call<Record<string, never>, { status: string; submittedAt?: string; rejectionReason?: string | null }>('getVerificationStatus'),
  },

  // ── Freemium ────────────────────────────────────────────────────────────────

  freemium: {
    checkLimits: call<{ feature: string }, SubscriptionLimits>('checkSubscriptionLimits'),

    upgrade: call<
      { tier: SubscriptionTier; paymentId: string },
      void
    >('upgradeSubscription'),
  },

  // ── Notifications ───────────────────────────────────────────────────────────

  notifications: {
    registerToken: call<{ token: string; platform: string }, { success: boolean }>('registerPushToken'),
  },
};
