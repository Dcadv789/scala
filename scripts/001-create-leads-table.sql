-- Create leads table to store funnel submissions
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  business_type VARCHAR(100),
  goal TEXT,
  timeline VARCHAR(50),
  budget VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
