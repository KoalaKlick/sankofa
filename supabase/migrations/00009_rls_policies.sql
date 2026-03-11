-- Migration: Row Level Security Policies
-- Description: Comprehensive RLS policies for multi-tenant access control

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
-- ORGANIZATIONS POLICIES
-- ===========================================

-- Members can view their organizations
CREATE POLICY "Members can view organizations"
  ON public.organizations FOR SELECT
  USING (is_org_member(id));

-- Authenticated users can create organizations
CREATE POLICY "Users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- Admins/owners can update their organizations
CREATE POLICY "Admins can update organizations"
  ON public.organizations FOR UPDATE
  USING (is_org_admin(id));

-- Only owners can delete organizations
CREATE POLICY "Owners can delete organizations"
  ON public.organizations FOR DELETE
  USING (is_org_owner(id));

-- ===========================================
-- ORGANIZATION MEMBERS POLICIES
-- ===========================================

-- Members can view other members in their org
CREATE POLICY "Members can view org members"
  ON public.organization_members FOR SELECT
  USING (is_org_member(organization_id));

-- Admins can add members
CREATE POLICY "Admins can add members"
  ON public.organization_members FOR INSERT
  WITH CHECK (is_org_admin(organization_id));

-- Admins can update member roles (but can't change owners)
CREATE POLICY "Admins can update member roles"
  ON public.organization_members FOR UPDATE
  USING (
    is_org_admin(organization_id)
    AND role != 'owner'  -- Can't demote owners
  );

-- Members can leave org (delete self), admins can remove members
CREATE POLICY "Members can delete membership"
  ON public.organization_members FOR DELETE
  USING (
    user_id = auth.uid()                    -- Can leave yourself
    OR (
      is_org_admin(organization_id)         -- Or admin can remove
      AND role != 'owner'                   -- But can't remove owners
    )
  );

-- ===========================================
-- ORGANIZATION INVITATIONS POLICIES
-- ===========================================

-- Members can view invitations for their org
CREATE POLICY "Members can view invitations"
  ON public.organization_invitations FOR SELECT
  USING (
    is_org_member(organization_id)
    OR email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- Admins can create invitations
CREATE POLICY "Admins can create invitations"
  ON public.organization_invitations FOR INSERT
  WITH CHECK (is_org_admin(organization_id));

-- Invitees can update (accept/decline) their own invitations
CREATE POLICY "Invitees can respond to invitations"
  ON public.organization_invitations FOR UPDATE
  USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    OR is_org_admin(organization_id)
  );

-- Admins can delete invitations
CREATE POLICY "Admins can delete invitations"
  ON public.organization_invitations FOR DELETE
  USING (is_org_admin(organization_id));

-- ===========================================
-- EVENTS POLICIES
-- ===========================================

-- Public events visible to everyone, private only to members
CREATE POLICY "Anyone can view public events"
  ON public.events FOR SELECT
  USING (
    is_public = TRUE
    OR is_org_member(organization_id)
  );

-- Members can create events
CREATE POLICY "Members can create events"
  ON public.events FOR INSERT
  WITH CHECK (is_org_member(organization_id));

-- Admins can update events
CREATE POLICY "Admins can update events"
  ON public.events FOR UPDATE
  USING (is_org_admin(organization_id));

-- Admins can delete events
CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE
  USING (is_org_admin(organization_id));

-- ===========================================
-- VOTING CATEGORIES POLICIES
-- ===========================================

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

-- Users can view their own votes
CREATE POLICY "Users can view own votes"
  ON public.votes FOR SELECT
  USING (voter_id = auth.uid());

-- Org admins can view all votes for their events
CREATE POLICY "Admins can view event votes"
  ON public.votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = votes.event_id
        AND is_org_admin(events.organization_id)
    )
  );

-- Authenticated users can vote on public events
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

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.ticket_orders FOR SELECT
  USING (buyer_id = auth.uid());

-- Admins can view all orders for their events
CREATE POLICY "Admins can view event orders"
  ON public.ticket_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = ticket_orders.event_id
        AND is_org_admin(events.organization_id)
    )
  );

-- Anyone can create orders (for public events)
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

-- Admins can update orders
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

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON public.tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ticket_orders
      WHERE ticket_orders.id = tickets.order_id
        AND ticket_orders.buyer_id = auth.uid()
    )
  );

-- Admins can view all tickets for their events
CREATE POLICY "Admins can view event tickets"
  ON public.tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = tickets.event_id
        AND is_org_admin(events.organization_id)
    )
  );

-- System creates tickets (via order)
CREATE POLICY "System can create tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ticket_orders
      WHERE ticket_orders.id = order_id
    )
  );

-- Admins can update tickets (for check-in)
CREATE POLICY "Admins can update tickets"
  ON public.tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_id
        AND is_org_admin(events.organization_id)
    )
  );
