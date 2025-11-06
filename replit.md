# SuVerse Tax Credit Dashboard

## Project Overview
A comprehensive MVP web application for U.S. businesses and accountants to discover, reserve, purchase, and track transferable tax credits (ITC, PTC, 45Q, 48C, 48E).

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js for authentication
- **Database**: SQLite (development) with Prisma ORM
- **Payments**: Stripe Checkout with webhook integration
- **Email**: Resend for transactional emails
- **PDF Generation**: @react-pdf/renderer

## Current Status
**Status**: MVP Complete - Authentication & Database Fully Operational ✅

### Implemented Features
✅ User authentication with three roles (Company, Accountant, Admin)
✅ Company registration with business details
✅ Tax credit marketplace with filtering
✅ 72-hour hold system
✅ Stripe checkout integration
✅ Purchase order workflow
✅ Admin inventory management
✅ Admin purchase approval workflow
✅ PDF generation for broker packages and closing certificates
✅ Email notifications (stubs - requires Resend API key)
✅ Audit logging
✅ CSV exports for inventory and purchases
✅ Role-based access control (RBAC)
✅ Seed data with 5 demo credits and admin user

### Security Features
✅ Password hashing with bcrypt
✅ NextAuth session management
✅ Admin self-registration blocked
✅ Role-based access control on all endpoints
✅ Stripe webhook signature verification
✅ Input validation with Zod

## Project Structure
```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── admin/        # Admin-only endpoints
│   │   └── webhooks/     # Stripe webhook
│   ├── admin/            # Admin dashboard pages
│   ├── dashboard/        # Main user dashboard
│   ├── marketplace/      # Tax credit marketplace
│   └── purchases/        # Purchase history
├── components/            # Reusable React components
├── lib/                   # Utilities
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Prisma client
│   ├── email.ts         # Email service
│   ├── pdf.ts           # PDF generation
│   ├── audit.ts         # Audit logging
│   └── validations.ts   # Zod schemas
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
└── types/               # TypeScript definitions
```

## Environment Variables Required

### Core (Already Set)
- `DATABASE_URL` - SQLite database (file:./prisma/dev.db) - overridden in lib/db.ts for development
- `NEXTAUTH_SECRET` - Session encryption key ("dev-secret")
- `AUTH_TRUST_HOST` - Enable NextAuth in Replit preview (true)

### External Services Needed
- `STRIPE_SECRET_KEY` - Stripe API key (sk_test_...)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (whsec_...)
- `RESEND_API_KEY` - Resend email API key (optional)

### Configuration
- `STRIPE_PRICE_FEE_PERCENT` - Platform fee % (default: 0.02)
- `STRIPE_FEE_FLAT_USD` - Flat fee in USD (default: 499)
- `ADMIN_PASSWORD` - Admin account password (default: ChangeMe_2025)

## Admin Credentials
- **Email**: admin@suverse.io
- **Password**: ChangeMe_2025

## Database Schema (SQLite)
- **User**: Authentication and role management
- **Company**: Business entity details
- **CreditInventory**: Tax credit lots for sale
- **Hold**: 72-hour reservations
- **PurchaseOrder**: Purchase transactions
- **Document**: Uploaded compliance files
- **AuditLog**: System activity tracking
- **AccountantClient**: Accountant-client relationships

### Database Setup
Database location: `prisma/dev.db` (SQLite)
- Auto-created on first run via lib/db.ts override
- Seeded with admin user and 5 demo tax credits
- Reset endpoint available: `POST /api/debug/reset` (dev only)

## User Flows

### Company (Buyer)
1. Register with company details
2. Browse marketplace
3. Reserve (72h hold) or purchase immediately
4. Complete Stripe checkout
5. Admin approves purchase
6. Receive closing certificate via email

### Admin (Broker)
1. Manage inventory (CRUD operations)
2. Review paid purchase orders
3. Approve/reject/request more info
4. System auto-generates PDFs and emails

### Accountant
1. Register as accountant
2. Invite client companies (feature stub)
3. View client purchases (feature stub)
4. Download certificates

## Testing Checklist

### Registration & Login
- [ ] Register as Company with business details
- [ ] Register as Accountant
- [ ] Cannot self-register as Admin
- [ ] Login with registered credentials
- [ ] Admin login with seeded credentials

### Marketplace
- [ ] Browse 5 seeded tax credits
- [ ] View credit details with discount calculation
- [ ] Filter by credit type (if implemented)

### Purchase Flow
- [ ] Create 72-hour hold
- [ ] Purchase with Stripe (test card: 4242 4242 4242 4242)
- [ ] Stripe webhook marks order as PAID
- [ ] Email confirmation sent (check console if no API key)

### Admin Functions
- [ ] View all inventory
- [ ] View all purchase orders
- [ ] Approve paid order
- [ ] Closing certificate generated
- [ ] Export CSV reports

## External Service Setup

### Stripe (Required for Payments)
1. Create account at stripe.com
2. Get test API key: Dashboard → Developers → API keys
3. Copy secret key (sk_test_...) to STRIPE_SECRET_KEY
4. Set up webhook:
   - URL: https://your-app.com/api/webhooks/stripe
   - Event: checkout.session.completed
   - Copy signing secret to STRIPE_WEBHOOK_SECRET

### Resend (Optional for Emails)
1. Create account at resend.com
2. Get API key from dashboard
3. Add to RESEND_API_KEY
4. Without this, emails are logged to console

## Known Limitations (Acceptable for MVP)
- Accountant client invitation system is a stub
- Document upload functionality not implemented
- Purchase detail view is basic
- No automated hold expiration cleanup
- Email functionality requires external API key

## Next Steps for Production
1. Set up Stripe account and configure webhook
2. Set up Resend for production emails
3. Implement document upload with file storage
4. Build accountant client invitation flow
5. Add automated cron job for hold expiration
6. Implement comprehensive testing
7. Add rate limiting on POST endpoints
8. Configure custom domain

## Recent Changes (November 6, 2025)
- ✅ Migrated database from PostgreSQL to SQLite for local development
- ✅ Fixed NextAuth integration with trustHost configuration
- ✅ Updated lib/db.ts to force SQLite DATABASE_URL in development
- ✅ Database fully seeded with admin user and 5 demo tax credits
- ✅ Enhanced UI readability: labels text-gray-800, inputs text-gray-900, placeholders placeholder-gray-500
- ✅ Created POST /api/debug/reset endpoint for database reset (dev only)
- ✅ Verified end-to-end: registration, login, session management all working
- ✅ Server running on port 5000 with proper Replit preview compatibility
