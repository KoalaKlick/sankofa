/**
 * Event Types
 * Types related to events, voting categories, options, and votes
 */

import type { EventType, EventStatus } from './enums';
import type { Organization } from './organization';
import type { Profile } from './user';

// ===========================================
// EVENT
// ===========================================

export interface Event {
  id: string;
  organization_id: string;
  creator_id: string | null;
  title: string;
  description: string | null;
  slug: string;
  type: EventType;
  status: EventStatus;
  start_date: string | null;
  end_date: string | null;
  timezone: string;
  is_public: boolean;
  cover_image: string | null;
  banner_image: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_city: string | null;
  venue_country: string;
  is_virtual: boolean;
  virtual_link: string | null;
  max_attendees: number | null;
  registration_deadline: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// ===========================================
// VOTING CATEGORY
// ===========================================

export interface VotingCategory {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  order_idx: number;
  max_votes_per_user: number;
  allow_multiple: boolean;
  created_at: string;
  updated_at: string;
}

// ===========================================
// VOTING OPTION
// ===========================================

export interface VotingOption {
  id: string;
  event_id: string;
  category_id: string | null;
  option_text: string;
  description: string | null;
  image_url: string | null;
  order_idx: number;
  votes_count: number;
  created_at: string;
  updated_at: string;
}

// ===========================================
// VOTE
// ===========================================

export interface Vote {
  id: string;
  event_id: string;
  option_id: string;
  category_id: string | null;
  voter_id: string | null;
  voter_email: string | null;
  voter_ip: string | null;
  amount_paid: number;
  payment_reference: string | null;
  created_at: string;
}

// ===========================================
// INSERT TYPES
// ===========================================

export type EventInsert = Omit<Event, 'id' | 'created_at' | 'updated_at' | 'published_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
};

export type VotingCategoryInsert = Omit<VotingCategory, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type VotingOptionInsert = Omit<VotingOption, 'id' | 'created_at' | 'updated_at' | 'votes_count'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  votes_count?: number;
};

export type VoteInsert = Omit<Vote, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

// ===========================================
// UPDATE TYPES
// ===========================================

export type EventUpdate = Partial<Omit<Event, 'id' | 'created_at'>>;
export type VotingCategoryUpdate = Partial<Omit<VotingCategory, 'id' | 'created_at'>>;
export type VotingOptionUpdate = Partial<Omit<VotingOption, 'id' | 'created_at'>>;

// ===========================================
// EXTENDED/JOINED TYPES
// ===========================================

export interface EventWithOrganization extends Event {
  organization: Organization;
}

export interface EventWithDetails extends Event {
  organization: Organization;
  creator: Profile | null;
  voting_categories?: VotingCategory[];
  voting_options?: VotingOption[];
}

export interface VotingOptionWithVotes extends VotingOption {
  votes: Vote[];
  category: VotingCategory | null;
}

export interface VotingCategoryWithOptions extends VotingCategory {
  voting_options: VotingOption[];
}

// ===========================================
// HELPER TYPES
// ===========================================

export interface EventStats {
  total_votes: number;
  total_revenue: number;
  total_attendees: number;
  categories_count: number;
  options_count: number;
}
