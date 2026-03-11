-- Row Level Security Policies
-- Comprehensive RLS policies for multi-tenant access control
-- Table structure is managed by Prisma migrations

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Check if user is a member of an organization
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get user's role in an organization
CREATE OR REPLACE FUNCTION public.get_org_role(org_id UUID)
RETURNS organization_role AS $$
  SELECT role FROM public.organization_members
  WHERE organization_id = org_id
    AND user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is admin or owner in org
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'owner')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is owner of org
CREATE OR REPLACE FUNCTION public.is_org_owner(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role = 'owner'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ===========================================
-- PROFILES POLICIES
-- ===========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- ===========================================
-- ORGANIZATIONS POLICIES
-- ===========================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view organizations"
  ON public.organizations FOR SELECT
  USING (is_org_member(id));

CREATE POLICY "Users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Admins can update organizations"
  ON public.organizations FOR UPDATE
  USING (is_org_admin(id));

CREATE POLICY "Owners can delete organizations"
  ON public.organizations FOR DELETE
  USING (is_org_owner(id));

-- ===========================================
-- ORGANIZATION MEMBERS POLICIES
-- ===========================================

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org members"
  ON public.organization_members FOR SELECT
  USING (is_org_member(organization_id));

CREATE POLICY "Admins can add members"
  ON public.organization_members FOR INSERT
  WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "Admins can update member roles"
  ON public.organization_members FOR UPDATE
  USING (
    is_org_admin(organization_id)
    AND role != 'owner'
  );

CREATE POLICY "Members can delete membership"
  ON public.organization_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR (is_org_admin(organization_id) AND role != 'owner')
  );

-- ===========================================
-- ORGANIZATION INVITATIONS POLICIES
-- ===========================================

ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view invitations"
  ON public.organization_invitations FOR SELECT
  USING (
    is_org_member(organization_id)
    OR email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can create invitations"
  ON public.organization_invitations FOR INSERT
  WITH CHECK (is_org_admin(organization_id));

CREATE POLICY "Invitees can respond to invitations"
  ON public.organization_invitations FOR UPDATE
  USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    OR is_org_admin(organization_id)
  );

CREATE POLICY "Admins can delete invitations"
  ON public.organization_invitations FOR DELETE
  USING (is_org_admin(organization_id));

-- ===========================================
-- EVENTS POLICIES
-- ===========================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public events"
  ON public.events FOR SELECT
  USING (is_public = TRUE OR is_org_member(organization_id));

CREATE POLICY "Members can create events"
  ON public.events FOR INSERT
  WITH CHECK (is_org_member(organization_id));

CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE
  USING (is_org_admin(organization_id));

CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE
  USING (is_org_admin(organization_id));

-- ===========================================
-- VOTING CATEGORIES POLICIES
-- ===========================================

ALTER TABLE public.voting_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View voting categories via event access"
  ON public.voting_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = voting_categories.event_id
        AND (events.is_public = TRUE OR is_org_member(events.organization_id))
    )
  );

CREATE POLICY "Members can manage voting categories"
  ON public.voting_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND is_org_member(events.organization_id)
    )
  );

CREATE POLICY "Admins can update voting categories"
  ON public.voting_categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND is_org_admin(events.organization_id)
    )
  );

CREATE POLICY "Admins can delete voting categories"
  ON public.voting_categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND is_org_admin(events.organization_id)
    )
  );

-- ===========================================
-- VOTING OPTIONS POLICIES
-- ===========================================

ALTER TABLE public.voting_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View voting options via event access"
  ON public.voting_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = voting_options.event_id
        AND (events.is_public = TRUE OR is_org_member(events.organization_id))
    )
  );

CREATE POLICY "Members can manage voting options"
  ON public.voting_options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND is_org_member(events.organization_id)
    )
  );

CREATE POLICY "Admins can update voting options"
  ON public.voting_options FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND is_org_admin(events.organization_id)
    )
  );

CREATE POLICY "Admins can delete voting options"
  ON public.voting_options FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND is_org_admin(events.organization_id)
    )
  );

-- ===========================================
-- VOTES POLICIES
-- ===========================================

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own votes"
  ON public.votes FOR SELECT
  USING (voter_id = auth.uid());

CREATE POLICY "Admins can view event votes"
  ON public.votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = votes.event_id
        AND is_org_admin(events.organization_id)
    )
  );

CREATE POLICY "Users can vote"
  ON public.votes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND voter_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND events.status IN ('published', 'ongoing')
        AND (events.is_public = TRUE OR is_org_member(events.organization_id))
    )
  );

-- ===========================================
-- TICKET TYPES POLICIES
-- ===========================================

ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View ticket types via event access"
  ON public.ticket_types FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = ticket_types.event_id
        AND (events.is_public = TRUE OR is_org_member(events.organization_id))
    )
  );

CREATE POLICY "Members can manage ticket types"
  ON public.ticket_types FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND is_org_member(events.organization_id)
    )
  );

CREATE POLICY "Admins can update ticket types"
  ON public.ticket_types FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND is_org_admin(events.organization_id)
    )
  );

CREATE POLICY "Admins can delete ticket types"
  ON public.ticket_types FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND is_org_admin(events.organization_id)
    )
  );

-- ===========================================
-- TICKET ORDERS POLICIES
-- ===========================================

ALTER TABLE public.ticket_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.ticket_orders FOR SELECT
  USING (buyer_id = auth.uid());

CREATE POLICY "Admins can view event orders"
  ON public.ticket_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = ticket_orders.event_id
        AND is_org_admin(events.organization_id)
    )
  );

CREATE POLICY "Users can create orders"
  ON public.ticket_orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND events.status IN ('published', 'ongoing')
        AND events.is_public = TRUE
    )
  );

CREATE POLICY "Admins can update orders"
  ON public.ticket_orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND is_org_admin(events.organization_id)
    )
  );

-- ===========================================
-- TICKETS POLICIES
-- ===========================================

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON public.tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ticket_orders
      WHERE ticket_orders.id = tickets.order_id
        AND ticket_orders.buyer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view event tickets"
  ON public.tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = tickets.event_id
        AND is_org_admin(events.organization_id)
    )
  );

CREATE POLICY "System can create tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ticket_orders
      WHERE ticket_orders.id = order_id
    )
  );

CREATE POLICY "Admins can update tickets"
  ON public.tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND is_org_admin(events.organization_id)
    )
  );

-- ===========================================
-- PROMOTERS POLICIES
-- ===========================================

ALTER TABLE public.promoters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own promoter profile"
  ON public.promoters FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own promoter profile"
  ON public.promoters FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own promoter profile"
  ON public.promoters FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can lookup active promoters by code"
  ON public.promoters FOR SELECT
  USING (status = 'active');

-- ===========================================
-- REFERRALS POLICIES
-- ===========================================

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promoters can view own referrals"
  ON public.referrals FOR SELECT
  USING (
    promoter_id IN (
      SELECT id FROM public.promoters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view referrals they are in"
  ON public.referrals FOR SELECT
  USING (referred_user_id = auth.uid());

CREATE POLICY "Authenticated users can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ===========================================
-- COMMISSIONS POLICIES
-- ===========================================

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promoters can view own commissions"
  ON public.commissions FOR SELECT
  USING (
    promoter_id IN (
      SELECT id FROM public.promoters WHERE user_id = auth.uid()
    )
  );

-- ===========================================
-- PROMOTER TIERS POLICIES
-- ===========================================

ALTER TABLE public.promoter_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view promoter tiers"
  ON public.promoter_tiers FOR SELECT
  USING (TRUE);

-- ===========================================
-- WALLETS POLICIES
-- ===========================================

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
  ON public.wallets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Org admins can view org wallet"
  ON public.wallets FOR SELECT
  USING (
    organization_id IS NOT NULL
    AND is_org_admin(organization_id)
  );

-- ===========================================
-- TRANSACTIONS POLICIES
-- ===========================================

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (
    wallet_id IN (
      SELECT id FROM public.wallets WHERE user_id = auth.uid()
    )
  );

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

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ===========================================
-- PAYOUTS POLICIES
-- ===========================================

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payouts"
  ON public.payouts FOR SELECT
  USING (
    wallet_id IN (
      SELECT id FROM public.wallets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can request payouts"
  ON public.payouts FOR INSERT
  WITH CHECK (
    wallet_id IN (
      SELECT id FROM public.wallets WHERE user_id = auth.uid()
    )
  );

-- ===========================================
-- FEE CONFIGURATIONS POLICIES
-- ===========================================

ALTER TABLE public.fee_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active fees"
  ON public.fee_configurations FOR SELECT
  USING (is_active = TRUE);
