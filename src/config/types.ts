// ── Subscription ──────────────────────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'premium' | 'vip';

// ── User ──────────────────────────────────────────────────────────────────────

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  photoURL: string | null;
  bio: string;
  age: number | null;
  gender: string | null;
  interests: string[];
  location: UserLocation | null;
  subscription_type: SubscriptionTier;
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  age?: number;
  gender?: string;
  interests?: string[];
  location?: UserLocation;
  photoURL?: string;
}

// ── Match ─────────────────────────────────────────────────────────────────────

export type MatchStatus = 'pending' | 'accepted' | 'mutual_match' | 'rejected' | 'expired';
export type MatchType = 'instant' | 'algorithm';

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  compatibility_score: number;
  match_type: MatchType;
  status: MatchStatus;
  conversation_id?: string;
  created_at: string;
  expires_at: string;
}

export interface MatchSuggestion {
  user_id: string;
  username: string;
  displayName: string;
  age: number | null;
  interests: string[];
  photoURL: string | null;
  compatibility_score: number;
}

// ── Conversation & Message ────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_text: string | null;
  last_message_timestamp: string | null;
  unread_count_p1: number;
  unread_count_p2: number;
  is_archived: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  text: string;
  timestamp: string;
  is_read: boolean;
  is_edited: boolean;
  is_deleted: boolean;
  attachments: Attachment[];
}

export interface Attachment {
  type: 'image' | 'video' | 'file';
  url: string;
  size?: number;
}

// ── Post ──────────────────────────────────────────────────────────────────────

export type ActivityType = 'sports' | 'social' | 'hobby';
export type PostVisibility = 'public' | 'followers' | 'private';

export interface Post {
  id: string;
  author_id: string;
  title: string;
  description: string;
  images: string[];
  activity_type: ActivityType;
  tags: string[];
  likes_count: number;
  comments_count: number;
  location: { city?: string } | null;
  visibility: PostVisibility;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  author_id: string;
  text: string;
  timestamp: string;
  likes_count: number;
}

// ── Team ──────────────────────────────────────────────────────────────────────

export type TeamRole = 'owner' | 'admin' | 'member';
export type TeamPrivacy = 'public' | 'private';

export interface TeamMember {
  role: TeamRole;
  joined_at: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  members: Record<string, TeamMember>;
  member_count: number;
  activity_ids: string[];
  privacy_type: TeamPrivacy;
  created_at: string;
}

// ── Freemium ──────────────────────────────────────────────────────────────────

export interface SubscriptionLimits {
  allowed: boolean;
  remaining: number | typeof Infinity;
  error?: string;
}
