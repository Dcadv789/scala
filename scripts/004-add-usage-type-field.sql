-- Add usage_type column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS usage_type TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN leads.usage_type IS 'Type of API usage: mass dispatch, chatbot/passive, both, or undecided';
