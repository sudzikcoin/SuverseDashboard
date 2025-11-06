# Setup Checklist - SuVerse Tax Credit Dashboard

Your SuVerse Tax Credit Dashboard MVP is complete and ready to use! Follow this checklist to configure external services.

## ✅ Already Configured

- [x] Next.js 14 application initialized
- [x] PostgreSQL database connected
- [x] Database schema created and seeded
- [x] Admin user created
- [x] 5 demo tax credits added
- [x] Development server running on port 5000

## 🔑 Admin Credentials

**Email:** admin@suverse.io  
**Password:** ChangeMe_2025

## 📋 External Services Setup

### 🔵 Stripe (Required for Payments)

**Status:** ⚠️ Required - App will work but purchases will fail without this

**Steps:**
1. Create a free account at [stripe.com](https://stripe.com)
2. Navigate to: Dashboard → Developers → API keys
3. Copy your **Test Secret Key** (starts with `sk_test_...`)
4. Add to `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_your_key_here
   ```
5. Set up webhook:
   - Go to: Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://your-app-url.com/api/webhooks/stripe`
   - Events to send: Select `checkout.session.completed`
   - Click "Add endpoint"
   - Copy the **Signing secret** (starts with `whsec_...`)
6. Add webhook secret to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

**Test Card:** 4242 4242 4242 4242 (any future expiry, any CVC)

### 📧 Resend (Optional - for Email Notifications)

**Status:** ✅ Optional - App works without it (emails logged to console)

**Steps:**
1. Create account at [resend.com](https://resend.com)
2. Navigate to: Dashboard → API Keys
3. Create new API key
4. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_your_key_here
   ```

**Without Resend:** Email notifications are logged to the console

## 🚀 Testing the Application

### 1. View Landing Page
- Visit: http://localhost:5000
- Should see SuVerse branding and "Enter Dashboard" / "Sign Up" buttons

### 2. Admin Login
1. Click "Enter Dashboard"
2. Login with: `admin@suverse.io` / `ChangeMe_2025`
3. Verify you can:
   - See admin dashboard
   - View 5 tax credits in admin inventory
   - Access purchase orders page

### 3. Company Registration
1. Logout (or use incognito window)
2. Click "Sign Up"
3. Select "Company (Buyer)"
4. Fill in:
   - Email: your-test@example.com
   - Password: test123456
   - Company Legal Name: Test Company
   - State: CA
   - EIN: 12-3456789 (optional)
5. Register and login

### 4. Browse & Reserve
1. Go to "Marketplace"
2. Click on any credit (e.g., ITC 2024)
3. View details and discount calculation
4. Try "Reserve (72h Hold)"
5. Check console for email notification

### 5. Purchase Flow (Requires Stripe)
1. Select a credit
2. Click "Purchase Now"
3. Complete Stripe checkout with test card
4. Return to app → view "My Purchases"
5. Login as admin → approve purchase
6. Check for closing certificate

## 📊 Current Status Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ Working | 3 roles: Company, Accountant, Admin |
| Marketplace | ✅ Working | Browse, filter, view details |
| Reserve System | ✅ Working | 72-hour holds |
| Stripe Checkout | ⚠️ Needs Config | Add STRIPE_SECRET_KEY |
| Payments | ⚠️ Needs Config | Configure Stripe webhook |
| Admin Inventory | ✅ Working | CRUD operations |
| Admin Approvals | ✅ Working | Approve/reject purchases |
| PDF Generation | ✅ Working | Broker packages & certificates |
| Email Notifications | ⚠️ Optional | Add RESEND_API_KEY or use console |
| CSV Exports | ✅ Working | Inventory & purchases |
| Audit Logging | ✅ Working | All actions tracked |

## 🌐 Deployment to Production

### Option 1: Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add all environment variables from `.env.local`
   - Update `NEXTAUTH_URL` to your Vercel URL
   - Deploy

3. **Update Stripe Webhook:**
   - Change webhook URL to your production URL
   - Keep using test keys for staging
   - Switch to live keys when ready for production

### Environment Variables for Deployment

```env
DATABASE_URL=<your-production-db-url>
NEXTAUTH_SECRET=<generate-new-secret>
NEXTAUTH_URL=https://your-app.vercel.app
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_... (optional)
STRIPE_PRICE_FEE_PERCENT=0.02
STRIPE_FEE_FLAT_USD=499
ADMIN_PASSWORD=<change-this>
```

## 🔐 Security Notes

- [x] Admin self-registration is blocked
- [x] Passwords are hashed with bcrypt
- [x] All admin endpoints protected with RBAC
- [x] Stripe webhooks verify signatures
- [x] Input validation with Zod
- [ ] **Action Required:** Change admin password after first login
- [ ] **Action Required:** Generate new NEXTAUTH_SECRET for production
- [ ] **Action Required:** Use Stripe live keys for production

## 📝 Known Limitations (MVP Scope)

These features are documented for post-MVP development:

- Accountant client invitation system (stub implemented)
- Document upload functionality (schema ready)
- Automated hold expiration cleanup
- Purchase detail views
- Rate limiting on POST endpoints

See `README.md` and `replit.md` for full documentation.

## 🆘 Troubleshooting

**"Cannot connect to database"**
- Check `DATABASE_URL` in `.env.local`
- Run: `npm run db:push`

**"Invalid credentials" on login**
- Verify database is seeded: `npm run db:seed`
- Check admin credentials match `.env.local`

**Stripe checkout fails**
- Verify `STRIPE_SECRET_KEY` is set
- Check console for errors
- Ensure using test mode keys

**Emails not sending**
- This is normal without `RESEND_API_KEY`
- Check console logs for email content

## ✅ Next Steps

1. [ ] Configure Stripe test keys
2. [ ] Test complete purchase flow
3. [ ] Customize admin password
4. [ ] Test as Company user
5. [ ] Test admin approval workflow
6. [ ] Deploy to Vercel (optional)
7. [ ] Configure production Stripe webhook

---

**Questions or issues?** Check the comprehensive `README.md` for detailed documentation.
