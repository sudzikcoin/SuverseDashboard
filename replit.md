# SuVerse Tax Credit Dashboard

## Overview
SuVerse is an MVP web application designed for U.S. businesses and accountants to engage with transferable tax credits (ITC, PTC, 45Q, 48C, 48E). The platform enables users to discover, reserve, purchase, and track these credits. The project's ambition is to streamline the complex process of tax credit transactions, providing a centralized and efficient marketplace.

## User Preferences
I prefer clear and direct communication. I value iterative development and expect to be consulted before any major architectural or feature changes are implemented. Please provide detailed explanations for complex solutions or significant decisions. Ensure that any changes maintain the modern dark theme and existing UI/UX patterns.

## System Architecture
The application is built with a modern web stack.

### UI/UX Decisions
The design adheres to a "Clario-style" modern dark theme with emerald green accents. Key UI/UX features include:
-   **Color Scheme**: `su-base` (#0B1220), `su-card` (#0F172A), `su-text` (#EAF2FB), `su-muted` (#AFC3D6), `su-emerald` (#34D399), `su-sky` (#38BDF8).
-   **Animations**: Utilizes `framer-motion` and `tailwindcss-animate` for smooth transitions, scroll reveals, parallax effects, and hover interactions.
-   **Design Elements**: Features glassmorphism (`.glass`), emerald glow shadows (`.glow-emerald`), and gradient halos (`.halo`) for a sophisticated look.
-   **Components**: Reusable components like `Button.tsx` (with variants), `GradientBadge.tsx`, and `Section.tsx` enforce consistency.
-   **Responsiveness**: Mobile-first approach with adaptive grid layouts for desktop.

### Technical Implementations
-   **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS.
-   **Backend**: Next.js API Routes for all server-side logic.
-   **Authentication**: NextAuth.js provides robust user authentication with three roles: Company, Accountant, and Admin. Role-Based Access Control (RBAC) is enforced at page and API endpoint levels using a `RequireRole` HOC.
-   **Database**: Prisma ORM with SQLite for development. The schema includes `User`, `Company`, `CreditInventory`, `Hold`, `PurchaseOrder`, `Document`, `AuditLog`, and `AccountantClient` models.
-   **Security**: Password hashing (bcrypt), NextAuth session management, input validation (Zod), and Stripe webhook signature verification. Admin self-registration is blocked.
-   **PDF Generation**: `@react-pdf/renderer` is used for creating broker packages and closing certificates.
-   **Email**: `Resend` is integrated for transactional emails, with a console log fallback if not configured.
-   **Audit Logging**: Comprehensive audit logging tracks system activity.
-   **Payment Fallback**: A demo mode payment fallback system is implemented for testing when Stripe is not configured.

### Feature Specifications
-   **User Management**: Registration, login, and role-based access for Company, Accountant, and Admin.
-   **Marketplace**: Browse, filter, reserve (72-hour hold), and purchase tax credits.
-   **Purchase Workflow**: Stripe checkout integration, purchase order creation, admin approval, and automated PDF generation.
-   **Inventory Management**: Admin interface for CRUD operations on tax credit inventory.
-   **Accountant Features**: Client management page to view and manage assigned companies.
-   **Reporting**: CSV exports for inventory and purchases, and an Admin audit log viewer.

### System Design Choices
-   **Project Structure**: Organized into `app/` (Next.js App Router, API routes, pages), `components/` (reusable React components), `lib/` (utilities for auth, db, email, pdf, audit, validations), `prisma/` (schema and seed), and `types/` (TypeScript definitions).
-   **Environment Variables**: Configurable via `.env` for database, NextAuth secret, and external service API keys.
-   **Database Seeding**: Enhanced seed script provides initial admin, accountant, company users, demo credits, and audit logs for quick setup.
-   **Error Handling**: Enhanced error handling and user-friendly alerts are integrated throughout the application.

## External Dependencies
-   **Stripe**: For payment processing and webhook integration (`checkout.session.completed` event).
-   **Resend**: For sending transactional emails.
-   **NextAuth.js**: For authentication and session management.
-   **Prisma ORM**: For database interaction.
-   **@react-pdf/renderer**: For generating PDF documents.
-   **bcrypt**: For password hashing.
-   **Zod**: For input validation.
-   **framer-motion**: For animations.
-   **tailwindcss-animate**: For Tailwind CSS based animations.
## Recent Changes (November 7, 2025)

### Phase 8: Dashboard Company Name Enhancement (Latest)
- ✅ **Enhanced Dashboard Greeting**: Replaced "Welcome, {email}" with "Welcome, {Company Legal Name}"
  - Added `companyName` field to NextAuth Session, User, and JWT interfaces
  - Updated `authorize` function to fetch company legal name during login (one-time cost)
  - Modified `jwt` callback to persist companyName to the JWT token
  - Optimized `session` callback to read from token (eliminates database query on every session read)
  - Dashboard greeting shows company name with automatic fallback to email if no company exists
- ✅ **Performance Optimization**: Eliminated unnecessary database queries on session access
  - Previous implementation queried database on every session read
  - New implementation caches company name in JWT token
  - Significantly reduced latency for session-based requests
- ✅ **Type Safety**: Complete TypeScript type definitions for all NextAuth interfaces
- ✅ **Edge Case Handling**: Properly handles users without companies using null coalescing

**Files Modified**:
- `types/next-auth.d.ts` - Extended Session/User/JWT types with companyName
- `lib/auth.ts` - Optimized callbacks to cache company name in JWT
- `app/dashboard/page.tsx` - Updated greeting to show company name

**Testing Recommendations**:
- Verify login across all roles (COMPANY, ACCOUNTANT, ADMIN)
- Confirm company name displays correctly for users with companies
- Ensure email fallback works for users without companies

### Phase 7: Bug Fixes & Production Readiness
- ✅ **Fixed Critical Hydration Error**: Created `lib/format.ts` with custom formatters
  - Replaced `Intl.NumberFormat` with manual comma insertion to eliminate browser locale differences
  - Functions: `formatNumber`, `formatUSD`, `formatUSDWithCents`, `formatPercent`
  - Updated all components to use consistent formatting (CalculatorCard, marketplace, admin pages, DocumentList)
- ✅ **Fixed PostgreSQL Connection**: Removed SQLite override in `lib/db.ts`
  - Deleted `process.env.DATABASE_URL = "file:./prisma/dev.db"` line that was preventing PostgreSQL connection
  - Regenerated Prisma Client for PostgreSQL
- ✅ **Fixed NextAuth Configuration**: Removed invalid `trustHost` property causing TypeScript errors
- ✅ **Verified Application Status**:
  - Database connection: ✅ Working (PostgreSQL/Neon)
  - Seed data: ✅ 2 users, 3 companies, 5 tax credits
  - Admin login: ✅ admin@suverse.io / ChangeMe_2025
  - Registration: ✅ Handles duplicates (409), optional fields
  - API endpoints: ✅ /api/inventory returns all credits
  - Hydration: ✅ No errors in browser console
  - Home page: ✅ Renders correctly with calculator

**Critical Fixes**:
- Number formatting now consistent across server/client (eliminates hydration warnings)
- Database properly connects to PostgreSQL (no more SQLite fallback)
- All API endpoints functional and returning correct data

### Phase 6: Tax Calculator & Document Upload
- ✅ Extended Prisma Document model with additional fields (userId, name, storageKey, size, mime, notes)
- ✅ Migrated database from SQLite to PostgreSQL for production readiness
- ✅ Created `lib/storage.ts` dual-mode file storage adapter:
  - Local dev: Saves to `public/uploads/` directory
  - Production: S3-compatible storage with graceful fallback to metadata-only
- ✅ Implemented file upload API (`app/api/upload/route.ts`) with auth and validation
- ✅ Created S3 file proxy API (`app/api/files/[...key]/route.ts`) for private file serving
- ✅ Built Tax Credit Calculator module:
  - `lib/calc.ts` - Calculation logic with configurable fee structures
  - `CalculatorCard.tsx` - Interactive UI with real-time calculations
  - Shows face value, costs, fees, savings, and effective discount percentage
- ✅ Created FileUpload component with drag-and-drop support
- ✅ Built DocumentList component with formatted display and download links
- ✅ Integrated calculator on landing page (below hero section)
- ✅ Enhanced company dashboard with:
  - Interactive tax credit calculator
  - Document upload section
  - Document list showing all uploaded files
- ✅ Added calculator to accountant and admin dashboards
- ✅ Updated all dashboard cards with glass styling
- ✅ Added S3 environment variables to `.env.local.example`
- ✅ Created `public/uploads/` directory for local file storage
- ✅ Updated `.gitignore` to exclude uploaded files

**Dependencies Added**: `@aws-sdk/client-s3` for S3 integration

**Environment Variables** (optional for S3):
- `S3_REGION`, `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
- `PUBLIC_BASE_URL` for generating file URLs

**File Storage**: Local fallback to `public/uploads/` in dev; S3 in production with graceful degradation.
