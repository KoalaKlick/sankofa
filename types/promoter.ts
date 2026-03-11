/**
 * Promoter & Referral Types
 * Types related to the promoter/affiliate system
 */

import type {
  PromoterStatus,
  ReferralStatus,
  CommissionStatus,
  CommissionType,
  CurrencyCode
} from './enums';
import type { Profile } from './user';

// ===========================================
// PROMOTER
// ===========================================

export interface Promoter {
  id: string;
  user_id: string;

  // Identification
  referral_code: string;

  // Status & tier
  status: PromoterStatus;
  tier: number;
  commission_rate: number;

  // Statistics
  total_referrals: number;
  successful_referrals: number;
  total_earnings: number;
  pending_earnings: number;

  // Bank details
  phone_number: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;

  // Timestamps
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// ===========================================
// REFERRAL
// ===========================================

export interface Referral {
  id: string;
  promoter_id: string;
  referred_user_id: string | null;

  // Tracking
  referred_email: string | null;
  referral_code_used: string;

  // Status
  status: ReferralStatus;

  // Attribution
  source: string | null;
  campaign: string | null;
  landing_page: string | null;

  // Fraud prevention
  ip_address: string | null;
  user_agent: string | null;

  // Conversion tracking
  converted_at: string | null;
  first_purchase_at: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ===========================================
// COMMISSION
// ===========================================

export interface Commission {
  id: string;
  promoter_id: string;
  referral_id: string | null;

  // Details
  type: CommissionType;
  status: CommissionStatus;

  // Money
  amount: number;
  currency: CurrencyCode;

  // Source
  source_type: string | null;
  source_id: string | null;

  // Calculation
  base_amount: number | null;
  commission_rate: number | null;

  // Description
  description: string | null;

  // Processing
  processed_at: string | null;
  paid_at: string | null;
  payment_reference: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ===========================================
// PROMOTER TIER
// ===========================================

export interface PromoterTier {
  id: string;
  tier_level: number;
  name: string;

  // Requirements
  min_referrals: number;
  min_earnings: number;

  // Benefits
  commission_rate: number;
  bonus_rate: number;

  // Info
  description: string | null;
  perks: Record<string, unknown> | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ===========================================
// INSERT TYPES
// ===========================================

export type PromoterInsert = Omit<Promoter,
  | 'id'
  | 'referral_code'
  | 'total_referrals'
  | 'successful_referrals'
  | 'total_earnings'
  | 'pending_earnings'
  | 'approved_at'
  | 'created_at'
  | 'updated_at'
> & {
  id?: string;
  referral_code?: string;
  total_referrals?: number;
  successful_referrals?: number;
  total_earnings?: number;
  pending_earnings?: number;
  approved_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type ReferralInsert = Omit<Referral, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type CommissionInsert = Omit<Commission, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

// ===========================================
// UPDATE TYPES
// ===========================================

export type PromoterUpdate = Partial<Omit<Promoter, 'id' | 'created_at' | 'referral_code'>>;
export type ReferralUpdate = Partial<Omit<Referral, 'id' | 'created_at'>>;
export type CommissionUpdate = Partial<Omit<Commission, 'id' | 'created_at'>>;

// ===========================================
// EXTENDED/JOINED TYPES
// ===========================================

export interface PromoterWithProfile extends Promoter {
  profile: Profile;
}

export interface PromoterWithTier extends Promoter {
  tier_info: PromoterTier;
}

export interface ReferralWithDetails extends Referral {
  promoter: Promoter;
  referred_user: Profile | null;
}

export interface CommissionWithDetails extends Commission {
  promoter: Promoter;
  referral: Referral | null;
}

// ===========================================
// HELPER TYPES
// ===========================================

export interface PromoterStats {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  conversion_rate: number;
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  this_month_referrals: number;
  this_month_earnings: number;
}

export interface ReferralLink {
  code: string;
  url: string;
  short_url?: string;
}

export interface PromoterDashboard {
  promoter: Promoter;
  stats: PromoterStats;
  recent_referrals: Referral[];
  recent_commissions: Commission[];
  tier: PromoterTier;
  next_tier: PromoterTier | null;
}
