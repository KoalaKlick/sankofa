/**
 * User & Profile Types
 * Types related to user profiles and authentication
 */

// ===========================================
// PROFILE
// ===========================================

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  referred_by: string | null;          // Promoter ID who referred this user
  referral_code_used: string | null;   // Code used during signup
  created_at: string;
  updated_at: string;
}

// ===========================================
// INSERT & UPDATE TYPES
// ===========================================

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;

// ===========================================
// EXTENDED TYPES
// ===========================================

export interface ProfileWithPromoter extends Profile {
  promoter?: {
    id: string;
    referral_code: string;
    status: string;
    tier: number;
  } | null;
}
