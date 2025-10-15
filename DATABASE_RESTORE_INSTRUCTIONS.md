# KCAgri-Trade Database Backup & Restore Instructions

## Database Backup Information
- **Backup Date**: October 10, 2025
- **Database**: PostgreSQL (Neon Serverless)
- **File**: `database_backup.sql`
- **Format**: INSERT statements (fully compatible with pgAdmin Query Tool)
- **File Size**: 24 KB (551 lines)

> ✅ **pgAdmin Compatible**: This backup uses INSERT statements instead of COPY format, making it 100% compatible with pgAdmin's Query Tool on Windows. No formatting issues!

## Prerequisites for Local Restore

1. **PostgreSQL installed locally** (version 12 or higher recommended)
   - Download from: https://www.postgresql.org/download/
   
2. **PostgreSQL command-line tools** (psql, pg_dump, pg_restore)
   - Usually included with PostgreSQL installation

## Restore Instructions

### Step 1: Create a Local Database

Open your terminal/command prompt and run:

```bash
# Create a new database (replace 'kcagritrade' with your preferred name)
createdb kcagritrade
```

Or using psql:

```bash
psql -U postgres
CREATE DATABASE kcagritrade;
\q
```

### Step 2: Restore the Database

Navigate to the directory containing `database_backup.sql` and run:

```bash
psql -U postgres -d kcagritrade -f database_backup.sql
```

**Note**: Replace `postgres` with your PostgreSQL username if different.

### Step 3: Verify the Restore

```bash
psql -U postgres -d kcagritrade

# List all tables
\dt

# Check table counts
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'parties', COUNT(*) FROM parties
UNION ALL
SELECT 'crops', COUNT(*) FROM crops
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'party_ledger', COUNT(*) FROM party_ledger
UNION ALL
SELECT 'cash_register', COUNT(*) FROM cash_register;

# Exit
\q
```

---

## Alternative Method: Using pgAdmin on Windows

If you prefer using pgAdmin's graphical interface on Windows, follow these steps:

### Method A: Using Query Tool (Recommended for SQL Files)

**Important**: Plain SQL files like `database_backup.sql` must use the Query Tool, NOT the Restore dialog.

#### Step 1: Open pgAdmin and Create Database

1. **Launch pgAdmin 4** on Windows
2. Connect to your PostgreSQL server (enter master password if prompted)
3. **Create a new database**:
   - Right-click on **"Databases"** in the left sidebar
   - Select **Create** → **Database...**
   - Enter database name: `kcagritrade`
   - Click **"Save"**

#### Step 2: Open Query Tool

1. **Right-click** on your newly created database (`kcagritrade`)
2. Select **"Query Tool"** (or press `Alt+Shift+Q`)
   - A new Query Tool window will open

#### Step 3: Load the SQL File

1. In the Query Tool toolbar, click the **"Open File"** icon (folder icon)
   - Or go to **File** → **Open**
2. Navigate to your project folder
3. Select the `database_backup.sql` file
4. Click **"Open"**
   - The SQL script will load into the Query Tool editor

#### Step 4: Execute the Restore

1. Click the **"Execute/Refresh"** button (▶ play icon in the toolbar)
   - Or press **F5** on your keyboard
2. **Wait for completion** - The script may take a few moments to run
3. Check the **Messages** tab at the bottom for results:
   - You should see "Query returned successfully" messages
   - Any errors will be shown in red

#### Step 5: Verify the Restore

1. In the left sidebar, expand your `kcagritrade` database
2. Expand **"Schemas"** → **"public"** → **"Tables"**
3. You should see 9 tables:
   - users
   - states
   - cities
   - parties
   - crops
   - transactions
   - inventory
   - cash_register
   - party_ledger

4. **Check data**: Right-click any table → **"View/Edit Data"** → **"All Rows"**

### Method B: Using Command Prompt (Alternative)

If you prefer command line on Windows:

#### Step 1: Open Command Prompt

1. Press **Windows + R**
2. Type `cmd` and press Enter

#### Step 2: Navigate to PostgreSQL Bin Directory

```cmd
cd "C:\Program Files\PostgreSQL\15\bin"
```
*(Replace `15` with your PostgreSQL version: 13, 14, 15, 16, etc.)*

#### Step 3: Create Database

```cmd
psql -U postgres -c "CREATE DATABASE kcagritrade;"
```
Enter your PostgreSQL password when prompted.

#### Step 4: Restore from SQL File

```cmd
psql -U postgres -d kcagritrade -f "C:\path\to\your\database_backup.sql"
```

**Example** (if the file is on your Desktop):
```cmd
psql -U postgres -d kcagritrade -f "C:\Users\YourName\Desktop\database_backup.sql"
```

**Example** (if you're in the project directory):
```cmd
psql -U postgres -d kcagritrade -f "database_backup.sql"
```

#### Step 5: Verify

```cmd
psql -U postgres -d kcagritrade -c "\dt"
```

---

## Important pgAdmin Notes for Windows

### Why Can't I Use the Restore Dialog?

The **Restore** dialog in pgAdmin (`Right-click → Restore...`) only works with **Custom**, **Tar**, or **Directory** format backups created with `pg_dump -Fc`.

Our `database_backup.sql` is a **plain-text SQL file**, so you must use:
- ✅ **Query Tool** (Method A above)
- ✅ **Command line psql** (Method B above)
- ❌ **NOT** the Restore dialog

### Common Errors and Solutions

#### Error: "pg_restore: input file appears to be a text format dump"
- **Cause**: You tried using the Restore dialog with a plain SQL file
- **Solution**: Use the Query Tool method instead

#### Error: "'pg_restore.exe' file not found"
- **Cause**: pgAdmin can't find PostgreSQL binaries
- **Solution**:
  1. In pgAdmin, go to **File** → **Preferences**
  2. Navigate to **Paths** → **Binary paths**
  3. Set **PostgreSQL Binary Path** to: `C:\Program Files\PostgreSQL\[version]\bin`
  4. Click **Save** and try again

#### Error: "Permission denied for database"
- **Cause**: User doesn't have necessary permissions
- **Solution**: Make sure you're connected as a superuser (usually `postgres`)

#### Error: "Database already exists"
- **Cause**: A database with that name already exists
- **Solution**:
  1. Right-click the existing database → **Delete/Drop**
  2. Confirm deletion
  3. Create a new database and try again

## Update Your Local Application Configuration

After restoring the database, update your local `.env` file:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/kcagritrade
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=kcagritrade
```

## Database Schema Overview

The backup includes the following tables:

1. **users** - User accounts and authentication
2. **states** - Indian states for address management
3. **cities** - Cities linked to states
4. **parties** - Buyers and suppliers with contact info and balances
5. **crops** - Product catalog with variety, category, and units
6. **transactions** - Purchase, sale, and expense records
7. **inventory** - Real-time stock levels with automatic valuation
8. **cash_register** - Cash in/out operations (Rokar)
9. **party_ledger** - Double-entry accounting for party balances

## Important Notes

- **Password Hashing**: User passwords are hashed with bcrypt. You cannot retrieve original passwords.
- **UUIDs**: All primary keys use UUIDs generated by PostgreSQL's `gen_random_uuid()` function.
- **Timestamps**: All timestamps are stored in UTC, but the application displays them in IST (Indian Standard Time).
- **Data Integrity**: Foreign key constraints ensure referential integrity across tables.

## Troubleshooting

### Issue: "database already exists"
```bash
# Drop the existing database first (WARNING: This deletes all data)
dropdb kcagritrade
# Then recreate and restore
createdb kcagritrade
psql -U postgres -d kcagritrade -f database_backup.sql
```

### Issue: Permission denied
```bash
# Run as superuser
sudo -u postgres psql -d kcagritrade -f database_backup.sql
```

### Issue: Extension not available
Some PostgreSQL extensions might not be available. If you see errors about extensions:
- Ensure your PostgreSQL installation includes the required extensions
- Or comment out extension-related lines in the backup SQL file

## Creating Your Own Backups

To create a new backup from your local database:

```bash
pg_dump -U postgres -d kcagritrade > my_backup_$(date +%Y%m%d).sql
```

## Restore on Another Replit Project

If you want to restore this backup to another Replit project:

1. Upload the `database_backup.sql` file to your new Replit project
2. Use the execute_sql_tool or run in the shell:
```bash
psql $DATABASE_URL < database_backup.sql
```

## Support

For issues specific to:
- **Local PostgreSQL setup**: See PostgreSQL documentation
- **Application configuration**: Check `replit.md` in the project root
- **Database schema**: Refer to `shared/schema.ts` in the codebase
