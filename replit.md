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