# SuVerse Tax Credit Dashboard

## Overview
SuVerse is an MVP web application serving as a centralized marketplace for U.S. businesses and accountants to discover, reserve, purchase, and track transferable tax credits (ITC, PTC, 45Q, 48E). The project's core purpose is to streamline complex tax credit transactions, aiming to become the premier platform for managing and trading tax credits efficiently.

## Recent Changes
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