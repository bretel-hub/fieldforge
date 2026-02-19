-- Migration: Add partners and partner_costs tables
-- Run this in the Supabase SQL Editor if you already have the original schema applied
-- (safe to run multiple times due to IF NOT EXISTS)

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

-- Index for partner_costs lookups
CREATE INDEX IF NOT EXISTS idx_partner_costs_partner_id ON partner_costs(partner_id);

-- Auto-update trigger for partners.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
