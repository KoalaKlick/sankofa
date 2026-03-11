-- Supabase-specific configurations (Extensions, RLS, Functions)
-- Table structure is managed by Prisma migrations

-- Enable UUID generation functions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable case-insensitive text extension (useful for usernames, slugs)
CREATE EXTENSION IF NOT EXISTS "citext";
