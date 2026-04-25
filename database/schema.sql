-- MANNAT Lodge - Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor

-- ═══════════════════════════════════════
-- TABLES
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(15),
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(500) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number VARCHAR(10) UNIQUE NOT NULL,
  room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('standard', 'deluxe', 'suite')),
  capacity INT NOT NULL CHECK (capacity BETWEEN 1 AND 6),
  price_per_night DECIMAL(10, 2) NOT NULL,
  amenities JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  age INT NOT NULL, -- calculated in API (AGE() not usable in generated columns)
  id_type VARCHAR(50) NOT NULL CHECK (id_type IN ('aadhar', 'pan', 'passport', 'voter_id', 'driving_license')),
  id_number VARCHAR(50) NOT NULL,
  id_proof_url VARCHAR(500),
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_guests INT NOT NULL CHECK (number_of_guests BETWEEN 1 AND 6),
  total_nights INT GENERATED ALWAYS AS ((check_out_date - check_in_date)) STORED,
  total_price DECIMAL(10, 2) NOT NULL,
  booking_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
  payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  admin_approval_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (admin_approval_status IN ('pending', 'approved', 'rejected')),
  guest_notes TEXT,
  admin_notes TEXT,
  approved_at TIMESTAMP,
  approved_by_admin_id UUID REFERENCES admin_users(id),
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_dates CHECK (check_out_date > check_in_date)
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  razorpay_order_id VARCHAR(100) UNIQUE NOT NULL,
  razorpay_payment_id VARCHAR(100),
  razorpay_signature VARCHAR(300),
  amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'successful', 'failed', 'refunded')),
  payment_method VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  availability_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  booked_by_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, availability_date)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in_date ON bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out_date ON bookings(check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_admin_approval_status ON bookings(admin_approval_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_room_availability_room_id ON room_availability(room_id);
CREATE INDEX IF NOT EXISTS idx_room_availability_date ON room_availability(availability_date);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);

-- ═══════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Rooms: public read
CREATE POLICY "Rooms are publicly readable" ON rooms FOR SELECT USING (is_active = true);

-- Guests: service role only (backend uses service key)
CREATE POLICY "Guests managed by service" ON guests USING (auth.role() = 'service_role');

-- Bookings: service role only
CREATE POLICY "Bookings managed by service" ON bookings USING (auth.role() = 'service_role');

-- Payments: service role only
CREATE POLICY "Payments managed by service" ON payments USING (auth.role() = 'service_role');

-- Admin users: service role only
CREATE POLICY "Admins managed by service" ON admin_users USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════
-- SAMPLE DATA - 10 ROOMS
-- ═══════════════════════════════════════

INSERT INTO rooms (room_number, room_type, capacity, price_per_night, amenities, description) VALUES
  ('101', 'standard', 2, 2500, '["AC", "WiFi", "TV", "Hot water 24/7"]', 'A cozy river-breeze standard room with modern amenities. Perfect for couples or solo travelers seeking comfort at an honest price.'),
  ('102', 'standard', 2, 2500, '["AC", "WiFi", "TV", "Hot water 24/7"]', 'Clean and bright standard room with city view. Ideal for business travelers who value convenience and simplicity.'),
  ('103', 'standard', 3, 3000, '["AC", "WiFi", "TV", "Balcony", "Hot water 24/7"]', 'Spacious standard room with a private balcony overlooking the lush garden. Perfect for a family of three.'),
  ('104', 'standard', 2, 2800, '["AC", "WiFi", "TV", "Hot water 24/7", "Safe"]', 'Quiet corner standard room with extra privacy. Fitted with an in-room safe for business travelers.'),
  ('201', 'deluxe', 2, 4500, '["AC", "WiFi", "TV", "Balcony", "Hot water 24/7", "Room Service"]', 'Premium deluxe room with a river-facing balcony and heritage wooden furnishings. Watch the Godavari flow from your own space.'),
  ('202', 'deluxe', 3, 5000, '["AC", "WiFi", "TV", "Balcony", "Hot water 24/7", "Room Service", "Mini Bar"]', 'Elegant deluxe room with panoramic Godavari views, curated mini bar, and 24/7 room service.'),
  ('203', 'deluxe', 2, 4500, '["AC", "WiFi", "TV", "Balcony", "Hot water 24/7", "Room Service"]', 'Boutique deluxe room styled with local art and river-view balcony. A perfect blend of culture and comfort.'),
  ('204', 'deluxe', 4, 5500, '["AC", "WiFi", "TV", "Balcony", "Hot water 24/7", "Room Service", "Mini Bar"]', 'Family deluxe room with connected balcony, extra sleeping arrangements, and all modern comforts for a larger family.'),
  ('301', 'suite', 2, 8500, '["AC", "WiFi", "TV", "Balcony", "Hot water 24/7", "Room Service", "Mini Bar", "Jacuzzi", "River View"]', 'Luxury suite with king-size bed, jacuzzi, and full 180° Godavari panorama. The ultimate romantic getaway on the river.'),
  ('302', 'suite', 4, 10000, '["AC", "WiFi", "TV", "Balcony", "Hot water 24/7", "Room Service", "Mini Bar", "Jacuzzi", "River View", "Breakfast"]', 'Presidential suite with separate living area, jacuzzi, complimentary breakfast, and the finest Godavari views MANNAT offers.')
ON CONFLICT (room_number) DO NOTHING;

-- ═══════════════════════════════════════
-- DEFAULT ADMIN (change password after setup!)
-- Password: admin@mannat123 (bcrypt hash)
-- Run: node -e "const b=require('bcryptjs');console.log(b.hashSync('admin@mannat123',10))"
-- Then replace the hash below
-- ═══════════════════════════════════════

INSERT INTO admin_users (email, name, password_hash, role) VALUES
  ('admin@mannat-lodge.com', 'MANNAT Admin', '$2a$10$PLACEHOLDER_REPLACE_WITH_REAL_BCRYPT_HASH', 'admin')
ON CONFLICT (email) DO NOTHING;
