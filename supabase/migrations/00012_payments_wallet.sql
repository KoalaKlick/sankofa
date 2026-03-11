-- Migration: Payments, Wallet & Transactions
-- Description: Complete payment system with wallets and transaction tracking

-- ===========================================
-- ENUMS
-- ===========================================

-- Currency types supported
CREATE TYPE currency_code AS ENUM ('NGN', 'USD', 'GHS', 'KES', 'ZAR', 'GBP', 'EUR');

-- Payment provider
CREATE TYPE payment_provider AS ENUM (
  'paystack',
  'flutterwave',
  'stripe',
  'bank_transfer',
  'wallet',
  'cash',
  'free'
);

-- Transaction type
CREATE TYPE transaction_type AS ENUM (
  'credit',     -- Money in
  'debit'       -- Money out
);

-- Transaction category
CREATE TYPE transaction_category AS ENUM (
  'ticket_purchase',
  'vote_purchase',
  'subscription',
  'refund',
  'commission_payout',
  'wallet_topup',
  'wallet_withdrawal',
  'transfer',
  'fee',
  'bonus',
  'adjustment'
);

-- Transaction status
CREATE TYPE transaction_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'reversed'
);

-- Payout status
CREATE TYPE payout_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled'
);

-- ===========================================
-- WALLETS TABLE
-- ===========================================

CREATE TABLE public.wallets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Owner (can be user or organization)
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Balance
  balance         DECIMAL(15,2) DEFAULT 0 CHECK (balance >= 0),
  currency        currency_code DEFAULT 'NGN',
  
  -- Pending amounts
  pending_credits DECIMAL(15,2) DEFAULT 0,    -- Money coming in (unconfirmed)
  pending_debits  DECIMAL(15,2) DEFAULT 0,    -- Money going out (processing)
  
  -- Lifetime stats
  total_credits   DECIMAL(15,2) DEFAULT 0,
  total_debits    DECIMAL(15,2) DEFAULT 0,
  
  -- Status
  is_active       BOOLEAN DEFAULT TRUE,
  is_locked       BOOLEAN DEFAULT FALSE,      -- Lock for suspicious activity
  lock_reason     TEXT,
  
  -- Timestamps
  last_transaction_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure wallet belongs to either user OR organization, not both
  CONSTRAINT wallet_owner_check CHECK (
    (user_id IS NOT NULL AND organization_id IS NULL) OR
    (user_id IS NULL AND organization_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_wallets_user ON public.wallets(user_id);
CREATE INDEX idx_wallets_organization ON public.wallets(organization_id);
CREATE INDEX idx_wallets_currency ON public.wallets(currency);

-- Unique constraint: one wallet per user per currency
CREATE UNIQUE INDEX idx_wallets_user_currency ON public.wallets(user_id, currency) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_wallets_org_currency ON public.wallets(organization_id, currency) WHERE organization_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- TRANSACTIONS TABLE
-- ===========================================

CREATE TABLE public.transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Transaction reference (human readable)
  reference       TEXT UNIQUE NOT NULL,
  
  -- Associated wallet
  wallet_id       UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  
  -- Transaction classification
  type            transaction_type NOT NULL,
  category        transaction_category NOT NULL,
  status          transaction_status DEFAULT 'pending',
  
  -- Money
  amount          DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  currency        currency_code NOT NULL,
  
  -- Fees (platform fees, payment processor fees, etc.)
  fee_amount      DECIMAL(15,2) DEFAULT 0,
  fee_breakdown   JSONB,                       -- Detailed fee breakdown
  
  -- Net amount after fees
  net_amount      DECIMAL(15,2) GENERATED ALWAYS AS (
    CASE WHEN type = 'credit' THEN amount - COALESCE(fee_amount, 0)
         ELSE amount + COALESCE(fee_amount, 0)
    END
  ) STORED,
  
  -- Balance tracking
  balance_before  DECIMAL(15,2),
  balance_after   DECIMAL(15,2),
  
  -- Description
  description     TEXT,
  notes           TEXT,                        -- Internal notes
  
  -- Related entities
  related_type    TEXT,                        -- 'ticket_order', 'vote', 'commission', etc.
  related_id      UUID,
  
  -- Payment provider info
  provider        payment_provider,
  provider_reference TEXT,                     -- External transaction ID
  provider_response JSONB,                     -- Full response from provider
  
  -- Metadata
  metadata        JSONB,
  ip_address      INET,
  user_agent      TEXT,
  
  -- Timestamps
  completed_at    TIMESTAMPTZ,
  failed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_wallet ON public.transactions(wallet_id);
CREATE INDEX idx_transactions_reference ON public.transactions(reference);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_category ON public.transactions(category);
CREATE INDEX idx_transactions_created ON public.transactions(created_at);
CREATE INDEX idx_transactions_related ON public.transactions(related_type, related_id);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- PAYMENTS TABLE (incoming payments)
-- ===========================================

CREATE TABLE public.payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Payment reference
  reference       TEXT UNIQUE NOT NULL,
  
  -- Who is paying
  user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email           TEXT NOT NULL,
  
  -- What they're paying for
  purpose         TEXT NOT NULL,               -- 'ticket_purchase', 'vote_purchase', 'wallet_topup'
  related_type    TEXT,
  related_id      UUID,
  
  -- Money
  amount          DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  currency        currency_code NOT NULL DEFAULT 'NGN',
  
  -- Payment processing
  provider        payment_provider NOT NULL,
  provider_reference TEXT,                     -- Paystack/Flutterwave reference
  
  -- Status
  status          transaction_status DEFAULT 'pending',
  
  -- Provider response
  provider_response JSONB,
  
  -- Timestamps
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_reference ON public.payments(reference);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_provider_ref ON public.payments(provider_reference);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- PAYOUTS TABLE (money going out)
-- ===========================================

CREATE TABLE public.payouts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Payout reference
  reference       TEXT UNIQUE NOT NULL,
  
  -- Who receives the payout
  wallet_id       UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
  recipient_name  TEXT NOT NULL,
  
  -- Bank details
  bank_code       TEXT,
  bank_name       TEXT,
  account_number  TEXT,
  account_name    TEXT,
  
  -- Money
  amount          DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  currency        currency_code NOT NULL DEFAULT 'NGN',
  
  -- Fees
  fee_amount      DECIMAL(15,2) DEFAULT 0,
  net_amount      DECIMAL(15,2) GENERATED ALWAYS AS (amount - COALESCE(fee_amount, 0)) STORED,
  
  -- Status
  status          payout_status DEFAULT 'pending',
  
  -- Processing info
  provider        payment_provider,
  provider_reference TEXT,
  provider_response JSONB,
  
  -- Related (e.g., commission payout)
  related_type    TEXT,
  related_id      UUID,
  
  -- Notes
  description     TEXT,
  notes           TEXT,
  
  -- Approval (for large payouts)
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_by     UUID REFERENCES public.profiles(id),
  approved_at     TIMESTAMPTZ,
  
  -- Timestamps
  processed_at    TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  failed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payouts_wallet ON public.payouts(wallet_id);
CREATE INDEX idx_payouts_reference ON public.payouts(reference);
CREATE INDEX idx_payouts_status ON public.payouts(status);

-- Enable RLS
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- PLATFORM FEES CONFIGURATION
-- ===========================================

CREATE TABLE public.fee_configurations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Fee name and type
  name            TEXT NOT NULL,
  fee_type        TEXT NOT NULL,               -- 'percentage', 'fixed', 'tiered'
  
  -- For specific transaction types
  transaction_category transaction_category,
  
  -- Fee values
  percentage      DECIMAL(5,2),                -- e.g., 2.50 for 2.5%
  fixed_amount    DECIMAL(15,2),               -- Fixed fee amount
  min_fee         DECIMAL(15,2),               -- Minimum fee
  max_fee         DECIMAL(15,2),               -- Maximum fee (cap)
  
  -- Tiered fees (for volume-based pricing)
  tiers           JSONB,
  
  -- Currency
  currency        currency_code DEFAULT 'NGN',
  
  -- Active status
  is_active       BOOLEAN DEFAULT TRUE,
  
  -- Effective dates
  effective_from  TIMESTAMPTZ DEFAULT NOW(),
  effective_to    TIMESTAMPTZ,
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default fee configurations
INSERT INTO public.fee_configurations (name, fee_type, transaction_category, percentage, min_fee, description) VALUES
  ('Ticket Platform Fee', 'percentage', 'ticket_purchase', 5.00, 100, 'Platform fee for ticket purchases'),
  ('Vote Platform Fee', 'percentage', 'vote_purchase', 3.00, 50, 'Platform fee for vote purchases'),
  ('Payout Fee', 'fixed', 'commission_payout', NULL, NULL, 'Fee for processing payouts')
  ON CONFLICT DO NOTHING;

ALTER TABLE public.fee_configurations ADD COLUMN description TEXT;

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Generate transaction reference
CREATE OR REPLACE FUNCTION public.generate_transaction_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference IS NULL THEN
    NEW.reference := 'TXN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                     UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_transaction_reference_trigger
  BEFORE INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.generate_transaction_reference();

-- Generate payment reference
CREATE OR REPLACE FUNCTION public.generate_payment_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference IS NULL THEN
    NEW.reference := 'PAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                     UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_payment_reference_trigger
  BEFORE INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.generate_payment_reference();

-- Generate payout reference
CREATE OR REPLACE FUNCTION public.generate_payout_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference IS NULL THEN
    NEW.reference := 'PYT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                     UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_payout_reference_trigger
  BEFORE INSERT ON public.payouts
  FOR EACH ROW EXECUTE FUNCTION public.generate_payout_reference();

-- Update wallet balance after completed transaction
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Record balance before
    NEW.balance_before := (SELECT balance FROM public.wallets WHERE id = NEW.wallet_id);
    
    -- Update wallet balance
    IF NEW.type = 'credit' THEN
      UPDATE public.wallets
      SET 
        balance = balance + NEW.net_amount,
        total_credits = total_credits + NEW.amount,
        last_transaction_at = NOW(),
        updated_at = NOW()
      WHERE id = NEW.wallet_id;
    ELSE
      UPDATE public.wallets
      SET 
        balance = balance - NEW.net_amount,
        total_debits = total_debits + NEW.amount,
        last_transaction_at = NOW(),
        updated_at = NOW()
      WHERE id = NEW.wallet_id;
    END IF;
    
    -- Record balance after
    NEW.balance_after := (SELECT balance FROM public.wallets WHERE id = NEW.wallet_id);
    NEW.completed_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wallet_balance_trigger
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_wallet_balance();

-- Auto-create wallet for new users
CREATE OR REPLACE FUNCTION public.auto_create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (user_id, currency)
  VALUES (NEW.id, 'NGN')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_user_wallet_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.auto_create_user_wallet();

-- Auto-create wallet for new organizations
CREATE OR REPLACE FUNCTION public.auto_create_org_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (organization_id, currency)
  VALUES (NEW.id, 'NGN')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_org_wallet_trigger
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.auto_create_org_wallet();
