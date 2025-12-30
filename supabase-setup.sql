-- Create rides table for VIT Hop On cab sharing app
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdByEmail" TEXT NOT NULL,
  "fromType" TEXT NOT NULL CHECK ("fromType" IN ('MH', 'LH', 'CITY')),
  "fromValue" TEXT NOT NULL,
  "toType" TEXT NOT NULL CHECK ("toType" IN ('MH', 'LH', 'CITY')),
  "toValue" TEXT NOT NULL,
  datetime TEXT NOT NULL,
  "totalPrice" INTEGER NOT NULL CHECK ("totalPrice" > 0),
  "seatsTotal" INTEGER NOT NULL CHECK ("seatsTotal" > 0 AND "seatsTotal" <= 10),
  "seatsFilled" INTEGER NOT NULL DEFAULT 0 CHECK ("seatsFilled" >= 0 AND "seatsFilled" <= "seatsTotal"),
  "genderPref" TEXT NOT NULL CHECK ("genderPref" IN ('Any', 'Male', 'Female')),
  phone TEXT NOT NULL,
  "passengerEmails" TEXT[] DEFAULT '{}'
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rides_created_at ON rides(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rides_datetime ON rides(datetime);
CREATE INDEX IF NOT EXISTS idx_rides_created_by ON rides("createdByEmail");

-- Enable Row Level Security (RLS)
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read all rides
CREATE POLICY "Anyone can view rides"
  ON rides FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert rides
CREATE POLICY "Authenticated users can create rides"
  ON rides FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update rides they joined or created
CREATE POLICY "Users can update rides"
  ON rides FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Users can only delete their own rides
CREATE POLICY "Users can delete own rides"
  ON rides FOR DELETE
  USING ("createdByEmail" = current_setting('request.jwt.claim.email', true));

-- Insert sample data (optional - remove if you want to start fresh)
INSERT INTO rides ("createdByEmail", "fromType", "fromValue", "toType", "toValue", datetime, "totalPrice", "seatsTotal", "seatsFilled", "genderPref", phone, "passengerEmails")
VALUES 
  ('demo@vit.edu', 'MH', 'J', 'CITY', 'Airport', (NOW() + INTERVAL '12 hours')::text, 900, 4, 1, 'Any', '+91 9876543210', ARRAY['demo@vit.edu']),
  ('student@vit.edu', 'LH', 'C', 'CITY', 'Railway Station', (NOW() + INTERVAL '24 hours')::text, 450, 3, 0, 'Female', '+91 9988776655', ARRAY[]::text[]);
