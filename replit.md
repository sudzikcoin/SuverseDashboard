# SuVerse Tax Credit Dashboard

## Overview
SuVerse is an MVP web application designed to be a centralized marketplace for U.S. businesses and accountants to discover, reserve, purchase, and track transferable tax credits (ITC, PTC, 45Q, 48E). The project's core purpose is to streamline complex tax credit transactions, aiming to become the premier platform for managing and trading tax credits efficiently.

## User Preferences
I prefer clear and direct communication. I value iterative development and expect to be consulted before any major architectural or feature changes are implemented. Please provide detailed explanations for complex solutions or significant decisions. Ensure that any changes maintain the modern dark theme and existing UI/UX patterns.

## System Architecture
The application is built using a modern web stack, emphasizing a "Clario-style" dark theme and robust backend functionality.

### UI/UX Decisions
-   **Color Scheme**: Modern dark theme using `su-base`, `su-card`, `su-text`, `su-muted`, `su-emerald`, `su-sky`.
-   **Animations**: `framer-motion` and `tailwindcss-animate` for smooth transitions.
-   **Design Elements**: Glassmorphism, emerald glow shadows, and gradient halos.
-   **Responsiveness**: Mobile-first design with adaptive grid layouts and responsive sidebar.

### Technical Implementations
-   **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Recharts.
-   **Backend**: Next.js API Routes.
-   **Authentication**: NextAuth.js with Role-Based Access Control (Company, Accountant, Admin), JWTs, and automatic audit logging.
-   **Wallet Connection**: User-scoped Wagmi provider for isolated wallet state; automatic disconnect on user switch.
-   **Database**: Prisma ORM with PostgreSQL (SQLite for development) for models like `User`, `Company`, `CreditInventory`, `AuditLog`, etc.
-   **Security**: Bcrypt for password hashing, NextAuth sessions, Zod for input validation, Stripe webhook verification, and JWT-validated middleware.
-   **Stability Shield**: Health monitoring with error boundaries, admin diagnostics, secure health APIs, and session invalidation.
-   **PDF Generation**: `@react-pdf/renderer` for broker packages and closing certificates.
-   **Email**: Resend for transactional emails with logging and error handling.
-   **Audit Logging**: Comprehensive enum-based system using Prisma for type-safe audit trails of user actions and system events.
-   **Telegram Notifications**: Real-time event notifications via Telegram Bot API.
-   **Analytics Dashboard**: AI-style audit analytics for statistical analysis, anomaly detection, and interactive charting.
-   **Cron Jobs**: Daily summary endpoint for automated reports.
-   **File Storage**: Private, per-company document storage with RBAC.

### Feature Specifications
-   **User Management**: Registration, login, role-based access, and admin restoration.
-   **Company Verification**: EIN validation and manual admin verification workflow (VERIFIED, UNVERIFIED, REJECTED) restricting key operations until verified.
-   **Marketplace**: Browse, filter, reserve, and purchase tax credits; includes accountant-specific features.
-   **Purchase Workflows**: Supports Stripe Checkout and on-chain USDC purchases with company verification.
-   **USDC Payment Flow**: Enhanced UX with input validation, BigInt math, and Wagmi/Viem integration for Base network transfers.
-   **Inventory Management**: Admin CRUD for tax credit inventory, including broker file upload.
-   **Accountant Features**: Zero-trust isolation, client management, per-company document management, and restricted marketplace actions.
-   **Admin Panel**: Triple-layer security, dashboards for users, companies, inventory, purchases, company verification, audit logs, and diagnostics.
-   **Reporting**: CSV exports for inventory, purchases, and audit logs.
-   **Tax Credit Calculator**: Interactive module for financial calculations.

### System Design Choices
-   **Project Structure**: Organized into `app/`, `components/`, `lib/` (utilities for various modules), `prisma/`, `types/`, `scripts/`.
-   **Route Organization**: Next.js route groups for authenticated and admin routes.
-   **API Routes**: Dedicated routes for audits, summaries, cron, and notifications.
-   **Layout Pattern**: Shared `DashboardShell` with server-side authentication and role checking.
-   **Environment Variables**: Configurable via `.env`.
-   **Database Seeding**: Enhanced script for initial setup.
-   **Admin Restoration**: Script for creating/restoring admin users.
-   **Access Control**: `lib/access-control.ts` enforces accountant isolation.

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
-   **@aws-sdk/client-s3**: S3 integration (optional).
-   **WalletConnect Cloud**: RainbowKit v2 for wallet connections.