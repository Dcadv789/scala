-- Add WhatsApp API Official fields to connections table
ALTER TABLE connections 
ADD COLUMN IF NOT EXISTS phone_number_id TEXT,
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS waba_id TEXT,
ADD COLUMN IF NOT EXISTS connection_type TEXT DEFAULT 'qrcode',
ADD COLUMN IF NOT EXISTS verified_name TEXT,
ADD COLUMN IF NOT EXISTS display_phone_number TEXT,
ADD COLUMN IF NOT EXISTS verify_token TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_connections_phone_number_id ON connections(phone_number_id);
CREATE INDEX IF NOT EXISTS idx_connections_user_email ON connections(user_email);
