# SuVerse Tax Credit Dashboard

## Overview
SuVerse is an MVP web application for U.S. businesses and accountants to discover, reserve, purchase, and track transferable tax credits (ITC, PTC, 45Q, 48E). Its purpose is to streamline complex tax credit transactions, offering a centralized and efficient marketplace. The project aims to become the go-to platform for managing and trading tax credits.

## User Preferences
I prefer clear and direct communication. I value iterative development and expect to be consulted before any major architectural or feature changes are implemented. Please provide detailed explanations for complex solutions or significant decisions. Ensure that any changes maintain the modern dark theme and existing UI/UX patterns.

## System Architecture
The application is built with a modern web stack, emphasizing a "Clario-style" dark theme and robust backend functionality.

### UI/UX Decisions
-   **Color Scheme**: `su-base` (#0B1220), `su-card` (#0F172A), `su-text` (#EAF2FB), `su-muted` (#AFC3D6), `su-emerald` (#34D399), `su-sky` (#38BDF8).
-   **Animations**: Utilizes `framer-motion` and `tailwindcss-animate` for smooth transitions and interactive elements.
-   **Design Elements**: Features glassmorphism, emerald glow shadows, and gradient halos.
-   **Components**: Reusable components like `Button.tsx`, `GradientBadge.tsx`, and `Section.tsx` for consistency.
-   **Responsiveness**: Mobile-first approach with adaptive grid layouts and responsive sidebar navigation.
-   **Navigation**: Responsive sidebar with fixed top bar and hamburger menu for mobile (<768px), persistent sidebar for desktop. The mobile menu slides over content from the left with a dimmed backdrop overlay, smooth animations, and auto-close on navigation. Z-index layering ensures proper stacking: top bar (z-30), overlay (z-40), sidebar (z-50).

### Technical Implementations
-   **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS.
-   **Backend**: Next.js API Routes for server-side logic.
-   **Authentication**: NextAuth.js with three roles (Company, Accountant, Admin) and Role-Based Access Control (RBAC). JWT-based sessions with NEXTAUTH_SECRET encryption. Public paths (/, /login, /register, /api/auth, static assets) excluded from middleware checks.
-   **Wallet Connection**: User-scoped wallet state via UserScopedWagmiProvider. Each user gets isolated localStorage namespace (`suverse:wagmi:${userId}`) to prevent wallet persistence across platform users. Automatic disconnect on user switch or sign out. SignOutButton component disconnects wallet before NextAuth signOut. WalletGuard runtime check prevents cross-user wallet leakage. ClientInit one-time migration cleans old global wagmi keys.
-   **Database**: Prisma ORM with PostgreSQL (SQLite for development). Schema includes `User`, `Company` (with CompanyStatus enum: ACTIVE/BLOCKED/ARCHIVED, archivedAt for soft-delete), `CreditInventory` (with brokerRef, source, importedAt fields for idempotent file imports), `Hold`, `PurchaseOrder`, `Document`, `AuditLog` (with AuditAction and AuditEntity enums for type-safe logging), `AccountantClient`, and `PaymentLog` (with PaymentStatus enum: PENDING/SUBMITTED/CONFIRMED/FAILED) models.
-   **Security**: Bcrypt for password hashing, NextAuth session management, Zod for input validation, and Stripe webhook verification. Middleware protects specific route prefixes (/dashboard, /clients, /marketplace, /company, /accountant, /admin, /pay) with JWT token validation.
-   **PDF Generation**: `@react-pdf/renderer` for creating broker packages and closing certificates.
-   **Email**: Resend for transactional emails.
-   **Audit Logging**: Comprehensive enum-based system using Prisma AuditAction and AuditEntity enums for type-safe audit trails. The `writeAudit()` helper (in `lib/audit.ts`) creates structured logs with actorId, actorEmail, action, entity, entityId, details, and companyId. All ADMIN operations (archive, unarchive, block, unblock, password reset) are automatically logged with full context. Legacy helpers (createAuditLog, logAudit) maintained for backward compatibility with string-to-enum mapping.
-   **File Storage**: Private per-company document storage in `/uploads/{companyId}/` with RBAC-enforced access via API routes. Security includes path traversal protection (basename normalization), CRLF header injection prevention (control character filtering), and role-based access (ADMIN full, ACCOUNTANT via AccountantClient link, COMPANY self only).

### Feature Specifications
-   **User Management**: Registration with required Name field, login, and role-based access. User name displays throughout the dashboard.
-   **Marketplace**: Browse, filter, reserve, and purchase tax credits. ACCOUNTANT users can select target company from their linked companies.
-   **Purchase Workflow**: Stripe checkout integration, purchase order creation, admin approval, and automated PDF generation.
-   **USDC Payment Flow**: Enhanced payment UX with safe input validation and formatting. Uses lib/number.ts utilities (parseAmountInput, isPositiveMoney, fmtMoney, meetsMinimum) for crash-proof input handling. Accepts comma or dot decimal separators, validates pattern (up to 9 integer, 2 decimal digits), enforces minimum $0.01. Fee and total calculated in USD for display, converted to BigInt only for on-chain transfer. Modal shows amount, platform fee (configurable via PLATFORM_FEE_BPS), total, and BaseScan link after submission. Wagmi/Viem integration for on-chain USDC transfers on Base network (Native USDC 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913). PaymentLog model tracks all transactions with status (PENDING, SUBMITTED, CONFIRMED, FAILED). Strict env validation via lib/env.ts with z.coerce.number() prevents type confusion. Safe BigInt math in lib/payments/usdc.ts (usdToUnits, calcFeeBps, formatUnitsToUsd) prevents RangeError and precision loss. Comprehensive audit logging for payment lifecycle.
-   **Inventory Management**: Full-featured admin interface at /admin/inventory for CRUD operations on tax credit inventory. Server-rendered page with modal-based create/edit forms, inline delete with confirmation, and audit logging for all operations. Includes broker file upload system (CSV/XLSX) with idempotent imports using brokerRef for duplicate prevention, flexible column mapping, Zod validation, and automatic marketplace sync.
-   **Accountant Features**: 
    - Zero-trust isolation: new accountants start with zero company access
    - Admin-controlled linking via `/api/accountant/company/link` (POST/DELETE)
    - Client management via `/clients` page showing only explicitly linked companies
    - Per-company document upload/management through DocumentManager modal
    - Marketplace actions (holds, purchases) restricted to linked companies only
    - Documents stored in isolated company folders with RBAC access control enforced at the API level
    - Auto-linking when accountant creates a new client company
-   **Admin Panel**: 
    - Triple-layer security: middleware.ts guards all /admin routes, app/admin/layout.tsx performs server-side session check, API routes validate ADMIN role
    - Dashboard at /admin showing stats (users, companies, credits, purchases, accountants) and recent activity (server-rendered with direct Prisma queries)
    - Accountant management at /admin/accountants with search, view linked companies, and link/unlink functionality
    - Company management at /admin/companies with clickable cards, company details page at /admin/companies/[id] with edit form, block/unblock actions, archive functionality, and linked accountant viewer
    - Inventory management at /admin/inventory with full CRUD (create, edit, delete) for tax credits via modal interface
    - Purchase order management and audit log viewer use shared server-side protected layout
    - LinkManagementModal and CreditFormModal components for managing accountant-company links and tax credit inventory
    - CompanyEditor component for editing company details with save, block/unblock, and archive actions
    - Runtime host detection in server components for environment-agnostic API fetching
-   **Reporting**: CSV exports for inventory and purchases, and Admin audit log viewer.
-   **Tax Credit Calculator**: Interactive module calculating face value, costs, fees, savings, and effective discount.

### System Design Choices
-   **Project Structure**: `app/` (App Router with route groups, API routes, pages, providers/UserScopedWagmiProvider for user-isolated wallet state), `components/` (including DashboardShell and responsive Sidebar, auth/SignOutButton, wallet/PayModal, wallet/USDCPay, wallet/WalletGuard, ClientInit for storage cleanup), `lib/` (utilities for auth, db, email, pdf, audit with writeAudit(), admin with requireAdminSession(), validations, storage, calculations, access-control, env validation with clientEnv, number with parseAmountInput/isPositiveMoney/fmtMoney/meetsMinimum, safeNumber with guards for toFixed(), payments/usdc with BigInt helpers), `prisma/`, `types/`.
-   **Route Organization**: Uses Next.js route groups - `app/(dashboard)/` for authenticated pages with shared responsive sidebar layout. Admin routes at `app/admin/` with role-specific enforcement.
-   **Layout Pattern**: Shared `DashboardShell` component provides consistent navigation across all dashboard pages with server-side auth and role checking via `requireRole` (single) or `requireRoles` (array).
-   **Environment Variables**: Configurable via `.env`.
-   **Database Seeding**: Enhanced script for initial setup. Does NOT auto-link accountants - they start with zero companies.
-   **Error Handling**: Integrated error handling and user-friendly alerts.
-   **Access Control**: `lib/access-control.ts` provides `hasCompanyAccess()` and `assertAccountantHasAccess()` for enforcing accountant isolation across all company-scoped operations.

## External Dependencies
-   **Stripe**: Payment processing and webhooks.
-   **Resend**: Transactional emails.
-   **NextAuth.js**: Authentication and session management.
-   **Prisma ORM**: Database interaction.
-   **@react-pdf/renderer**: PDF document generation.
-   **bcrypt**: Password hashing.
-   **Zod**: Input validation.
-   **xlsx**: Excel/CSV file parsing for broker file uploads.
-   **lucide-react**: Icon library for UI elements (hamburger menu, etc.).
-   **framer-motion**: Animations.
-   **tailwindcss-animate**: Tailwind CSS animations.
-   **@aws-sdk/client-s3**: S3 integration (optional for production file storage).