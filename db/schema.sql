-- FieldForge Database Schema

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_number VARCHAR(50) UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_contact VARCHAR(255),
  customer_email VARCHAR(255),
  customer_address TEXT,
  
  project_title VARCHAR(255) NOT NULL,
  project_description TEXT,
  project_location VARCHAR(255),
  project_timeline VARCHAR(255),
  
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, viewed, accepted, declined
  
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 4) DEFAULT 0.0875,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Proposal line items table
CREATE TABLE IF NOT EXISTS proposal_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- Labor, Materials, Equipment, Permits, Other
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Partners table
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zip VARCHAR(20),
  insurance_start_date DATE,
  insurance_end_date DATE,
  insurance_document_url TEXT,
  insurance_document_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Partner costs table (multiple cost rates per partner)
CREATE TABLE IF NOT EXISTS partner_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit VARCHAR(100) NOT NULL, -- Hour, Day, Per Person, Sq Ft, Linear Foot, Other
  unit_custom VARCHAR(255),   -- Filled when unit = 'Other'
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_proposals_customer_id ON proposals(customer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposal_line_items_proposal_id ON proposal_line_items(proposal_id);

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_partner_costs_partner_id ON partner_costs(partner_id);

-- Receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_reference TEXT,
  job_id TEXT,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  vendor_name TEXT NOT NULL,
  category TEXT,
  subtotal DECIMAL(10,2),
  tax DECIMAL(10,2),
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  payment_method VARCHAR(100),
  source VARCHAR(50) DEFAULT 'scan', -- scan, email, upload
  status VARCHAR(50) DEFAULT 'inbox', -- inbox, assigned, archived
  media_url TEXT,
  email_id TEXT,
  metadata JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_vendor ON receipts(vendor_name);
CREATE INDEX IF NOT EXISTS idx_receipts_job_id ON receipts(job_id);
CREATE INDEX IF NOT EXISTS idx_receipts_job_reference ON receipts(job_reference);

CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Job photos table (for cross-device sync)
CREATE TABLE IF NOT EXISTS job_photos (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  data_url TEXT,
  mime_type VARCHAR(100) DEFAULT 'image/jpeg',
  size INTEGER DEFAULT 0,
  captured_at TIMESTAMP WITH TIME ZONE,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  accuracy DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_photos_job_id ON job_photos(job_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_captured_at ON job_photos(captured_at DESC);

-- Job notes table (for cross-device sync)
CREATE TABLE IF NOT EXISTS job_notes (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_notes_job_id ON job_notes(job_id);
CREATE INDEX IF NOT EXISTS idx_job_notes_timestamp ON job_notes(timestamp DESC);

-- =============================================================================
-- MIGRATION: receipts.job_id UUID → TEXT
-- Run this on existing databases where the receipts table already exists:
--
--   ALTER TABLE receipts ALTER COLUMN job_id TYPE TEXT;
--
-- This is required because job IDs in the app are text strings (e.g. "JOB-001",
-- "JOB-<proposalUUID>"), not bare UUIDs. The UUID column type caused inserts
-- and queries to fail silently, preventing receipts from persisting to Supabase.
-- =============================================================================
