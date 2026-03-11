/**
 * Payment & Wallet Types
 * Types related to payments, wallets, transactions, and payouts
 */

import type {
  CurrencyCode,
  PaymentProvider,
  TransactionType,
  TransactionCategory,
  TransactionStatus,
  PayoutStatus,
} from './enums';

// ===========================================
// WALLET
// ===========================================

export interface Wallet {
  id: string;
  user_id: string | null;
  organization_id: string | null;

  // Balance
  balance: number;
  currency: CurrencyCode;

  // Pending amounts
  pending_credits: number;
  pending_debits: number;

  // Lifetime stats
  total_credits: number;
  total_debits: number;

  // Status
  is_active: boolean;
  is_locked: boolean;
  lock_reason: string | null;

  // Timestamps
  last_transaction_at: string | null;
  created_at: string;
  updated_at: string;
}

// ===========================================
// TRANSACTION
// ===========================================

export interface Transaction {
  id: string;
  reference: string;
  wallet_id: string;

  // Classification
  type: TransactionType;
  category: TransactionCategory;
  status: TransactionStatus;

  // Money
  amount: number;
  currency: CurrencyCode;
  fee_amount: number;
  fee_breakdown: Record<string, number> | null;
  net_amount: number;

  // Balance tracking
  balance_before: number | null;
  balance_after: number | null;

  // Description
  description: string | null;
  notes: string | null;

  // Related entities
  related_type: string | null;
  related_id: string | null;

  // Payment provider
  provider: PaymentProvider | null;
  provider_reference: string | null;
  provider_response: Record<string, unknown> | null;

  // Metadata
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;

  // Timestamps
  completed_at: string | null;
  failed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ===========================================
// PAYMENT (incoming)
// ===========================================

export interface Payment {
  id: string;
  reference: string;
  user_id: string | null;
  email: string;

  // Purpose
  purpose: string;
  related_type: string | null;
  related_id: string | null;

  // Money
  amount: number;
  currency: CurrencyCode;

  // Processing
  provider: PaymentProvider;
  provider_reference: string | null;
  status: TransactionStatus;
  provider_response: Record<string, unknown> | null;

  // Timestamps
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// ===========================================
// PAYOUT (outgoing)
// ===========================================

export interface Payout {
  id: string;
  reference: string;
  wallet_id: string | null;
  recipient_name: string;

  // Bank details
  bank_code: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;

  // Money
  amount: number;
  currency: CurrencyCode;
  fee_amount: number;
  net_amount: number;

  // Status
  status: PayoutStatus;

  // Processing
  provider: PaymentProvider | null;
  provider_reference: string | null;
  provider_response: Record<string, unknown> | null;

  // Related
  related_type: string | null;
  related_id: string | null;

  // Notes
  description: string | null;
  notes: string | null;

  // Approval
  requires_approval: boolean;
  approved_by: string | null;
  approved_at: string | null;

  // Timestamps
  processed_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ===========================================
// FEE CONFIGURATION
// ===========================================

export interface FeeConfiguration {
  id: string;
  name: string;
  fee_type: 'percentage' | 'fixed' | 'tiered';
  transaction_category: TransactionCategory | null;

  // Fee values
  percentage: number | null;
  fixed_amount: number | null;
  min_fee: number | null;
  max_fee: number | null;
  tiers: Record<string, unknown> | null;

  // Currency
  currency: CurrencyCode;

  // Status
  is_active: boolean;

  // Effective dates
  effective_from: string;
  effective_to: string | null;

  // Description
  description: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ===========================================
// INSERT TYPES
// ===========================================

export type WalletInsert = Omit<Wallet,
  | 'id'
  | 'balance'
  | 'pending_credits'
  | 'pending_debits'
  | 'total_credits'
  | 'total_debits'
  | 'last_transaction_at'
  | 'created_at'
  | 'updated_at'
> & {
  id?: string;
  balance?: number;
  created_at?: string;
  updated_at?: string;
};

export type TransactionInsert = Omit<Transaction,
  | 'id'
  | 'reference'
  | 'net_amount'
  | 'balance_before'
  | 'balance_after'
  | 'completed_at'
  | 'failed_at'
  | 'created_at'
  | 'updated_at'
> & {
  id?: string;
  reference?: string;
  created_at?: string;
  updated_at?: string;
};

export type PaymentInsert = Omit<Payment, 'id' | 'reference' | 'verified_at' | 'created_at' | 'updated_at'> & {
  id?: string;
  reference?: string;
  created_at?: string;
  updated_at?: string;
};

export type PayoutInsert = Omit<Payout,
  | 'id'
  | 'reference'
  | 'net_amount'
  | 'processed_at'
  | 'completed_at'
  | 'failed_at'
  | 'created_at'
  | 'updated_at'
> & {
  id?: string;
  reference?: string;
  created_at?: string;
  updated_at?: string;
};

// ===========================================
// UPDATE TYPES
// ===========================================

export type WalletUpdate = Partial<Omit<Wallet, 'id' | 'created_at'>>;
export type TransactionUpdate = Partial<Omit<Transaction, 'id' | 'created_at' | 'reference'>>;
export type PaymentUpdate = Partial<Omit<Payment, 'id' | 'created_at' | 'reference'>>;
export type PayoutUpdate = Partial<Omit<Payout, 'id' | 'created_at' | 'reference'>>;

// ===========================================
// EXTENDED/JOINED TYPES
// ===========================================

export interface WalletWithTransactions extends Wallet {
  transactions: Transaction[];
}

export interface TransactionWithWallet extends Transaction {
  wallet: Wallet;
}

export interface PaymentWithUser extends Payment {
  user: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
}

// ===========================================
// HELPER TYPES
// ===========================================

export interface WalletBalance {
  available: number;
  pending: number;
  total: number;
  currency: CurrencyCode;
}

export interface PaymentInitiation {
  amount: number;
  currency: CurrencyCode;
  email: string;
  purpose: string;
  related_type?: string;
  related_id?: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentVerification {
  reference: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: CurrencyCode;
  provider_data: Record<string, unknown>;
}

export interface PayoutRequest {
  wallet_id: string;
  amount: number;
  bank_code: string;
  account_number: string;
  account_name: string;
  description?: string;
}

export interface FeeCalculation {
  gross_amount: number;
  fee_amount: number;
  net_amount: number;
  fee_breakdown: {
    platform_fee: number;
    payment_processor_fee: number;
    other_fees?: number;
  };
}

// ===========================================
// BANK INFO TYPES
// ===========================================

export interface Bank {
  code: string;
  name: string;
  country: string;
}

export interface BankAccountVerification {
  account_number: string;
  account_name: string;
  bank_code: string;
  bank_name: string;
}
