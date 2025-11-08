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
-   **Responsiveness**: Mobile-first approach with adaptive grid layouts.

### Technical Implementations
-   **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS.
-   **Backend**: Next.js API Routes for server-side logic.
-   **Authentication**: NextAuth.js with three roles (Company, Accountant, Admin) and Role-Based Access Control (RBAC).
-   **Database**: Prisma ORM with PostgreSQL (SQLite for development). Schema includes `User`, `Company`, `CreditInventory`, `Hold`, `PurchaseOrder`, `Document`, `AuditLog`, and `AccountantClient` models.
-   **Security**: Bcrypt for password hashing, NextAuth session management, Zod for input validation, and Stripe webhook verification.
-   **PDF Generation**: `@react-pdf/renderer` for creating broker packages and closing certificates.
-   **Email**: Resend for transactional emails.
-   **Audit Logging**: Tracks system activity.
-   **File Storage**: Private per-company document storage in `/uploads/{companyId}/` with RBAC-enforced access via API routes. Security includes path traversal protection (basename normalization), CRLF header injection prevention (control character filtering), and role-based access (ADMIN full, ACCOUNTANT via AccountantClient link, COMPANY self only).

### Feature Specifications
-   **User Management**: Registration, login, and role-based access.
-   **Marketplace**: Browse, filter, reserve, and purchase tax credits.
-   **Purchase Workflow**: Stripe checkout integration, purchase order creation, admin approval, and automated PDF generation.
-   **Inventory Management**: Admin interface for CRUD operations on tax credit inventory.
-   **Accountant Features**: Client management via `/clients` page with per-company document upload/management through DocumentManager modal. Documents are stored in isolated company folders with RBAC access control enforced at the API level.
-   **Reporting**: CSV exports for inventory and purchases, and Admin audit log viewer.
-   **Tax Credit Calculator**: Interactive module calculating face value, costs, fees, savings, and effective discount.

### System Design Choices
-   **Project Structure**: `app/` (App Router, API routes, pages), `components/`, `lib/` (utilities for auth, db, email, pdf, audit, validations, storage, calculations), `prisma/`, `types/`.
-   **Environment Variables**: Configurable via `.env`.
-   **Database Seeding**: Enhanced script for initial setup.
-   **Error Handling**: Integrated error handling and user-friendly alerts.

## External Dependencies
-   **Stripe**: Payment processing and webhooks.
-   **Resend**: Transactional emails.
-   **NextAuth.js**: Authentication and session management.
-   **Prisma ORM**: Database interaction.
-   **@react-pdf/renderer**: PDF document generation.
-   **bcrypt**: Password hashing.
-   **Zod**: Input validation.
-   **framer-motion**: Animations.
-   **tailwindcss-animate**: Tailwind CSS animations.
-   **@aws-sdk/client-s3**: S3 integration (optional for production file storage).