# Database Backup Package - Summary

## What's Included

This database backup package contains everything you need to restore the KCAgri-Trade database on your local machine.

### Files Included:

1. **database_backup.sql** (551 lines, 24 KB)
   - Complete PostgreSQL database dump using INSERT statements
   - Fully compatible with pgAdmin Query Tool on Windows
   - Includes all schema definitions, data, and constraints
   - Contains 9 tables with all current data
   - Ready to restore with a single command - no formatting issues!

2. **DATABASE_RESTORE_INSTRUCTIONS.md**
   - Detailed step-by-step restoration guide
   - Prerequisites and system requirements
   - Troubleshooting section
   - Configuration instructions

3. **restore_database.sh** (Linux/Mac)
   - Automated restore script
   - Interactive prompts for database name and user
   - Automatic verification after restore
   - Makes restoration process simple and quick

## Database Contents

The backup includes these tables with their current data:

| Table | Description |
|-------|-------------|
| users | User accounts and authentication |
| states | Indian states reference data |
| cities | Cities linked to states |
| parties | Buyers and suppliers with balances |
| crops | Product catalog |
| transactions | Purchase, sale, and expense records |
| inventory | Real-time stock levels |
| cash_register | Cash in/out operations (Rokar) |
| party_ledger | Double-entry accounting ledger |

## Quick Start (Linux/Mac)

```bash
# Make sure PostgreSQL is installed
# Then run:
./restore_database.sh
```

## Quick Start (Windows)

```cmd
# Open Command Prompt or PowerShell
createdb -U postgres kcagritrade
psql -U postgres -d kcagritrade -f database_backup.sql
```

## Database Statistics

- **Schema Version**: PostgreSQL 16.9
- **Total Tables**: 9
- **Backup Size**: 551 lines (24 KB)
- **Backup Format**: INSERT statements (pgAdmin compatible)
- **Character Encoding**: UTF8
- **Generated**: October 10, 2025

## Important Features

- **UUID Primary Keys**: All tables use UUID for primary keys
- **Referential Integrity**: Foreign key constraints ensure data consistency
- **Custom Types**: Includes enums for party_type, payment_mode, payment_status, transaction_type
- **Secure Passwords**: User passwords are bcrypt hashed
- **Timestamps**: UTC storage with IST display in application

## After Restore

1. Update your `.env` file with local database credentials
2. Run `npm install` to install dependencies
3. Start the application with `npm run dev`
4. Login with your existing credentials

## Need Help?

- For PostgreSQL installation issues: https://www.postgresql.org/docs/
- For application setup: See `replit.md` in the project root
- For database schema details: Check `shared/schema.ts`

---

**Backup Created**: October 10, 2025  
**KCAgri-Trade Version**: Latest  
**Database Type**: PostgreSQL (Neon Serverless Compatible)
