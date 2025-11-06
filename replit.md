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
**Status**: MVP Complete with Modern Dark Theme UI ✅

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
✅ Seed data with admin, accountant, 3 companies, 5 demo credits, audit logs
✅ Modern dark theme with green accents (Clario-style)
✅ Accountant client management page (/clients)
✅ Admin audit log viewer (/admin/audit)
✅ RequireRole HOC for page-level authorization

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
│   │   ├── audit/        # Audit log API
│   │   ├── clients/      # Client management API
│   │   └── webhooks/     # Stripe webhook
│   ├── admin/            # Admin dashboard pages
│   │   ├── audit/       # Audit log viewer
│   │   ├── inventory/   # Inventory management
│   │   └── purchases/   # Purchase orders
│   ├── clients/          # Accountant client management
│   ├── dashboard/        # Main user dashboard
│   ├── marketplace/      # Tax credit marketplace
│   └── purchases/        # Purchase history
├── components/            # Reusable React components
│   ├── auth/            # Auth-related components
│   │   └── RequireRole.tsx  # Role-based access HOC
│   ├── Card.tsx         # Reusable card component
│   ├── Sidebar.tsx      # Navigation sidebar
│   └── SessionProvider.tsx  # NextAuth provider
├── lib/                   # Utilities
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Prisma client
│   ├── email.ts         # Email service
│   ├── pdf.ts           # PDF generation
│   ├── audit.ts         # Audit logging
│   └── validations.ts   # Zod schemas
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Enhanced seed script
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

## Test Credentials
- **Admin Email**: admin@suverse.io / Password: ChangeMe_2025
- **Accountant Email**: accountant@example.com / Password: Demo123!
- **Demo Company Emails**: tech-innovations@example.com, green-energy@example.com, carbon-solutions@example.com / Password: Demo123!

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
- Enhanced seed data includes:
  - 1 admin user, 1 accountant user, 3 demo company users
  - 5 demo tax credits (ITC, PTC, 45Q variants)
  - Sample audit log entries
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
2. View assigned client companies (/clients page)
3. Manage client relationships
4. Access marketplace to advise clients
5. Download certificates for client purchases

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

### Phase 1: Database & Authentication Setup
- ✅ Migrated database from PostgreSQL to SQLite for local development
- ✅ Fixed NextAuth integration with trustHost configuration
- ✅ Updated lib/db.ts to force SQLite DATABASE_URL in development
- ✅ Database fully seeded with admin user and 5 demo tax credits
- ✅ Created POST /api/debug/reset endpoint for database reset (dev only)
- ✅ Verified end-to-end: registration, login, session management all working
- ✅ Server running on port 5000 with proper Replit preview compatibility

### Phase 2: Dark Theme Redesign (Latest)
- ✅ Implemented modern dark theme across entire application
  - Background: #0B1220 (deep navy/black)
  - Card/Section: #0F172A (dark blue)
  - Sidebar: #0E1526 with borders
  - Brand color: #10B981 (emerald green - Clario-style)
- ✅ Enhanced typography for readability on dark backgrounds
  - Headers: text-white
  - Body text: text-gray-100
  - Labels: text-gray-200 with font-semibold
  - Placeholders: placeholder-gray-500
  - Price values: text-green-400
- ✅ Updated all pages with consistent dark theme:
  - Login page: Dark centered card with green CTA button
  - Register page: Dark form with improved contrast
  - Homepage: Dark landing page with subtle borders
  - Dashboard: Role-based dark cards with navigation
  - Sidebar: Dark navigation with green active states
  - Admin Inventory: Dark cards with readable values and green price highlights
  - Admin Purchases: Dark cards with centered empty state
  - Marketplace: Dark grid cards with green accents and modal
  - Clients: Dark table with proper contrast
  - Audit Log: Dark table layout
- ✅ Button styling standardization:
  - Primary (green): bg-green-500 hover:bg-green-600 text-black
  - Secondary (gray): bg-white/10 hover:bg-white/20 text-gray-100
  - Export CSV: bg-green-600 hover:bg-green-700 with shadow
- ✅ Card & panel styling:
  - All cards: bg-[#0F172A] border border-white/5 rounded-xl shadow-md
  - Hover states: hover:shadow-lg transition
  - Empty states: Centered with text-gray-300
  - Status badges: bg-green-600/red-600/yellow-600 text-white font-medium
- ✅ Created RequireRole HOC for role-based page access control
- ✅ Built /clients page for accountants (view assigned companies)
- ✅ Built /admin/audit page for system activity logs
- ✅ Enhanced seed data with:
  - 1 accountant user (accountant@example.com)
  - 3 demo companies with realistic data
  - Sample audit log entries
- ✅ Fixed all dashboard card links to properly navigate
- ✅ Updated Tailwind config with brand colors (#10B981)
- ✅ Applied global body styling: @apply bg-[#0B1220] text-gray-100
