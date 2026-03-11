/**
 * Ticket Types
 * Types related to tickets, orders, and check-ins
 */

import type { TicketStatus, OrderStatus, TicketCheckInStatus } from './enums';
import type { Event } from './event';

// ===========================================
// TICKET TYPE (pricing tiers)
// ===========================================

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  quantity_total: number | null;
  quantity_sold: number;
  quantity_available: number | null;
  sales_start: string | null;
  sales_end: string | null;
  max_per_order: number;
  min_per_order: number;
  status: TicketStatus;
  order_idx: number;
  created_at: string;
  updated_at: string;
}

// ===========================================
// TICKET ORDER
// ===========================================

export interface TicketOrder {
  id: string;
  event_id: string;
  buyer_id: string | null;
  order_number: string;
  buyer_email: string;
  buyer_name: string | null;
  buyer_phone: string | null;
  subtotal: number;
  discount_amount: number;
  fees: number;
  total: number;
  currency: string;
  payment_method: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

// ===========================================
// TICKET (individual)
// ===========================================

export interface Ticket {
  id: string;
  order_id: string;
  event_id: string;
  ticket_type_id: string;
  ticket_code: string;
  attendee_name: string | null;
  attendee_email: string | null;
  check_in_status: TicketCheckInStatus;
  checked_in_at: string | null;
  checked_in_by: string | null;
  created_at: string;
  updated_at: string;
}

// ===========================================
// INSERT TYPES
// ===========================================

export type TicketTypeInsert = Omit<TicketType, 'id' | 'created_at' | 'updated_at' | 'quantity_sold' | 'quantity_available'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  quantity_sold?: number;
};

export type TicketOrderInsert = Omit<TicketOrder, 'id' | 'created_at' | 'updated_at' | 'order_number'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  order_number?: string;
};

export type TicketInsert = Omit<Ticket, 'id' | 'created_at' | 'updated_at' | 'ticket_code'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
  ticket_code?: string;
};

// ===========================================
// UPDATE TYPES
// ===========================================

export type TicketTypeUpdate = Partial<Omit<TicketType, 'id' | 'created_at'>>;
export type TicketOrderUpdate = Partial<Omit<TicketOrder, 'id' | 'created_at'>>;
export type TicketUpdate = Partial<Omit<Ticket, 'id' | 'created_at'>>;

// ===========================================
// EXTENDED/JOINED TYPES
// ===========================================

export interface TicketOrderWithTickets extends TicketOrder {
  tickets: Ticket[];
  event: Event;
}

export interface TicketWithDetails extends Ticket {
  ticket_type: TicketType;
  order: TicketOrder;
  event: Event;
}

export interface TicketTypeWithEvent extends TicketType {
  event: Event;
}

// ===========================================
// HELPER TYPES
// ===========================================

export interface TicketOrderItem {
  ticket_type_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface CheckInResult {
  success: boolean;
  ticket?: Ticket;
  error?: string;
  already_checked_in?: boolean;
}
