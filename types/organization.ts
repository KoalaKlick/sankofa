/**
 * Organization Types
 * Types related to organizations, members, and invitations
 */

import type { OrganizationRole, InvitationStatus } from './enums';
import type { Profile } from './user';

// ===========================================
// ORGANIZATION
// ===========================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;

  // Branding
  logo_url: string | null;
  banner_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;

  // Contact
  website_url: string | null;
  contact_email: string | null;

  // Metadata
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ===========================================
// ORGANIZATION MEMBER
// ===========================================

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  joined_at: string;
  updated_at: string;
}

// ===========================================
// ORGANIZATION INVITATION
// ===========================================

export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  inviter_id: string | null;
  email: string;
  role: OrganizationRole;
  status: InvitationStatus;
  token: string | null;
  expires_at: string | null;
  created_at: string;
  responded_at: string | null;
}

// ===========================================
// INSERT TYPES
// ===========================================

export type OrganizationInsert = Omit<Organization, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type OrganizationMemberInsert = Omit<OrganizationMember, 'id' | 'joined_at' | 'updated_at'> & {
  id?: string;
  joined_at?: string;
  updated_at?: string;
};

export type OrganizationInvitationInsert = Omit<OrganizationInvitation, 'id' | 'created_at' | 'token'> & {
  id?: string;
  created_at?: string;
  token?: string;
};

// ===========================================
// UPDATE TYPES
// ===========================================

export type OrganizationUpdate = Partial<Omit<Organization, 'id' | 'created_at'>>;
export type OrganizationMemberUpdate = Partial<Omit<OrganizationMember, 'id' | 'joined_at'>>;
export type OrganizationInvitationUpdate = Partial<Omit<OrganizationInvitation, 'id' | 'created_at'>>;

// ===========================================
// EXTENDED/JOINED TYPES
// ===========================================

export interface OrganizationWithMembers extends Organization {
  members: (OrganizationMember & { profile: Profile })[];
}

export interface OrganizationMemberWithProfile extends OrganizationMember {
  profile: Profile;
  organization: Organization;
}

export interface OrganizationWithRole extends Organization {
  role: OrganizationRole;
}

// ===========================================
// BRANDING HELPER TYPES
// ===========================================

export interface OrganizationBranding {
  logo_url: string | null;
  banner_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
}
