# GymMS — PostgreSQL Database Setup

This directory contains the database schema, custom initialization logic, and demo seed data for the **Gym Management System (GymMS)** PostgreSQL database.

---

## Directory Structure

*   **`Dockerfile`**: Builds a customized `postgres:16-alpine` image and copies initialization scripts.
*   **`init.sql`**: Entry point script executed on container start to create the database (`gym_management`) and apply the schema.
*   **`schema.sql`**: Complete database schema definitions (tables, custom enums, indexes, and auto-update triggers).
*   **`seed.sql`**: Idempotent SQL script to populate the database with realistic development and testing data.
*   **`.env`**: Database credentials and connection configuration.

---

## Database Schema & Components

The schema is built for **PostgreSQL 14+** and implements the following components:

### 1. Custom Types (ENUMs)
*   `user_role`: `'admin'`, `'staff'`, `'trainer'`, `'member'`
*   `membership_type`: `'basic'`, `'standard'`, `'premium'`, `'vip'`
*   `member_status`: `'active'`, `'inactive'`, `'suspended'`, `'expired'`
*   `payment_status`: `'pending'`, `'completed'`, `'failed'`, `'refunded'`
*   `payment_method`: `'cash'`, `'card'`, `'bank_transfer'`, `'online'`

### 2. Core Tables
*   `Users`: Base accounts for all roles (admins, staff, trainers, and members) with secure bcrypt hash storage.
*   `Trainers`: Trainer profiles linked 1-to-1 with `Users` (role = `'trainer'`).
*   `Members`: Member profiles + membership details linked 1-to-1 with `Users` (role = `'member'`).
*   `Payments`: Financial transaction records linked to `Members`.
*   `Attendances`: Check-in / check-out logs for gym access.

### 3. Triggers & Indexes
*   **Auto-updated Timestamps**: A custom trigger (`update_updated_at`) automatically updates the `updatedAt` field on any record modifications.
*   **Performance Optimization**: Indexes on foreign keys, status fields, and trigram-based indices (`gin_trgm_ops`) on names/emails for fast case-insensitive search (`ILIKE`).

---

## Seeded Users & Credentials

Running `seed.sql` populates the database with the following default credentials:

### 🔑 Admin & Staff Accounts
| Name | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **Alex Morgan** | Admin | `admin@gymms.com` | `Admin@123456` |
| **Jordan Lee** | Staff | `staff@gymms.com` | `Admin@123456` |

### 🏋️ Trainer Accounts
| Name | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **Marcus Rivera** | Trainer | `marcus@gymms.com` | `Admin@123456` |
| **Sofia Chen** | Trainer | `sofia@gymms.com` | `Admin@123456` |
| **Darius Thompson** | Trainer | `darius@gymms.com` | `Admin@123456` |

### 👥 Member Accounts
| Name | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **Chris Johnson** | Member | `chris@example.com` | `Member@123456` |
| **Emily Watson** | Member | `emily@example.com` | `Member@123456` |
| **Jake Martinez** | Member | `jake@example.com` | `Member@123456` |
| **Priya Patel** | Member | `priya@example.com` | `Member@123456` |
| **Ryan O'Brien** | Member | `ryan@example.com` | `Member@123456` |

---

## Running and Seeding the Database

### Method A: Docker Compose (Recommended)
When running the full stack, the database is initialized automatically. To manually run schema changes or seed inside the running container:

1.  **Run Migrations**:
    ```bash
    docker exec gymms_backend npx sequelize-cli db:migrate
    ```
2.  **Seed Data**:
    ```bash
    docker exec gymms_backend npx sequelize-cli db:seed:all
    ```

### Method B: Standalone Database Container
You can build and run just the database container:

1.  **Build the Image**:
    ```bash
    docker build -t gymms-db ./db
    ```
2.  **Run the Container**:
    ```bash
    docker run -d --name gymms-database -p 5432:5432 -e POSTGRES_PASSWORD=yourpassword gymms-db
    ```
3.  **Seed Manually**:
    If you wish to seed using native SQL:
    ```bash
    docker exec -i gymms-database psql -U postgres -d gym_management < ./db/seed.sql
    ```

### Method C: Local PostgreSQL Setup
If you are running PostgreSQL natively on your host system:

1.  **Create the Database**:
    ```bash
    psql -U postgres -c "CREATE DATABASE gym_management;"
    ```
2.  **Apply Schema**:
    ```bash
    psql -U postgres -d gym_management -f ./db/schema.sql
    ```
3.  **Apply Seed Data**:
    ```bash
    psql -U postgres -d gym_management -f ./db/seed.sql
    ```
