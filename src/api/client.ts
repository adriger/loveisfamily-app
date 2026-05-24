import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
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
    getSuggestions: call<{ limit?: number }, MatchSuggestion[]>('getMatchingSuggestions'),

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
