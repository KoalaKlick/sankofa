-- Migration: Update Organizations Branding
-- Description: Add banner image and secondary brand color to organizations

-- Add banner image column
ALTER TABLE public.organizations
ADD COLUMN banner_url TEXT;

-- Rename brand_color to primary_color for clarity
ALTER TABLE public.organizations
RENAME COLUMN brand_color TO primary_color;

-- Add secondary brand color
ALTER TABLE public.organizations
ADD COLUMN secondary_color TEXT DEFAULT '#1e293b';

-- Add favicon for organization
ALTER TABLE public.organizations
ADD COLUMN favicon_url TEXT;

-- Comment on columns for documentation
COMMENT ON COLUMN public.organizations.logo_url IS 'Organization logo (recommended: square, min 256x256px)';
COMMENT ON COLUMN public.organizations.banner_url IS 'Organization banner/cover image (recommended: 1200x400px)';
COMMENT ON COLUMN public.organizations.primary_color IS 'Primary brand color in hex format (e.g., #6366f1)';
COMMENT ON COLUMN public.organizations.secondary_color IS 'Secondary brand color in hex format (e.g., #1e293b)';
COMMENT ON COLUMN public.organizations.favicon_url IS 'Organization favicon (recommended: 32x32px or 64x64px)';
