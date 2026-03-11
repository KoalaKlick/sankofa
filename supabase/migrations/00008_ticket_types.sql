-- Migration: Create Ticket Types & Purchases Tables
-- Description: Tables for ticketed events functionality

-- ===========================================
-- TICKET TYPES (pricing tiers)
-- ===========================================
CREATE TYPE ticket_status AS ENUM ('available', 'sold_out', 'hidden', 'expired');

CREATE TABLE public.ticket_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  
  -- Ticket info
  name        TEXT NOT NULL,                       -- e.g., "Early Bird", "VIP", "Regular"
  description TEXT,
  
  -- Pricing
  price       DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency    TEXT DEFAULT 'NGN',
  
  -- Availability
  quantity_total     INTEGER,                      -- NULL = unlimited
  quantity_sold      INTEGER DEFAULT 0,
  quantity_available INTEGER GENERATED ALWAYS AS (
    CASE WHEN quantity_total IS NULL THEN NULL
         ELSE quantity_total - quantity_sold
    END
  ) STORED,
  
  -- Sales window
  sales_start TIMESTAMPTZ,
  sales_end   TIMESTAMPTZ,
  
  -- Limits
  max_per_order INTEGER DEFAULT 10,
  min_per_order INTEGER DEFAULT 1,
  
  -- Status
  status      ticket_status DEFAULT 'available',
  
  -- Display
  order_idx   INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_types_event ON public.ticket_types(event_id);
CREATE INDEX idx_ticket_types_status ON public.ticket_types(status);

ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_ticket_types_updated_at
  BEFORE UPDATE ON public.ticket_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- TICKET ORDERS (purchases)
-- ===========================================
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'confirmed', 'cancelled', 'refunded');

CREATE TABLE public.ticket_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  buyer_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Order reference
  order_number    TEXT UNIQUE NOT NULL,            -- Human-readable order number
  
  -- Buyer info (in case not logged in)
  buyer_email     TEXT NOT NULL,
  buyer_name      TEXT,
  buyer_phone     TEXT,
  
  -- Pricing
  subtotal        DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  fees            DECIMAL(10,2) DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL,
  currency        TEXT DEFAULT 'NGN',
  
  -- Payment
  payment_method  TEXT,
  payment_reference TEXT,
  paid_at         TIMESTAMPTZ,
  
  -- Status
  status          order_status DEFAULT 'pending',
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_orders_event ON public.ticket_orders(event_id);
CREATE INDEX idx_ticket_orders_buyer ON public.ticket_orders(buyer_id);
CREATE INDEX idx_ticket_orders_status ON public.ticket_orders(status);
CREATE INDEX idx_ticket_orders_number ON public.ticket_orders(order_number);

ALTER TABLE public.ticket_orders ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_ticket_orders_updated_at
  BEFORE UPDATE ON public.ticket_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- TICKETS (individual tickets from orders)
-- ===========================================
CREATE TYPE ticket_check_in_status AS ENUM ('not_checked_in', 'checked_in', 'cancelled');

CREATE TABLE public.tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.ticket_orders(id) ON DELETE CASCADE,
  event_id        UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_type_id  UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE CASCADE,
  
  -- Ticket identification
  ticket_code     TEXT UNIQUE NOT NULL,            -- QR code value
  
  -- Attendee info
  attendee_name   TEXT,
  attendee_email  TEXT,
  
  -- Check-in
  check_in_status ticket_check_in_status DEFAULT 'not_checked_in',
  checked_in_at   TIMESTAMPTZ,
  checked_in_by   UUID REFERENCES public.profiles(id),
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tickets_order ON public.tickets(order_id);
CREATE INDEX idx_tickets_event ON public.tickets(event_id);
CREATE INDEX idx_tickets_type ON public.tickets(ticket_type_id);
CREATE INDEX idx_tickets_code ON public.tickets(ticket_code);
CREATE INDEX idx_tickets_check_in ON public.tickets(check_in_status);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- FUNCTIONS: Generate order/ticket codes
-- ===========================================
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  random_part TEXT;
BEGIN
  -- Format: AFT-YYYYMMDD-XXXXX (e.g., AFT-20260310-A3B2C)
  prefix := 'AFT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
  random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 5));
  NEW.order_number := prefix || random_part;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.ticket_orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION public.generate_order_number();

CREATE OR REPLACE FUNCTION public.generate_ticket_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Format: TKT-XXXXXXXXXXXXX (16 char alphanumeric)
  NEW.ticket_code := 'TKT-' || UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT) FROM 1 FOR 12));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_ticket_code_trigger
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  WHEN (NEW.ticket_code IS NULL)
  EXECUTE FUNCTION public.generate_ticket_code();
