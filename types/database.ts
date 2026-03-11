/**
 * Database Types for Supabase
 * Main database interface that aggregates all table types
 */

// Re-export all types from domain files for backwards compatibility
export * from './enums';
export * from './user';
export * from './organization';
export * from './event';
export * from './ticket';
export * from './promoter';
export * from './payment';

// Import types for Database interface
import type {
  OrganizationRole,
  InvitationStatus,
  EventType,
  EventStatus,
  TicketStatus,
  OrderStatus,
  TicketCheckInStatus,
  PromoterStatus,
  ReferralStatus,
  CommissionStatus,
  CommissionType,
  CurrencyCode,
  PaymentProvider,
  TransactionType,
  TransactionCategory,
  TransactionStatus,
  PayoutStatus,
} from './enums';

import type {
  Profile,
  ProfileInsert,
  ProfileUpdate,
} from './user';

import type {
  Organization,
  OrganizationInsert,
  OrganizationUpdate,
  OrganizationMember,
  OrganizationMemberInsert,
  OrganizationMemberUpdate,
  OrganizationInvitation,
  OrganizationInvitationInsert,
  OrganizationInvitationUpdate,
} from './organization';

import type {
  Event,
  EventInsert,
  EventUpdate,
  VotingCategory,
  VotingCategoryInsert,
  VotingCategoryUpdate,
  VotingOption,
  VotingOptionInsert,
  VotingOptionUpdate,
  Vote,
  VoteInsert,
} from './event';

import type {
  TicketType,
  TicketTypeInsert,
  TicketTypeUpdate,
  TicketOrder,
  TicketOrderInsert,
  TicketOrderUpdate,
  Ticket,
  TicketInsert,
  TicketUpdate,
} from './ticket';

import type {
  Promoter,
  PromoterInsert,
  PromoterUpdate,
  Referral,
  ReferralInsert,
  ReferralUpdate,
  Commission,
  CommissionInsert,
  CommissionUpdate,
  PromoterTier,
} from './promoter';

import type {
  Wallet,
  WalletInsert,
  WalletUpdate,
  Transaction,
  TransactionInsert,
  TransactionUpdate,
  Payment,
  PaymentInsert,
  PaymentUpdate,
  Payout,
  PayoutInsert,
  PayoutUpdate,
  FeeConfiguration,
} from './payment';

// ===========================================
// SUPABASE DATABASE TYPE
// ===========================================

export interface Database {
  public: {
    Tables: {
      // User & Auth
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };

      // Organizations
      organizations: {
        Row: Organization;
        Insert: OrganizationInsert;
        Update: OrganizationUpdate;
      };
      organization_members: {
        Row: OrganizationMember;
        Insert: OrganizationMemberInsert;
        Update: OrganizationMemberUpdate;
      };
      organization_invitations: {
        Row: OrganizationInvitation;
        Insert: OrganizationInvitationInsert;
        Update: OrganizationInvitationUpdate;
      };

      // Events
      events: {
        Row: Event;
        Insert: EventInsert;
        Update: EventUpdate;
      };
      voting_categories: {
        Row: VotingCategory;
        Insert: VotingCategoryInsert;
        Update: VotingCategoryUpdate;
      };
      voting_options: {
        Row: VotingOption;
        Insert: VotingOptionInsert;
        Update: VotingOptionUpdate;
      };
      votes: {
        Row: Vote;
        Insert: VoteInsert;
        Update: never; // Votes shouldn't be updated
      };

      // Tickets
      ticket_types: {
        Row: TicketType;
        Insert: TicketTypeInsert;
        Update: TicketTypeUpdate;
      };
      ticket_orders: {
        Row: TicketOrder;
        Insert: TicketOrderInsert;
        Update: TicketOrderUpdate;
      };
      tickets: {
        Row: Ticket;
        Insert: TicketInsert;
        Update: TicketUpdate;
      };

      // Promoters & Referrals
      promoters: {
        Row: Promoter;
        Insert: PromoterInsert;
        Update: PromoterUpdate;
      };
      referrals: {
        Row: Referral;
        Insert: ReferralInsert;
        Update: ReferralUpdate;
      };
      commissions: {
        Row: Commission;
        Insert: CommissionInsert;
        Update: CommissionUpdate;
      };
      promoter_tiers: {
        Row: PromoterTier;
        Insert: Omit<PromoterTier, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PromoterTier, 'id' | 'created_at'>>;
      };

      // Payments & Wallet
      wallets: {
        Row: Wallet;
        Insert: WalletInsert;
        Update: WalletUpdate;
      };
      transactions: {
        Row: Transaction;
        Insert: TransactionInsert;
        Update: TransactionUpdate;
      };
      payments: {
        Row: Payment;
        Insert: PaymentInsert;
        Update: PaymentUpdate;
      };
      payouts: {
        Row: Payout;
        Insert: PayoutInsert;
        Update: PayoutUpdate;
      };
      fee_configurations: {
        Row: FeeConfiguration;
        Insert: Omit<FeeConfiguration, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FeeConfiguration, 'id' | 'created_at'>>;
      };
    };
    Enums: {
      // Organization & Users
      organization_role: OrganizationRole;
      invitation_status: InvitationStatus;

      // Events
      event_type: EventType;
      event_status: EventStatus;

      // Tickets
      ticket_status: TicketStatus;
      order_status: OrderStatus;
      ticket_check_in_status: TicketCheckInStatus;

      // Promoters
      promoter_status: PromoterStatus;
      referral_status: ReferralStatus;
      commission_status: CommissionStatus;
      commission_type: CommissionType;

      // Payments
      currency_code: CurrencyCode;
      payment_provider: PaymentProvider;
      transaction_type: TransactionType;
      transaction_category: TransactionCategory;
      transaction_status: TransactionStatus;
      payout_status: PayoutStatus;
    };
  };
}
