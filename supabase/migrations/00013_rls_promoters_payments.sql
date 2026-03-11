-- Migration: RLS Policies for Promoters, Payments & Wallets
-- Description: Row Level Security policies for new tables

-- ===========================================
-- PROMOTERS POLICIES
-- ===========================================

-- Users can view their own promoter profile
CREATE POLICY "Users can view own promoter profile"
  ON public.promoters FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own promoter profile
CREATE POLICY "Users can create own promoter profile"
  ON public.promoters FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own promoter profile
CREATE POLICY "Users can update own promoter profile"
  ON public.promoters FOR UPDATE
  USING (user_id = auth.uid());

-- Public can view active promoters (for referral code lookup)
CREATE POLICY "Anyone can lookup active promoters by code"
  ON public.promoters FOR SELECT
  USING (status = 'active');

-- ===========================================
-- REFERRALS POLICIES
-- ===========================================

-- Promoters can view their own referrals
CREATE POLICY "Promoters can view own referrals"
  ON public.referrals FOR SELECT
  USING (
    promoter_id IN (
      SELECT id FROM public.promoters WHERE user_id = auth.uid()
    )
  );

-- Users can view referrals they are part of
CREATE POLICY "Users can view referrals they are in"
  ON public.referrals FOR SELECT
  USING (referred_user_id = auth.uid());

-- System can insert referrals (handled by service)
CREATE POLICY "Authenticated users can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ===========================================
-- COMMISSIONS POLICIES
-- ===========================================

-- Promoters can view their own commissions
CREATE POLICY "Promoters can view own commissions"
  ON public.commissions FOR SELECT
  USING (
    promoter_id IN (
      SELECT id FROM public.promoters WHERE user_id = auth.uid()
    )
  );

-- ===========================================
-- WALLETS POLICIES
-- ===========================================

-- Users can view their own wallet
CREATE POLICY "Users can view own wallet"
  ON public.wallets FOR SELECT
  USING (user_id = auth.uid());

-- Org admins can view org wallet
CREATE POLICY "Org admins can view org wallet"
  ON public.wallets FOR SELECT
  USING (
    organization_id IS NOT NULL
    AND is_org_admin(organization_id)
  );

-- ===========================================
-- TRANSACTIONS POLICIES
-- ===========================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (
    wallet_id IN (
      SELECT id FROM public.wallets WHERE user_id = auth.uid()
    )
  );

-- Org admins can view org transactions
CREATE POLICY "Org admins can view org transactions"
  ON public.transactions FOR SELECT
  USING (
    wallet_id IN (
      SELECT id FROM public.wallets 
      WHERE organization_id IS NOT NULL 
        AND is_org_admin(organization_id)
    )
  );

-- ===========================================
-- PAYMENTS POLICIES
-- ===========================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (user_id = auth.uid());

-- Users can create payments
CREATE POLICY "Users can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ===========================================
-- PAYOUTS POLICIES
-- ===========================================

-- Users can view payouts to their wallet
CREATE POLICY "Users can view own payouts"
  ON public.payouts FOR SELECT
  USING (
    wallet_id IN (
      SELECT id FROM public.wallets WHERE user_id = auth.uid()
    )
  );

-- Users can request payouts from their wallet
CREATE POLICY "Users can request payouts"
  ON public.payouts FOR INSERT
  WITH CHECK (
    wallet_id IN (
      SELECT id FROM public.wallets WHERE user_id = auth.uid()
    )
  );

-- ===========================================
-- PROMOTER TIERS POLICIES
-- ===========================================

-- Everyone can view tier configurations
CREATE POLICY "Anyone can view promoter tiers"
  ON public.promoter_tiers FOR SELECT
  USING (TRUE);

-- ===========================================
-- FEE CONFIGURATIONS POLICIES
-- ===========================================

-- Everyone can view active fee configurations
CREATE POLICY "Anyone can view active fees"
  ON public.fee_configurations FOR SELECT
  USING (is_active = TRUE);
