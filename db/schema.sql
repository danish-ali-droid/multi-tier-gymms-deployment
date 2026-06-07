-- =============================================================================
-- GymMS — PostgreSQL Database Schema
-- =============================================================================
-- Run order: schema.sql → seed.sql
-- Compatible: PostgreSQL 14+
--
-- Tables
--   1. Users        — accounts for all roles (admin / staff / trainer / member)
--   2. Trainers     — trainer profile extending Users
--   3. Members      — member profile + membership details extending Users
--   4. Payments     — payment records linked to Members
--   5. Attendances  — check-in / check-out records linked to Members
--
-- Indexes are created at the end for readability.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- trigram index for ILIKE search

-- -----------------------------------------------------------------------------
-- Custom ENUM types
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  -- User roles
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'staff', 'member', 'trainer');
  END IF;

  -- Membership tiers
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_type') THEN
    CREATE TYPE membership_type AS ENUM ('basic', 'standard', 'premium', 'vip');
  END IF;

  -- Member account status
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_status') THEN
    CREATE TYPE member_status AS ENUM ('active', 'inactive', 'suspended', 'expired');
  END IF;

  -- Payment lifecycle status
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
  END IF;

  -- Payment methods
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('cash', 'card', 'bank_transfer', 'online');
  END IF;
END
$$;

-- =============================================================================
-- 1. Users
-- =============================================================================
CREATE TABLE IF NOT EXISTS "Users" (
  "id"                UUID          NOT NULL DEFAULT gen_random_uuid(),
  "name"              VARCHAR(100)  NOT NULL,
  "email"             VARCHAR(255)  NOT NULL,
  "password_hash"     VARCHAR(255)  NOT NULL,
  "role"              user_role     NOT NULL DEFAULT 'member',
  "profile_image_url" TEXT,
  "is_active"         BOOLEAN       NOT NULL DEFAULT TRUE,
  "last_login"        TIMESTAMPTZ,
  "createdAt"         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT "Users_pkey"        PRIMARY KEY ("id"),
  CONSTRAINT "Users_email_uq"    UNIQUE      ("email"),
  CONSTRAINT "Users_name_len"    CHECK       (char_length("name") >= 2),
  CONSTRAINT "Users_email_fmt"   CHECK       ("email" ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

COMMENT ON TABLE  "Users"                IS 'All system accounts — admins, staff, trainers, and members.';
COMMENT ON COLUMN "Users"."role"         IS 'RBAC role: admin > staff > trainer > member';
COMMENT ON COLUMN "Users"."is_active"    IS 'Soft-delete flag; set to FALSE instead of deleting rows.';
COMMENT ON COLUMN "Users"."password_hash" IS 'bcrypt hash (cost 12). Never store plaintext.';

-- =============================================================================
-- 2. Trainers
-- =============================================================================
CREATE TABLE IF NOT EXISTS "Trainers" (
  "id"               UUID           NOT NULL DEFAULT gen_random_uuid(),
  "user_id"          UUID           NOT NULL,
  "specialization"   TEXT[]         NOT NULL DEFAULT '{}',
  "experience_years" INTEGER        NOT NULL DEFAULT 0,
  "bio"              TEXT,
  "certifications"   TEXT[]         NOT NULL DEFAULT '{}',
  "hourly_rate"      NUMERIC(10, 2),
  "is_available"     BOOLEAN        NOT NULL DEFAULT TRUE,
  "rating"           NUMERIC(3, 2),
  "createdAt"        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  "updatedAt"        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT "Trainers_pkey"              PRIMARY KEY ("id"),
  CONSTRAINT "Trainers_user_id_fk"        FOREIGN KEY ("user_id")
                                            REFERENCES "Users" ("id")
                                            ON DELETE CASCADE
                                            ON UPDATE CASCADE,
  CONSTRAINT "Trainers_experience_range"  CHECK ("experience_years" BETWEEN 0 AND 60),
  CONSTRAINT "Trainers_rating_range"      CHECK ("rating" IS NULL OR "rating" BETWEEN 0.00 AND 5.00),
  CONSTRAINT "Trainers_hourly_rate_pos"   CHECK ("hourly_rate" IS NULL OR "hourly_rate" >= 0)
);

COMMENT ON TABLE  "Trainers"                   IS 'Trainer profiles linked 1-to-1 with a Users row (role=trainer).';
COMMENT ON COLUMN "Trainers"."specialization"  IS 'Array of discipline tags e.g. {Yoga, HIIT, Nutrition}.';
COMMENT ON COLUMN "Trainers"."certifications"  IS 'Array of certification labels e.g. {ACE CPT, NSCA-CSCS}.';

-- =============================================================================
-- 3. Members
-- =============================================================================
CREATE TABLE IF NOT EXISTS "Members" (
  "id"                   UUID            NOT NULL DEFAULT gen_random_uuid(),
  "user_id"              UUID            NOT NULL,
  "membership_type"      membership_type NOT NULL DEFAULT 'basic',
  "start_date"           DATE            NOT NULL,
  "end_date"             DATE            NOT NULL,
  "status"               member_status   NOT NULL DEFAULT 'active',
  "phone"                VARCHAR(20),
  "emergency_contact"    VARCHAR(100),
  "health_notes"         TEXT,
  "assigned_trainer_id"  UUID,
  "createdAt"            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  "updatedAt"            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  CONSTRAINT "Members_pkey"               PRIMARY KEY ("id"),
  CONSTRAINT "Members_user_id_fk"         FOREIGN KEY ("user_id")
                                            REFERENCES "Users" ("id")
                                            ON DELETE CASCADE
                                            ON UPDATE CASCADE,
  CONSTRAINT "Members_trainer_fk"         FOREIGN KEY ("assigned_trainer_id")
                                            REFERENCES "Trainers" ("id")
                                            ON DELETE SET NULL
                                            ON UPDATE CASCADE,
  CONSTRAINT "Members_dates_order"        CHECK ("end_date" >= "start_date")
);

COMMENT ON TABLE  "Members"                      IS 'Gym member profiles linked 1-to-1 with a Users row (role=member).';
COMMENT ON COLUMN "Members"."membership_type"    IS 'Plan tier: basic $29.99 | standard $59.99 | premium $99.99 | vip $149.99 /mo.';
COMMENT ON COLUMN "Members"."assigned_trainer_id" IS 'Optional FK to Trainers. NULL when no trainer is assigned.';

-- =============================================================================
-- 4. Payments
-- =============================================================================
CREATE TABLE IF NOT EXISTS "Payments" (
  "id"               UUID            NOT NULL DEFAULT gen_random_uuid(),
  "member_id"        UUID            NOT NULL,
  "amount"           NUMERIC(10, 2)  NOT NULL,
  "payment_date"     DATE            NOT NULL,
  "due_date"         DATE,
  "status"           payment_status  NOT NULL DEFAULT 'pending',
  "payment_method"   payment_method  NOT NULL DEFAULT 'cash',
  "description"      VARCHAR(255),
  "transaction_id"   VARCHAR(100),
  "createdAt"        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  "updatedAt"        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  CONSTRAINT "Payments_pkey"           PRIMARY KEY ("id"),
  CONSTRAINT "Payments_member_id_fk"   FOREIGN KEY ("member_id")
                                         REFERENCES "Members" ("id")
                                         ON DELETE CASCADE
                                         ON UPDATE CASCADE,
  CONSTRAINT "Payments_txn_id_uq"      UNIQUE      ("transaction_id"),
  CONSTRAINT "Payments_amount_pos"     CHECK       ("amount" >= 0)
);

COMMENT ON TABLE  "Payments"                IS 'All financial transactions linked to a member.';
COMMENT ON COLUMN "Payments"."transaction_id" IS 'Unique external reference (e.g. TXN-3F9A2C). NULL until confirmed.';

-- =============================================================================
-- 5. Attendances
-- =============================================================================
CREATE TABLE IF NOT EXISTS "Attendances" (
  "id"         UUID         NOT NULL DEFAULT gen_random_uuid(),
  "member_id"  UUID         NOT NULL,
  "check_in"   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "check_out"  TIMESTAMPTZ,
  "notes"      TEXT,
  "createdAt"  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT "Attendances_pkey"          PRIMARY KEY ("id"),
  CONSTRAINT "Attendances_member_id_fk"  FOREIGN KEY ("member_id")
                                           REFERENCES "Members" ("id")
                                           ON DELETE CASCADE
                                           ON UPDATE CASCADE,
  CONSTRAINT "Attendances_checkout_after" CHECK (
    "check_out" IS NULL OR "check_out" > "check_in"
  )
);

COMMENT ON TABLE  "Attendances"            IS 'Gym visit log. check_out is NULL while the member is still present.';
COMMENT ON COLUMN "Attendances"."check_out" IS 'NULL = member still checked in. Set on departure.';

-- =============================================================================
-- Sequelize migration tracking table (keeps npx sequelize-cli in sync)
-- =============================================================================
CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
  "name" VARCHAR(255) NOT NULL,
  CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY ("name")
);

-- =============================================================================
-- Indexes
-- =============================================================================

-- Users
CREATE INDEX IF NOT EXISTS "idx_users_role"      ON "Users" ("role");
CREATE INDEX IF NOT EXISTS "idx_users_is_active" ON "Users" ("is_active");
-- Fast trigram search on name and email (supports ILIKE '%...%')
CREATE INDEX IF NOT EXISTS "idx_users_name_trgm"  ON "Users" USING gin ("name"  gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "idx_users_email_trgm" ON "Users" USING gin ("email" gin_trgm_ops);

-- Trainers
CREATE INDEX IF NOT EXISTS "idx_trainers_user_id"     ON "Trainers" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_trainers_is_available" ON "Trainers" ("is_available");

-- Members
CREATE INDEX IF NOT EXISTS "idx_members_user_id"          ON "Members" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_members_status"           ON "Members" ("status");
CREATE INDEX IF NOT EXISTS "idx_members_membership_type"  ON "Members" ("membership_type");
CREATE INDEX IF NOT EXISTS "idx_members_end_date"         ON "Members" ("end_date");
-- Composite index for the "expiring soon" dashboard query
CREATE INDEX IF NOT EXISTS "idx_members_status_end_date"
  ON "Members" ("status", "end_date")
  WHERE "status" = 'active';

-- Payments
CREATE INDEX IF NOT EXISTS "idx_payments_member_id"    ON "Payments" ("member_id");
CREATE INDEX IF NOT EXISTS "idx_payments_status"       ON "Payments" ("status");
CREATE INDEX IF NOT EXISTS "idx_payments_payment_date" ON "Payments" ("payment_date");
-- Composite for monthly revenue aggregation
CREATE INDEX IF NOT EXISTS "idx_payments_status_date"
  ON "Payments" ("status", "payment_date")
  WHERE "status" = 'completed';

-- Attendances
CREATE INDEX IF NOT EXISTS "idx_attendances_member_id" ON "Attendances" ("member_id");
CREATE INDEX IF NOT EXISTS "idx_attendances_check_in"  ON "Attendances" ("check_in");
-- Fast lookup for "is member currently checked in?"
CREATE INDEX IF NOT EXISTS "idx_attendances_open_sessions"
  ON "Attendances" ("member_id", "check_in")
  WHERE "check_out" IS NULL;

-- =============================================================================
-- Updated-at trigger (auto-maintain updatedAt on every UPDATE)
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['"Users"', '"Trainers"', '"Members"', '"Payments"', '"Attendances"']
  LOOP
    EXECUTE format(
      'CREATE OR REPLACE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
      replace(replace(t, '"', ''), ' ', '_'),
      t
    );
  END LOOP;
END;
$$;
