-- Add new columns to leads table for service type and automation system
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS current_volume TEXT,
ADD COLUMN IF NOT EXISTS service_type TEXT,
ADD COLUMN IF NOT EXISTS automation_system TEXT;

-- Add comment for documentation
COMMENT ON COLUMN leads.service_type IS 'Whether lead wants to rent or purchase WhatsApp number';
COMMENT ON COLUMN leads.automation_system IS 'Existing automation system being used';
