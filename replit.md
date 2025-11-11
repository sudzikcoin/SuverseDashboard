# SuVerse Tax Credit Dashboard

## Overview
SuVerse is an MVP web application for U.S. businesses and accountants to discover, reserve, purchase, and track transferable tax credits (ITC, PTC, 45Q, 48E). Its purpose is to streamline complex tax credit transactions, offering a centralized and efficient marketplace. The project aims to become the go-to platform for managing and trading tax credits.

## User Preferences
I prefer clear and direct communication. I value iterative development and expect to be consulted before any major architectural or feature changes are implemented. Please provide detailed explanations for complex solutions or significant decisions. Ensure that any changes maintain the modern dark theme and existing UI/UX patterns.

## System Architecture
The application is built with a modern web stack, emphasizing a "Clario-style" dark theme and robust backend functionality.

### UI/UX Decisions
-   **Color Scheme**: Modern dark theme with `su-base`, `su-card`, `su-text`, `su-muted`, `su-emerald`, `su-sky`.
-   **Animations**: Utilizes `framer-motion` and `tailwindcss-animate` for smooth transitions.
-   **Design Elements**: Features glassmorphism, emerald glow shadows, and gradient halos.
-   **Components**: Reusable components for consistency.
-   **Responsiveness**: Mobile-first approach with adaptive grid layouts and responsive sidebar navigation.
-   **Navigation**: Responsive sidebar with fixed top bar and hamburger menu for mobile, persistent sidebar for desktop.

### Technical Implementations
-   **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Recharts.
-   **Backend**: Next.js API Routes.
-   **Authentication**: NextAuth.js with Role-Based Access Control (Company, Accountant, Admin), JWT-based sessions, and automatic LOGIN audit logging. Public paths are excluded from middleware checks.
-   **Wallet Connection**: User-scoped Wagmi provider ensures isolated localStorage for wallet state, preventing cross-user persistence. Automatic disconnect on user switch or sign out.
-   **Database**: Prisma ORM with PostgreSQL (SQLite for development). Includes models for `User`, `Company`, `CreditInventory`, `Hold`, `PurchaseOrder`, `Document`, `AuditLog`, `AccountantClient`, and `PaymentLog`.
-   **Security**: Bcrypt for password hashing, NextAuth session management, Zod for input validation, and Stripe webhook verification. Middleware protects sensitive routes with JWT validation.
-   **PDF Generation**: `@react-pdf/renderer` for creating broker packages and closing certificates.
-   **Email**: Resend for transactional emails with comprehensive logging, masking, and error handling. Welcome emails are sent on registration.
-   **Audit Logging**: Comprehensive enum-based system using Prisma for type-safe audit trails. Records actor, action, entity, details, and context (IP, User-Agent, transaction hashes, USD amounts). Integrated into key flows.
-   **Telegram Notifications**: Real-time event notifications via Telegram Bot API for payments, user actions, and system events.
-   **Analytics Dashboard**: AI-style audit analytics system providing statistical analysis (action distribution, hourly activity, top actors, payment totals, anomaly detection). Admin UI includes interactive charts, filtering, search, and CSV export.
-   **Cron Jobs**: Daily summary endpoint for automated Telegram reports.
-   **File Storage**: Private per-company document storage with RBAC-enforced access and security measures against traversal and injection.

### Feature Specifications
-   **User Management**: Registration, login, role-based access, and admin user restoration.
-   **Marketplace**: Browse, filter, reserve, and purchase tax credits. Accountants can select target companies.
-   **Purchase Workflows**: Supports Stripe Checkout and direct on-chain USDC purchases with exact amount validation.
-   **USDC Payment Flow**: Enhanced UX with safe input validation, BigInt math for precision, and Wagmi/Viem integration for Base network USDC transfers. Tracks payments via `PaymentLog`.
-   **Inventory Management**: Admin interface for CRUD operations on tax credit inventory, including broker file upload with idempotent imports and flexible column mapping.
-   **Accountant Features**: Zero-trust isolation, admin-controlled linking to companies, client management, per-company document management, and marketplace actions restricted to linked companies.
-   **Admin Panel**: Triple-layer security, dashboard with stats, user/company/accountant management, inventory management, purchase order management, and a comprehensive audit dashboard with analytics.
-   **Reporting**: CSV exports for inventory, purchases, and audit logs.
-   **Tax Credit Calculator**: Interactive module for calculating financial aspects of tax credits.

### System Design Choices
-   **Project Structure**: `app/` (App Router, route groups, API routes, pages, providers), `components/`, `lib/` (utilities for auth, db, email, pdf, audit, validations, storage, calculations, access-control, env, number, payments, reqctx, notifier, analytics), `prisma/`, `types/`, `scripts/`.
-   **Route Organization**: Next.js route groups for authenticated pages and admin routes.
-   **API Routes**: Dedicated routes for audit queries, summaries, daily cron, and notification testing.
-   **Layout Pattern**: Shared `DashboardShell` component with server-side authentication and role checking.
-   **Environment Variables**: Configurable via `.env` for API tokens, chat IDs, and cron secrets.
-   **Database Seeding**: Enhanced script for initial setup.
-   **Admin Restoration**: `scripts/restoreAdmin.ts` for creating/restoring admin users.
-   **Testing Scripts**: `npm run test:notify` for Telegram notification tests.
-   **Error Handling**: Integrated error handling and user-friendly alerts.
-   **Access Control**: `lib/access-control.ts` enforces accountant isolation for company-scoped operations.

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
## Setup Instructions

### Telegram Notifications (Optional)
To enable real-time Telegram notifications for critical events:

1. **Create a Telegram Bot**:
   - Open Telegram and search for `@BotFather`
   - Send `/newbot` and follow the prompts
   - Save the bot token provided

2. **Get Your Chat ID**:
   - Send a message to your bot
   - Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find your `chat.id` in the response

3. **Configure Environment Variables**:
   Add to your `.env` file:
   ```bash
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_CHAT_ID=your_chat_id_here
   ```

4. **Test the Integration**:
   ```bash
   npm run test:notify
   ```
   Or via API (requires ADMIN login):
   ```bash
   POST /api/notify-test
   ```

### Cron Jobs (Optional)
To enable automated daily summary reports:

1. **Set Cron Secret**:
   Add to your `.env` file:
   ```bash
   CRON_SECRET=your_secure_random_string_here
   ```

2. **Configure Cron Job**:
   Set up a daily cron job (e.g., via cron, GitHub Actions, or external service) to call:
   ```bash
   POST /api/cron/daily-summary
   Headers: x-cron-secret: your_secure_random_string_here
   ```

### Audit Dashboard
Access the enhanced audit dashboard at `/admin/audit` (ADMIN role required). Features:
- Real-time charts showing events by day, action distribution, and payment volume
- Time range filters (24h, 7d, 30d)
- Search across email, IP addresses, and entity IDs
- CSV export for offline analysis
- Color-coded action badges
- Clickable BaseScan transaction links
- Statistical summaries with anomaly detection

### Testing Workflow
1. **Admin Account**: Run `npm run restore:admin` to create/restore admin user
2. **Database Setup**: Run `npm run db:push` to sync schema
3. **Seed Data**: Run `npm run db:seed` to populate test data
4. **Start Development**: Run `npm run dev`
5. **Test Notifications** (if configured): Run `npm run test:notify`

### Security Notes
- The `/api/notify-test` endpoint requires ADMIN authentication
- Cron endpoints require the `CRON_SECRET` header
- All admin audit APIs require ADMIN role
- IP addresses and User-Agent strings are stored for audit purposes (consider GDPR/CCPA compliance)
- Telegram credentials are optional; the system operates silently when not configured

### Recent Changes (November 2025)
- ✅ Enhanced audit logging with IP tracking, transaction hashes, and USD amounts
- ✅ Telegram notification system for real-time alerts
- ✅ AI-style analytics dashboard with charts and anomaly detection
- ✅ Automated daily summary reports via cron endpoint
- ✅ Integrated audit logging into registration, login, and payment flows
- ✅ Secured all notification endpoints with proper authentication
