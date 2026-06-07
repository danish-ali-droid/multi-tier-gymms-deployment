-- =============================================================================
-- GymMS — PostgreSQL Database Seed Data
-- =============================================================================
-- Run order: schema.sql → seed.sql
-- Compatible: PostgreSQL 14+
--
-- Seeding:
--   1. Users        - Admin, Staff, 3 Trainers, 5 Members
--   2. Trainers     - Profiles for trainers linked to Users
--   3. Members      - Profiles for members linked to Users
--   4. Payments     - 6 months of payment history for active members
--   5. Attendances  - Logged attendance entries for the last 2 days
-- =============================================================================

-- Switch context to the app database
\connect gym_management

-- Clean existing data to ensure idempotency (can run seed.sql multiple times)
TRUNCATE TABLE "Attendances", "Payments", "Members", "Trainers", "Users" CASCADE;

-- -----------------------------------------------------------------------------
-- 1. Users
-- -----------------------------------------------------------------------------
INSERT INTO "Users" (
  "id",
  "name",
  "email",
  "password_hash",
  "role",
  "profile_image_url",
  "is_active",
  "last_login",
  "createdAt",
  "updatedAt"
) VALUES
-- Admin
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Alex Morgan',
  'admin@gymms.com',
  '$2b$12$7RidF7cEx6RdT.rnQDfNJ.io0TVvZutIBeg2SGjP5wtNzYHzGWcu6',
  'admin',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
  TRUE,
  NULL,
  NOW(),
  NOW()
),
-- Staff
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  'Jordan Lee',
  'staff@gymms.com',
  '$2b$12$7RidF7cEx6RdT.rnQDfNJ.io0TVvZutIBeg2SGjP5wtNzYHzGWcu6',
  'staff',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  TRUE,
  NULL,
  NOW(),
  NOW()
),
-- Trainer 1
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
  'Marcus Rivera',
  'marcus@gymms.com',
  '$2b$12$7RidF7cEx6RdT.rnQDfNJ.io0TVvZutIBeg2SGjP5wtNzYHzGWcu6',
  'trainer',
  'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=150&h=150&fit=crop&crop=face',
  TRUE,
  NULL,
  NOW(),
  NOW()
),
-- Trainer 2
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'Sofia Chen',
  'sofia@gymms.com',
  '$2b$12$7RidF7cEx6RdT.rnQDfNJ.io0TVvZutIBeg2SGjP5wtNzYHzGWcu6',
  'trainer',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  TRUE,
  NULL,
  NOW(),
  NOW()
),
-- Trainer 3
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
  'Darius Thompson',
  'darius@gymms.com',
  '$2b$12$7RidF7cEx6RdT.rnQDfNJ.io0TVvZutIBeg2SGjP5wtNzYHzGWcu6',
  'trainer',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  TRUE,
  NULL,
  NOW(),
  NOW()
),
-- Member 1 (Active, assigned to Trainer 1)
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
  'Chris Johnson',
  'chris@example.com',
  '$2b$12$2vbgg./OXM.339//B9RnL.cyMebJYWyormjHYLVtZ7e3oAp1Wc4SS',
  'member',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face',
  TRUE,
  NULL,
  NOW(),
  NOW()
),
-- Member 2 (Active, assigned to Trainer 2)
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32',
  'Emily Watson',
  'emily@example.com',
  '$2b$12$2vbgg./OXM.339//B9RnL.cyMebJYWyormjHYLVtZ7e3oAp1Wc4SS',
  'member',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  TRUE,
  NULL,
  NOW(),
  NOW()
),
-- Member 3 (Active, expiring soon, assigned to Trainer 3)
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'Jake Martinez',
  'jake@example.com',
  '$2b$12$2vbgg./OXM.339//B9RnL.cyMebJYWyormjHYLVtZ7e3oAp1Wc4SS',
  'member',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  TRUE,
  NULL,
  NOW(),
  NOW()
),
-- Member 4 (Active, no trainer)
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34',
  'Priya Patel',
  'priya@example.com',
  '$2b$12$2vbgg./OXM.339//B9RnL.cyMebJYWyormjHYLVtZ7e3oAp1Wc4SS',
  'member',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
  TRUE,
  NULL,
  NOW(),
  NOW()
),
-- Member 5 (Expired, inactive account)
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35',
  'Ryan O''Brien',
  'ryan@example.com',
  '$2b$12$2vbgg./OXM.339//B9RnL.cyMebJYWyormjHYLVtZ7e3oAp1Wc4SS',
  'member',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
  FALSE,
  NULL,
  NOW(),
  NOW()
);

-- -----------------------------------------------------------------------------
-- 2. Trainers
-- -----------------------------------------------------------------------------
INSERT INTO "Trainers" (
  "id",
  "user_id",
  "specialization",
  "experience_years",
  "bio",
  "certifications",
  "hourly_rate",
  "is_available",
  "rating",
  "createdAt",
  "updatedAt"
) VALUES
(
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
  ARRAY['Strength Training', 'Powerlifting', 'Nutrition'],
  8,
  'Certified strength coach with 8 years of experience helping athletes and beginners reach their peak performance.',
  ARRAY['NSCA-CSCS', 'ACE CPT'],
  75.00,
  TRUE,
  4.90,
  NOW(),
  NOW()
),
(
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  ARRAY['Yoga', 'Pilates', 'Flexibility'],
  6,
  'Yoga and Pilates specialist focused on mindfulness, flexibility, and holistic wellness.',
  ARRAY['RYT-500', 'ACE CPT', 'NASM CES'],
  65.00,
  TRUE,
  4.80,
  NOW(),
  NOW()
),
(
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
  ARRAY['HIIT', 'Cardio', 'Weight Loss'],
  5,
  'High-energy HIIT trainer dedicated to helping members achieve rapid fat loss and cardiovascular fitness.',
  ARRAY['ACE CPT', 'Precision Nutrition L1'],
  60.00,
  TRUE,
  4.70,
  NOW(),
  NOW()
);

-- -----------------------------------------------------------------------------
-- 3. Members
-- -----------------------------------------------------------------------------
INSERT INTO "Members" (
  "id",
  "user_id",
  "membership_type",
  "start_date",
  "end_date",
  "status",
  "phone",
  "emergency_contact",
  "health_notes",
  "assigned_trainer_id",
  "createdAt",
  "updatedAt"
) VALUES
-- Member 1: Premium
(
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
  'premium',
  (CURRENT_DATE - INTERVAL '3 months')::DATE,
  (CURRENT_DATE + INTERVAL '9 months')::DATE,
  'active',
  '+1-555-0101',
  'Lisa Johnson: +1-555-0102',
  'Mild knee injury - avoid heavy squats',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
  NOW(),
  NOW()
),
-- Member 2: Standard
(
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32',
  'standard',
  (CURRENT_DATE - INTERVAL '3 months')::DATE,
  (CURRENT_DATE + INTERVAL '6 months')::DATE,
  'active',
  '+1-555-0201',
  NULL,
  NULL,
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  NOW(),
  NOW()
),
-- Member 3: VIP (Expiring soon - 5 days)
(
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'vip',
  (CURRENT_DATE - INTERVAL '3 months')::DATE,
  (CURRENT_DATE + INTERVAL '5 days')::DATE,
  'active',
  '+1-555-0301',
  'Ana Martinez: +1-555-0302',
  NULL,
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
  NOW(),
  NOW()
),
-- Member 4: Basic
(
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34',
  'basic',
  (CURRENT_DATE - INTERVAL '3 months')::DATE,
  (CURRENT_DATE + INTERVAL '6 months')::DATE,
  'active',
  '+1-555-0401',
  NULL,
  'Vegetarian - nutrition plan needs adjustment',
  NULL,
  NOW(),
  NOW()
),
-- Member 5: Basic (Expired 1 month ago)
(
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35',
  'basic',
  (CURRENT_DATE - INTERVAL '3 months')::DATE,
  (CURRENT_DATE - INTERVAL '1 month')::DATE,
  'expired',
  '+1-555-0501',
  NULL,
  NULL,
  NULL,
  NOW(),
  NOW()
);

-- -----------------------------------------------------------------------------
-- 4. Payments (6 months of payment history for Member 1, 2, and 3)
-- -----------------------------------------------------------------------------
INSERT INTO "Payments" (
  "id",
  "member_id",
  "amount",
  "payment_date",
  "due_date",
  "status",
  "payment_method",
  "description",
  "transaction_id",
  "createdAt",
  "updatedAt"
) VALUES
-- Month 0 (Current Month)
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 99.99, (CURRENT_DATE - INTERVAL '0 month')::DATE, NULL, 'completed', 'card', 'Premium Monthly Membership', 'TXN-PAY0M001', NOW(), NOW()),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 59.99, (CURRENT_DATE - INTERVAL '0 month')::DATE, NULL, 'pending', 'cash', 'Standard Monthly Membership', 'TXN-PAY0M002', NOW(), NOW()),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 149.99, (CURRENT_DATE - INTERVAL '0 month')::DATE, NULL, 'completed', 'bank_transfer', 'VIP Monthly Membership', 'TXN-PAY0M003', NOW(), NOW()),

-- Month 1
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 99.99, (CURRENT_DATE - INTERVAL '1 month')::DATE, NULL, 'completed', 'card', 'Premium Monthly Membership', 'TXN-PAY1M001', NOW(), NOW()),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 59.99, (CURRENT_DATE - INTERVAL '1 month')::DATE, NULL, 'completed', 'cash', 'Standard Monthly Membership', 'TXN-PAY1M002', NOW(), NOW()),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 149.99, (CURRENT_DATE - INTERVAL '1 month')::DATE, NULL, 'completed', 'bank_transfer', 'VIP Monthly Membership', 'TXN-PAY1M003', NOW(), NOW()),

-- Month 2
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 99.99, (CURRENT_DATE - INTERVAL '2 month')::DATE, NULL, 'completed', 'card', 'Premium Monthly Membership', 'TXN-PAY2M001', NOW(), NOW()),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 59.99, (CURRENT_DATE - INTERVAL '2 month')::DATE, NULL, 'completed', 'cash', 'Standard Monthly Membership', 'TXN-PAY2M002', NOW(), NOW()),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 149.99, (CURRENT_DATE - INTERVAL '2 month')::DATE, NULL, 'completed', 'bank_transfer', 'VIP Monthly Membership', 'TXN-PAY2M003', NOW(), NOW()),

-- Month 3
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 99.99, (CURRENT_DATE - INTERVAL '3 month')::DATE, NULL, 'completed', 'card', 'Premium Monthly Membership', 'TXN-PAY3M001', NOW(), NOW()),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 59.99, (CURRENT_DATE - INTERVAL '3 month')::DATE, NULL, 'completed', 'cash', 'Standard Monthly Membership', 'TXN-PAY3M002', NOW(), NOW()),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 149.99, (CURRENT_DATE - INTERVAL '3 month')::DATE, NULL, 'completed', 'bank_transfer', 'VIP Monthly Membership', 'TXN-PAY3M003', NOW(), NOW()),

-- Month 4
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 99.99, (CURRENT_DATE - INTERVAL '4 month')::DATE, NULL, 'completed', 'card', 'Premium Monthly Membership', 'TXN-PAY4M001', NOW(), NOW()),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 59.99, (CURRENT_DATE - INTERVAL '4 month')::DATE, NULL, 'completed', 'cash', 'Standard Monthly Membership', 'TXN-PAY4M002', NOW(), NOW()),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 149.99, (CURRENT_DATE - INTERVAL '4 month')::DATE, NULL, 'completed', 'bank_transfer', 'VIP Monthly Membership', 'TXN-PAY4M003', NOW(), NOW()),

-- Month 5
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 99.99, (CURRENT_DATE - INTERVAL '5 month')::DATE, NULL, 'completed', 'card', 'Premium Monthly Membership', 'TXN-PAY5M001', NOW(), NOW()),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 59.99, (CURRENT_DATE - INTERVAL '5 month')::DATE, NULL, 'completed', 'cash', 'Standard Monthly Membership', 'TXN-PAY5M002', NOW(), NOW()),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 149.99, (CURRENT_DATE - INTERVAL '5 month')::DATE, NULL, 'completed', 'bank_transfer', 'VIP Monthly Membership', 'TXN-PAY5M003', NOW(), NOW());

-- -----------------------------------------------------------------------------
-- 5. Attendances
-- -----------------------------------------------------------------------------
INSERT INTO "Attendances" (
  "id",
  "member_id",
  "check_in",
  "check_out",
  "notes",
  "createdAt",
  "updatedAt"
) VALUES
-- Member 1: Yesterday Session
(
  gen_random_uuid(),
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
  CURRENT_DATE - INTERVAL '1 day' + INTERVAL '8 hours 30 minutes',
  CURRENT_DATE - INTERVAL '1 day' + INTERVAL '10 hours 15 minutes',
  'Focus on upper body strength today.',
  NOW(),
  NOW()
),
-- Member 1: Today Session
(
  gen_random_uuid(),
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
  CURRENT_DATE + INTERVAL '8 hours',
  CURRENT_DATE + INTERVAL '9 hours 30 minutes',
  'Cardio session completed.',
  NOW(),
  NOW()
),
-- Member 2: Yesterday Session
(
  gen_random_uuid(),
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32',
  CURRENT_DATE - INTERVAL '1 day' + INTERVAL '9 hours 15 minutes',
  CURRENT_DATE - INTERVAL '1 day' + INTERVAL '11 hours',
  'Yoga practice with Sofia Chen.',
  NOW(),
  NOW()
),
-- Member 2: Today Session (Still active check-in)
(
  gen_random_uuid(),
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32',
  CURRENT_DATE + INTERVAL '9 hours',
  NULL,
  'Currently training.',
  NOW(),
  NOW()
),
-- Member 3: Yesterday Session
(
  gen_random_uuid(),
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  CURRENT_DATE - INTERVAL '1 day' + INTERVAL '18 hours 30 minutes',
  CURRENT_DATE - INTERVAL '1 day' + INTERVAL '20 hours',
  'HIIT workout.',
  NOW(),
  NOW()
),
-- Member 4: Today Session (Still active check-in)
(
  gen_random_uuid(),
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34',
  CURRENT_DATE + INTERVAL '10 hours',
  NULL,
  'First day check-in.',
  NOW(),
  NOW()
);
