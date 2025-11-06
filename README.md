# SuVerse Tax Credit Dashboard

A comprehensive web application for U.S. businesses and accountants to discover, reserve, purchase, and track transferable tax credits (ITC, PTC, 45Q, 48C, 48E).

## Features

- **Role-Based Access Control**: Three roles (Company, Accountant, Admin) with distinct permissions
- **Tax Credit Marketplace**: Browse and filter available tax credits with transparent pricing
- **Reserve & Purchase**: 72-hour holds or immediate purchase via Stripe Checkout
- **Compliance Workflow**: Document upload and KYC tracking
- **Broker Management**: Admin approval workflow with PDF generation
- **Email Notifications**: Automated emails for holds, payments, and approvals
- **Audit Logging**: Track all system changes
- **CSV Exports**: Export inventory and purchase data

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Stripe Checkout
- **Email**: Resend
- **PDFs**: @react-pdf/renderer

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Replit DB or Supabase)
- Stripe account (test mode for development)
- Resend account (optional for email)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database (provided by Replit or configure Supabase)
DATABASE_URL=postgresql://user:password@host:port/database

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:5000

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_FEE_PERCENT=0.02
STRIPE_FEE_FLAT_USD=499

# Email (Resend)
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=noreply@suverse.io

# Admin Credentials
ADMIN_EMAIL=admin@suverse.io
ADMIN_PASSWORD=ChangeMe_2025
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

```bash
# Push Prisma schema to database
npm run db:push

# Seed database with demo data and admin user
npm run db:seed
```

This creates:
- Admin user: `admin@suverse.io` / `ChangeMe_2025`
- 5 demo tax credit inventory items

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

## User Roles & Credentials

### Admin
- **Email**: admin@suverse.io
- **Password**: ChangeMe_2025 (configured in .env.local)
- **Access**: Full system access, inventory management, purchase approval

### Company (Buyer)
- Register at `/register` with role "Company (Buyer)"
- Provide company details (legal name, EIN, state, etc.)
- **Access**: Browse marketplace, reserve/purchase credits, view own purchases

### Accountant
- Register at `/register` with role "Accountant"
- **Access**: Invite clients, view client purchases, browse marketplace

## Key Features & Workflows

### 1. Company Purchase Flow

1. **Register/Login** → Company provides business details
2. **Browse Marketplace** → Filter by credit type, tax year, price
3. **Reserve or Purchase**:
   - **Reserve**: Creates 72-hour hold, reduces available inventory
   - **Purchase**: Redirects to Stripe Checkout
4. **Payment** → Stripe processes payment, webhook updates status
5. **Broker Review** → Admin approves/rejects purchase
6. **Certificate** → Closing certificate PDF generated and emailed

### 2. Admin Workflow

1. **Manage Inventory** → Add/edit tax credit lots
2. **Review Purchases** → Approve or reject paid orders
3. **Generate Certificates** → System auto-generates PDFs on approval
4. **Export Data** → Download CSV reports

### 3. Accountant Workflow

1. **Invite Clients** → Send email invitations to companies
2. **View Client Purchases** → Monitor client orders and status
3. **Download Certificates** → Access client closing certificates

## API Endpoints

### Public
- `POST /api/auth/register` - User registration
- `POST /api/auth/[nextauth]` - NextAuth login

### Authenticated
- `GET /api/inventory` - List available credits (with filters)
- `POST /api/holds` - Create 72-hour hold
- `POST /api/checkout` - Create Stripe checkout session
- `GET /api/purchases` - List company purchases

### Admin Only
- `POST /api/admin/inventory` - Add inventory
- `GET /api/admin/inventory` - List all inventory
- `POST /api/admin/purchases/[id]/broker-status` - Update broker status
- `GET /api/admin/export/inventory` - Export inventory CSV
- `GET /api/admin/export/purchases` - Export purchases CSV

### Webhooks
- `POST /api/webhooks/stripe` - Stripe payment webhook

## Deployment

### Vercel Deployment

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy to Vercel**:
   - Import project from GitHub
   - Add all environment variables from `.env.local`
   - Update `NEXTAUTH_URL` to your Vercel URL
   - Deploy

3. **Configure Stripe Webhook**:
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
   - Select event: `checkout.session.completed`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## Configuration Checklist

### Required for Full Functionality

- [ ] **PostgreSQL Database**: Set `DATABASE_URL`
- [ ] **NextAuth**: Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
- [ ] **Stripe**: 
  - [ ] Set `STRIPE_SECRET_KEY` (test key: `sk_test_...`)
  - [ ] Set `STRIPE_WEBHOOK_SECRET` after configuring webhook
- [ ] **Email (Optional)**: Set `RESEND_API_KEY` for email notifications
- [ ] **Admin Password**: Set `ADMIN_PASSWORD` in .env

### Stripe Test Mode Setup

1. Create Stripe account at [stripe.com](https://stripe.com)
2. Get test API key from Dashboard → Developers → API keys
3. Use test card: `4242 4242 4242 4242`, any future expiry, any CVC

### Email Setup (Optional - Resend)

1. Create account at [resend.com](https://resend.com)
2. Get API key from Dashboard
3. If not configured, emails will be logged to console

## Testing

### Manual Test Flow

1. **Register Company**:
   - Go to `/register`
   - Select "Company (Buyer)"
   - Fill in company details
   - Create account

2. **Browse & Purchase**:
   - Login and go to `/marketplace`
   - Select a credit (e.g., ITC 2024)
   - Click "Purchase Now"
   - Complete Stripe checkout with test card: `4242 4242 4242 4242`

3. **Admin Approval**:
   - Login as admin (`admin@suverse.io`)
   - Go to Admin → Purchase Orders
   - Review paid order
   - Approve purchase

4. **Verify Certificate**:
   - Check company email for closing certificate
   - Download PDF from purchases page

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── admin/            # Admin pages
│   ├── checkout/         # Checkout success/cancel
│   ├── dashboard/        # Main dashboard
│   ├── login/            # Login page
│   ├── marketplace/      # Marketplace page
│   ├── purchases/        # Purchase history
│   └── register/         # Registration
├── components/           # Reusable UI components
├── lib/                  # Utilities (auth, db, email, pdf)
├── prisma/               # Database schema and migrations
│   ├── schema.prisma
│   └── seed.ts
└── types/                # TypeScript type definitions
```

## Database Schema

Key models:
- **User**: Authentication and role management
- **Company**: Business entity details
- **CreditInventory**: Available tax credits
- **Hold**: 72-hour reservations
- **PurchaseOrder**: Purchase transactions
- **Document**: Uploaded compliance files
- **AuditLog**: System activity tracking

## Security Features

- Password hashing with bcrypt
- NextAuth session management
- Role-based access control (RBAC)
- Stripe webhook signature verification
- Input validation with Zod
- SQL injection prevention via Prisma

## Support & Troubleshooting

### Common Issues

**"Invalid credentials" on login**
- Ensure database is seeded: `npm run db:seed`
- Check admin credentials match `.env.local`

**Stripe checkout fails**
- Verify `STRIPE_SECRET_KEY` is set
- Use test card in test mode
- Check console for errors

**Emails not sending**
- Set `RESEND_API_KEY` in .env
- Emails log to console if not configured

**Database connection error**
- Verify `DATABASE_URL` is correct
- Run `npm run db:push` to sync schema

## License

MIT

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

**Built with ❤️ for the tax credit marketplace**
