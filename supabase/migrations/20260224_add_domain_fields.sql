-- Add custom domain support and tier classification to workspaces
ALTER TABLE workspaces 
ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subdomain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'agency'));

-- Update existing trial workspaces to 'free' tier if needed
UPDATE workspaces SET tier = 'free' WHERE tier IS NULL;
