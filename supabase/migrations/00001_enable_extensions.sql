-- Migration: Enable Required Extensions
-- Description: Enable PostgreSQL extensions needed for the application

-- Enable UUID generation functions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable case-insensitive text extension (useful for usernames, slugs)
CREATE EXTENSION IF NOT EXISTS "citext";
