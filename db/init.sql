
SELECT 'CREATE DATABASE gym_management'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'gym_management'
)\gexec

-- Switch context to the app database
\connect gym_management

-- Apply full schema (tables, ENUMs, indexes, triggers)
\i /docker-entrypoint-initdb.d/schema.sql
