# Local Development Setup Guide

This guide helps you set up KCAgri-Trade on your local machine with a local PostgreSQL database.

## Prerequisites

✅ **PostgreSQL 12+** installed on your machine  
✅ **Node.js 18+** installed  
✅ **npm** or **yarn** package manager

---

## Step-by-Step Setup

### 1. Create `.env` File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Database Connection

Open `.env` and update the `DATABASE_URL`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/kcagritrade
```

**Replace:**
- `YOUR_PASSWORD` with your PostgreSQL password
- `kcagritrade` with your database name (if different)

**Example:**
```env
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/kcagritrade
```

### 3. Generate Session Secret

Run this command to generate a secure session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it in your `.env` file:

```env
SESSION_SECRET=a1b2c3d4e5f6789... # paste the generated secret here
```

### 4. Create Local Database

Open your terminal/command prompt:

**Option A: Using createdb (if available)**
```bash
createdb -U postgres kcagritrade
```

**Option B: Using psql**
```bash
psql -U postgres
CREATE DATABASE kcagritrade;
\q
```

**Option C: Using pgAdmin**
- Open pgAdmin
- Right-click "Databases" → Create → Database
- Name: `kcagritrade`
- Click Save

### 5. Restore Database from Backup

Navigate to your project directory and run:

```bash
psql -U postgres -d kcagritrade -f database_backup.sql
```

**For pgAdmin users:**
- Right-click `kcagritrade` database → Query Tool
- Click 📁 Open File → select `database_backup.sql`
- Click ▶ Execute (or press F5)

### 6. Install Dependencies

```bash
npm install
```

### 7. Start the Application

```bash
npm run dev
```

The application will start on: **http://localhost:5000**

---

## Complete `.env` File Example

Here's what your final `.env` file should look like:

```env
# Database
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/kcagritrade

# Session
SESSION_SECRET=a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef0123456789

# Environment
NODE_ENV=development
PORT=5000
SECURE_COOKIES=false
```

---

## Verify Setup

### Check Database Connection

```bash
psql -U postgres -d kcagritrade -c "\dt"
```

You should see 9 tables:
- users
- states  
- cities
- parties
- crops
- transactions
- inventory
- cash_register
- party_ledger

### Check Application

1. Open browser: http://localhost:5000
2. Login with:
   - **Email**: admin@example.com
   - **Password**: (ask to reset if unknown)

---

## Troubleshooting

### Error: "DATABASE_URL must be set"
- Make sure `.env` file exists in the root directory
- Check that `DATABASE_URL` is properly set

### Error: "database does not exist"
```bash
# Create the database first
createdb -U postgres kcagritrade
```

### Error: "password authentication failed"
- Check your PostgreSQL password in `DATABASE_URL`
- Verify PostgreSQL is running: `pg_isready`

### Error: "Connection refused"
- Check if PostgreSQL is running
- Windows: Open Services → PostgreSQL should be running
- Mac: `brew services list` (if installed via Homebrew)
- Linux: `sudo systemctl status postgresql`

### Error: Port 5000 already in use
Change the port in `.env`:
```env
PORT=3000
```

---

## Database Management

### Create a New Backup

```bash
pg_dump -U postgres kcagritrade > my_backup_$(date +%Y%m%d).sql
```

### Reset Database

```bash
# Drop and recreate
dropdb -U postgres kcagritrade
createdb -U postgres kcagritrade
psql -U postgres -d kcagritrade -f database_backup.sql
```

### Update Schema After Changes

If you modify `shared/schema.ts`:

```bash
npm run db:push
```

Or if there are data-loss warnings:

```bash
npm run db:push -- --force
```

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `SESSION_SECRET` | Secret key for session encryption | Random 64-char hex string |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5000` |
| `SECURE_COOKIES` | Enable secure cookies (HTTPS only) | `false` for local, `true` for production |

---

## Quick Commands

```bash
# Start development server
npm run dev

# Push schema changes to database
npm run db:push

# Create database backup
pg_dump -U postgres kcagritrade > backup.sql

# Restore database
psql -U postgres -d kcagritrade -f backup.sql

# Check database connection
psql $DATABASE_URL -c "SELECT version();"
```

---

## Next Steps

1. ✅ Database connected
2. ✅ Application running
3. 🔄 Login and test features
4. 🔄 Customize as needed
5. 🔄 Deploy to production (when ready)

Need help? Check the main `DATABASE_RESTORE_INSTRUCTIONS.md` file for detailed database setup instructions.
