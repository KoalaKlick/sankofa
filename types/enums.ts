/**
 * Database Enums
 * All enum types matching the database schema
 */

// ===========================================
// ORGANIZATION & USERS
// ===========================================

export type OrganizationRole = 'owner' | 'admin' | 'member';

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

// ===========================================
// EVENTS
// ===========================================

export type EventType = 'voting' | 'ticketed' | 'advertisement' | 'hybrid';

export type EventStatus = 'draft' | 'published' | 'ongoing' | 'ended' | 'cancelled';

// ===========================================
// TICKETS
// ===========================================

export type TicketStatus = 'available' | 'sold_out' | 'hidden' | 'expired';

export type OrderStatus = 'pending' | 'paid' | 'confirmed' | 'cancelled' | 'refunded';

export type TicketCheckInStatus = 'not_checked_in' | 'checked_in' | 'cancelled';

// ===========================================
// PROMOTERS & REFERRALS
// ===========================================

export type PromoterStatus = 'pending' | 'active' | 'suspended' | 'inactive';

export type ReferralStatus = 'pending' | 'verified' | 'converted' | 'expired' | 'invalid';

export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'rejected' | 'cancelled';

export type CommissionType =
  | 'signup'           // Bonus for referred user signup
  | 'ticket_purchase'  // Commission on ticket sales
  | 'vote_purchase'    // Commission on vote purchases
  | 'subscription'     // Recurring subscription commissions
  | 'bonus';           // Special bonuses

// ===========================================
// PAYMENTS & WALLET
// ===========================================

export type CurrencyCode = 'NGN' | 'USD' | 'GHS' | 'KES' | 'ZAR' | 'GBP' | 'EUR';

export type PaymentProvider =
  | 'paystack'
  | 'flutterwave'
  | 'stripe'
  | 'bank_transfer'
  | 'wallet'
  | 'cash'
  | 'free';

export type TransactionType = 'credit' | 'debit';

export type TransactionCategory =
  | 'ticket_purchase'
  | 'vote_purchase'
  | 'subscription'
  | 'refund'
  | 'commission_payout'
  | 'wallet_topup'
  | 'wallet_withdrawal'
  | 'transfer'
  | 'fee'
  | 'bonus'
  | 'adjustment';

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'reversed';

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
