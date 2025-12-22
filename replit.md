# SuVerse Tax Credit Dashboard

## Overview
SuVerse is an MVP web application serving as a centralized marketplace for U.S. businesses and accountants to discover, reserve, purchase, and track transferable tax credits (ITC, PTC, 45Q, 48E). The project's core purpose is to streamline complex tax credit transactions, aiming to become the premier platform for managing and trading tax credits efficiently.

## Recent Changes
**December 22, 2025** - Mobile Layout & PWA Support
- Made all dashboard pages mobile-responsive (tested at 375-400px width)
- Card grids now single column on mobile, 2 columns on tablet, 3-4 on desktop
- Responsive padding and typography throughout
- Added PWA support for "Add to Home Screen" functionality
- Created manifest.json, service worker, and app icons
- iOS and Android installation supported
- Documentation: MOBILE_LAYOUT_UPDATE.md, PWA_SETUP_NOTES.md

**December 22, 2025** - Email Verification Final Fix
- Root cause: Code was reading `RESEND_FROM` at module load time and falling back to sandbox address
- Fix: Changed all email code to read env vars at **request time** (inside functions)
- Removed ALL fallbacks to `onboarding@resend.dev` - if not configured, email won't send (with clear error)
- `RESEND_FROM` now properly reads as `no-reply@suverse.io` from verified domain
- Test script updated to accept CLI argument: `npm run test:resend-email -- user@example.com`
- Created `RESEND_SETUP_STATUS.md` with full configuration documentation

**December 22, 2025** - Email Verification Audit
- Created `scripts/test-resend-email.ts` for testing Resend configuration
- Created `EMAIL_VERIFICATION_STATUS.md` documentation  
- Created `scripts/cleanup-test-users.ts` for cleaning up test accounts by email
- Enhanced `lib/auth/emailVerification.ts` with detailed `[EMAIL]` logging

**December 22, 2025** - Email Verification Resend Fix
- Fixed email verification not appearing in Resend logs for some users
- Root cause: Email verification was using SendGrid instead of Resend
- Fix: Updated `lib/auth/emailVerification.ts` to use Resend client directly
- Added detailed `[EMAIL]` logging markers for debugging
- All user roles (COMPANY, BROKER, ACCOUNTANT) now consistently use Resend

**November 25, 2025** - Login Reliability Fix (Round 2)
- Fixed login hanging on "Logging in..." by adding `redirect: false` to NextAuth signIn call
- Root cause: Without `redirect: false`, NextAuth auto-redirects while React code also handles the result, causing race conditions
- Fix: Manual redirect via `router.replace()` after successful auth, with double-submit guard
- All error cases preserved: archived company, unverified email, invalid credentials

**November 25, 2025** - Broker Verification Management
- Added full broker verification management to admin portal (similar to company verification)
- Schema updates:
  - Added `REJECTED` to `BrokerStatus` enum (now: PENDING, APPROVED, REJECTED, SUSPENDED)
  - Added `VERIFY_BROKER` and `REJECT_BROKER` to `AuditAction` enum
  - Added `BROKER` to `AuditEntity` enum for proper audit logging
- New admin API routes:
  - `GET /api/admin/brokers` - List all brokers with search/filter
  - `PATCH /api/admin/brokers/[id]/verify` - Approve or reject brokers
- New admin UI:
  - Added "Brokers" link to admin sidebar
  - Created `/admin/brokers` page with broker cards, status badges, and approve/reject buttons
  - Stats dashboard showing total, pending, verified, rejected, and suspended counts
- Broker portal updates:
  - BrokerHeader now shows dynamic verification status badge
  - Action gating: "Create Pool" buttons disabled for unverified brokers
  - Status-specific messages in broker profile (pending, rejected, suspended)
  - Page-level protection: `/broker/inventory/new` redirects unverified brokers

**November 24, 2025** - Login Reliability Fix
- Fixed login requiring 2-3 attempts by correcting middleware stability shield behavior
- Root cause: Middleware was clearing auth cookies when `sv.version` cookie was missing (first visit), incorrectly treating it as a version mismatch
- Fix: Only clear auth cookies when there's an ACTUAL version mismatch (existing cookie has different value), not when cookie is simply missing
- Removed excessive console logging from lib/env.ts and lib/auth.ts for cleaner output

**November 24, 2025** - Broker Portal Session Fix
- Fixed broker users being redirected to `/dashboard?error=broker_not_configured` after login
- Added `brokerId` to NextAuth session by:
  - Including broker relation in user query during authentication
  - Adding brokerId to authorize return object
  - Passing brokerId through JWT and session callbacks
  - Updated Session, User, and JWT TypeScript interfaces
- Created `/broker` root redirect to `/broker/dashboard`
- Fixed admin audit log query to use `timestamp` field instead of `createdAt`

**November 24, 2025** - Email Verification System Improvements
- Enhanced API responses to include consistent `{ success, code, message }` format for both success and error cases
- Added comprehensive frontend logging for debugging verification flow
- Implemented error-specific UI with distinct styling:
  - TOKEN_USED: Amber warning style with "Link Already Used" title and prominent login button
  - TOKEN_EXPIRED: Red error style with "Link Expired" title and resend form
  - Other errors: Generic error handling with resend option
- Success response now includes `code: 'VERIFIED'` for consistency
- Improved user experience for repeat link clicks (shows helpful message instead of generic error)

**November 24, 2025** - Development User Reset Script
- Created `scripts/resetUsers.ts` for development database resets
- Deletes all users and related records in correct FK order (atomic transaction)
- Seeds fresh admin user (admin@suverse.io / SuVerseAdmin123!) with verified company
- Safety guards: requires `CONFIRM_RESET_USERS=yes` flag and blocks production execution
- Usage: `CONFIRM_RESET_USERS=yes npm run reset:users`

**November 24, 2025** - Email Verification Duplicate Call Fix
- Fixed email verification flow to prevent duplicate API calls from React Strict Mode double-mounting
- Updated `/api/auth/verify-email` to return explicit JSON responses with `success`, `code`, and `message` fields
- Implemented `useRef` guard in `/auth/verify` page to ensure verification endpoint is called exactly once per mount
- Improved error messaging to distinguish between expired tokens vs already-used tokens
- Role-agnostic implementation works for all user types (COMPANY, BROKER, ADMIN, ACCOUNTANT)

## User Preferences
I prefer clear and direct communication. I value iterative development and expect to be consulted before any major architectural or feature changes are implemented. Please provide detailed explanations for complex solutions or significant decisions. Ensure that any changes maintain the modern dark theme and existing UI/UX patterns.

## System Architecture
The application is built using a modern web stack, emphasizing a "Clario-style" dark theme and robust backend functionality.

### UI/UX Decisions
-   **Color Scheme**: Modern dark theme utilizing `su-base`, `su-card`, `su-text`, `su-muted`, `su-emerald`, `su-sky`.
-   **Animations**: `framer-motion` and `tailwindcss-animate` for smooth transitions.
-   **Design Elements**: Glassmorphism, emerald glow shadows, and gradient halos.
-   **Responsiveness**: Mobile-first design with adaptive grid layouts and responsive sidebar.

### Technical Implementations
-   **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Recharts.
-   **Backend**: Next.js API Routes.
-   **Authentication**: NextAuth.js with Role-Based Access Control (Company, Accountant, Admin, Broker), JWTs, email verification (SendGrid-powered with atomic token workflow), user status management (PENDING_VERIFICATION, ACTIVE, DISABLED), and automatic audit logging.
-   **Wallet Connection**: User-scoped Wagmi provider for isolated wallet state; automatic disconnect on user switch and secure wallet linking via API endpoint with audit logging, preventing wallet leakage between companies.
-   **Database**: Prisma ORM with PostgreSQL (SQLite for development) for models including `User`, `Company`, `CreditInventory`, `Broker`, `BrokerCreditPool`, `AuditLog`.
-   **Security**: Bcrypt for password hashing, NextAuth sessions, Zod for input validation, Stripe webhook verification, and JWT-validated middleware.
-   **PDF Generation**: `@react-pdf/renderer` for broker packages and closing certificates.
-   **Email**: Resend and SendGrid for transactional emails (SendGrid for verification, Resend for notifications).
-   **Audit Logging**: Comprehensive enum-based system for type-safe audit trails.
-   **Telegram Notifications**: Real-time event notifications via Telegram Bot API.
-   **Analytics Dashboard**: AI-style audit analytics for statistical analysis and interactive charting.
-   **Cron Jobs**: Daily summary endpoint for automated reports.
-   **File Storage**: Private, per-company document storage with RBAC.

### Feature Specifications
-   **User Management**: Registration with email verification (production-ready SendGrid integration), login with verification status check, role-based access, and anti-enumeration security.
-   **Company Verification**: EIN validation and manual admin verification workflow restricting key operations until verified.
-   **Marketplace**: Browse, filter, reserve, and purchase tax credits, including accountant-specific features.
-   **Purchase Workflows**: Supports Stripe Checkout and on-chain USDC purchases with company verification.
-   **Inventory Management**: Admin CRUD for tax credit inventory.
-   **Accountant Features**: Zero-trust isolation, client management, per-company document management, and restricted marketplace actions.
-   **Broker Portal**: Comprehensive dashboard (`/broker/*`) with role-based access control and database integration for credit pool management, order tracking, and payout management.
-   **Admin Panel**: Triple-layer security, dashboards for users, companies, inventory, purchases, company verification, audit logs, and diagnostics.
-   **Reporting**: CSV exports for inventory, purchases, and audit logs.
-   **Tax Credit Calculator**: Interactive module for financial calculations.

### System Design Choices
-   **Project Structure**: Organized into `app/`, `components/`, `lib/`, `prisma/`, `types/`, `scripts/`.
-   **Route Organization**: Next.js route groups for authenticated and admin routes.
-   **API Routes**: Dedicated routes for audits, summaries, cron, and notifications.
-   **Layout Pattern**: Shared `DashboardShell` with server-side authentication and role checking.
-   **Access Control**: Enforced through `lib/access-control.ts` and `lib/broker/currentBroker.ts`.
-   **Input Validation**: Zod schemas used for broker inventory operations.

## External Dependencies
-   **Stripe**: Payment processing.
-   **Resend**: Transactional emails.
-   **NextAuth.js**: Authentication and session management.
-   **Prisma ORM**: Database interaction.
-   **@react-pdf/renderer**: PDF document generation.
-   **bcrypt**: Password hashing.
-   **Zod**: Input validation.
-   **xlsx**: Excel/CSV file parsing.
-   **lucide-react**: Icon library.
-   **framer-motion**: Animations.
-   **tailwindcss-animate**: Tailwind CSS animations.
-   **WalletConnect Cloud**: RainbowKit v2 for wallet connections.
-   **SendGrid**: Production email verification system using info@suverse.io.