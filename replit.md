# KCAgri-Trade - Crop Trading Management System

## Overview

KCAgri-Trade is a comprehensive crop trading management application designed for agricultural businesses. The system manages the complete lifecycle of crop trading operations including purchases, sales, inventory tracking, party management, and financial ledger maintenance. Built as a full-stack web application, it provides real-time insights into business operations through an intuitive dashboard and detailed reporting capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### October 15, 2025
- **Inventory Auto-Update System**: Fixed complete inventory synchronization for all transaction operations:
  - Create: Automatically updates inventory when new purchases/sales are created
  - Update: Reverses old inventory changes and applies new ones when editing transactions
  - Delete: Reverts inventory changes when transactions are deleted (soft delete)
  - Handles transaction type changes (e.g., expense → purchase/sale)
  - Correctly manages negative stock scenarios and weighted average rate calculations
  - Frontend automatically refreshes inventory grid after any transaction change
- **Sales Validation**: Implemented inventory stock validation to prevent overselling:
  - Cannot sell items that haven't been purchased
  - Validates available stock before allowing sale transactions
  - Shows descriptive error messages with crop name, available stock, and requested quantity
  - Handles all edge cases including purchase→sale conversions and quantity updates
- **Sales Page Preview Modal**: Added preview functionality to Sales page with Eye icon button to view complete transaction details
- **Admin Credentials**: Reset admin password to "admin123" for email: admin@example.com

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation

**Design Decisions:**
- Component-based architecture with reusable UI components
- Form validation using Zod schemas for type-safe data handling
- Centralized API layer for consistent data fetching patterns
- Modal-based workflows for data entry (parties, crops, transactions)
- Responsive design with mobile breakpoint detection

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM
- **Authentication**: Express sessions with bcrypt password hashing
- **Build Tool**: esbuild for production builds

**Design Decisions:**
- RESTful API architecture with session-based authentication
- Middleware-based request logging and error handling
- Separation of storage layer (storage.ts) from route handlers
- Raw body buffering for webhook/integration support
- Development and production environment separation

### Database Architecture

**Database**: PostgreSQL via Neon serverless
**ORM**: Drizzle ORM with PostgreSQL dialect

**Core Schema Design:**

1. **Users Table**: Authentication and user management with role-based access
2. **States & Cities Tables**: Geographic location hierarchy for party addresses
3. **Parties Table**: Buyer/supplier management with contact info and balances
4. **Crops Table**: Product catalog with variety, category, and unit tracking
5. **Transactions Table**: Purchase, sale, and expense records with party/crop linkage
6. **Inventory Table**: Real-time stock levels with automatic valuation
7. **Cash Register Table**: Cash flow tracking (cash in/out operations)
8. **Party Ledger Table**: Double-entry accounting for party balances

**Key Architectural Patterns:**
- UUID primary keys for all tables using `gen_random_uuid()`
- Enum types for constrained values (party_type, transaction_type, payment_mode)
- Soft delete pattern with `isActive` flags
- Timestamp tracking with `createdAt` and `updatedAt` fields
- Foreign key relationships with referential integrity

### Authentication & Authorization

**Authentication Mechanism:**
- Session-based authentication using express-session
- Password hashing with bcrypt (cost factor for security)
- HTTP-only cookies for session management
- Session secret configuration via environment variables

**Session Configuration:**
- 24-hour session expiration
- Secure cookie settings (configurable for production HTTPS)
- User session data stored in session object

### Data Flow Patterns

**Client-Server Communication:**
1. React components use TanStack Query hooks for data fetching
2. Centralized API functions in `lib/api.ts` handle HTTP requests
3. Credential inclusion (`credentials: 'include'`) for session cookies
4. Error handling with toast notifications for user feedback

**Transaction Processing:**
1. Form submission with Zod validation on client
2. API request with authenticated session
3. Database operation via Drizzle ORM
4. Inventory/ledger automatic updates via storage layer
5. Query cache invalidation for real-time UI updates

### Real-Time Features

**Dashboard Metrics:**
- Aggregated sales, purchases, and expense totals
- Inventory valuation calculations
- Party outstanding balance summaries
- Low stock and out-of-stock alerts

**Inventory Management:**
- Automatic stock updates on purchase/sale transactions (create, update, delete)
- Real-time stock level tracking with minimum threshold alerts
- Stock value calculations using weighted average cost method
- Automatic inventory reversal when transactions are edited or deleted
- Supports negative stock scenarios for accurate accounting

**Ledger System:**
- Double-entry bookkeeping for party transactions
- Automatic debit/credit entries on transactions
- Running balance calculations
- Party-wise ledger reports

## External Dependencies

### Database Service
- **Neon Serverless PostgreSQL**: Managed PostgreSQL database with WebSocket support
- Connection pooling via `@neondatabase/serverless`
- Environment-based configuration (`DATABASE_URL`)

### UI Component Library
- **shadcn/ui**: Pre-built accessible components based on Radix UI
- Radix UI primitives for complex interactions (dialogs, dropdowns, etc.)
- Tailwind CSS for utility-first styling

### Development Tools
- **Vite**: Frontend build tool and dev server
- **Replit plugins**: Development banner, cartographer, and error overlay
- **TypeScript**: Type safety across the entire stack
- **drizzle-kit**: Database migrations and schema management

### Authentication & Security
- **bcrypt**: Password hashing and verification
- **express-session**: Session management middleware
- **connect-pg-simple**: PostgreSQL session store (referenced but not actively used)

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation and schema definition
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### Charts & Visualization
- **Chart.js**: Dashboard charts (loaded dynamically via CDN)
- Sales vs purchase trends
- Crop distribution visualization

### Utilities
- **date-fns**: Date formatting and manipulation
- **clsx & tailwind-merge**: Conditional CSS class composition
- **wouter**: Lightweight routing solution