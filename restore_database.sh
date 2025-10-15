#!/bin/bash

# KCAgri-Trade Database Restore Script
# This script helps you restore the database backup on your local machine

echo "========================================="
echo "KCAgri-Trade Database Restore Script"
echo "========================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "ERROR: PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL first: https://www.postgresql.org/download/"
    exit 1
fi

# Get database name
read -p "Enter database name (default: kcagritrade): " DB_NAME
DB_NAME=${DB_NAME:-kcagritrade}

# Get PostgreSQL username
read -p "Enter PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

# Check if database exists
if psql -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo ""
    echo "WARNING: Database '$DB_NAME' already exists!"
    read -p "Do you want to drop and recreate it? (yes/no): " CONFIRM
    if [ "$CONFIRM" = "yes" ]; then
        echo "Dropping database $DB_NAME..."
        dropdb -U $DB_USER $DB_NAME
    else
        echo "Restore cancelled."
        exit 0
    fi
fi

# Create database
echo ""
echo "Creating database $DB_NAME..."
createdb -U $DB_USER $DB_NAME

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create database"
    exit 1
fi

# Restore backup
echo ""
echo "Restoring backup from database_backup.sql..."
psql -U $DB_USER -d $DB_NAME -f database_backup.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "Database restored successfully!"
    echo "========================================="
    echo ""
    echo "Database connection details:"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  Database: $DB_NAME"
    echo "  Username: $DB_USER"
    echo ""
    echo "Update your .env file with:"
    echo "DATABASE_URL=postgresql://$DB_USER:your_password@localhost:5432/$DB_NAME"
    echo ""
    
    # Show table counts
    echo "Verifying restore - Table counts:"
    psql -U $DB_USER -d $DB_NAME -c "
    SELECT 'users' as table_name, COUNT(*) as count FROM users
    UNION ALL SELECT 'parties', COUNT(*) FROM parties
    UNION ALL SELECT 'crops', COUNT(*) FROM crops
    UNION ALL SELECT 'transactions', COUNT(*) FROM transactions
    UNION ALL SELECT 'inventory', COUNT(*) FROM inventory
    UNION ALL SELECT 'party_ledger', COUNT(*) FROM party_ledger
    UNION ALL SELECT 'cash_register', COUNT(*) FROM cash_register
    ORDER BY table_name;" -t
else
    echo ""
    echo "ERROR: Database restore failed!"
    echo "Please check the error messages above."
    exit 1
fi
