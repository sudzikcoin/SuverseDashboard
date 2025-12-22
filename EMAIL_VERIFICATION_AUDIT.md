# Email Verification Audit

## Date: November 25, 2025

## Issue Reported
- User registered with `agip32@icloud.com` and saw "Check your email" screen
- Resend logs show NO record of this email
- Other emails (gmail) are delivered

## Root Cause Analysis

### Email Sending Infrastructure
The project has TWO email providers configured:

1. **Resend** (`lib/email/resend.ts`, `lib/email/send.ts`)
   - Used for: Welcome emails via `sendWelcomeEmail()`
   - API Key: `RESEND_API_KEY` (configured)
   - From: `RESEND_FROM`

2. **SendGrid** (`lib/email/sendgrid.ts`)
   - Used for: Email verification via `sendTransactionalEmail()`
   - API Key: `SENDGRID_API_KEY` (configured)
   - From: `EMAIL_FROM_ADDRESS` or `info@suverse.io`

### The Problem
**Email verification emails are routed through SendGrid, NOT Resend.**

The flow:
1. `app/api/auth/register/route.ts` creates user
2. Calls `createEmailVerificationToken()` from `lib/auth/emailVerification.ts`
3. `emailVerification.ts` calls `sendTransactionalEmail()` from `lib/email/sendgrid.ts`
4. **SendGrid sends the email (or fails silently if API key issues)**

Since the user is checking Resend logs and not seeing emails, this confirms the issue - emails go through SendGrid, not Resend.

## Files Involved in Registration + Email Flow

| File | Purpose |
|------|---------|
| `app/api/auth/register/route.ts` | Main registration API - creates user, calls `createEmailVerificationToken()` |
| `lib/auth/emailVerification.ts` | Creates token in DB, sends verification email via **SendGrid** |
| `lib/email/sendgrid.ts` | SendGrid client for transactional emails |
| `lib/email/resend.ts` | Resend client (not used for verification) |
| `lib/email/send.ts` | Welcome email via Resend |
| `app/api/auth/resend-verification/route.ts` | Resend verification token |

## Roles Supported
- COMPANY - creates Company + User, sends verification
- BROKER - creates Broker + User, sends verification
- ACCOUNTANT - creates User only, sends verification
- ADMIN - cannot self-register (blocked)

## Fix Applied

Changed `lib/auth/emailVerification.ts` to use **Resend** instead of SendGrid:
- Import `resend` and `fromAddress` from `lib/email/resend.ts`
- Replace `sendTransactionalEmail()` call with `resend.emails.send()`
- Added detailed logging before/after email send
- Added proper error handling with specific log messages

## Post-Fix Flow
1. User registers via any role (COMPANY, BROKER, ACCOUNTANT)
2. `createEmailVerificationToken()` is called
3. **Resend** sends the verification email
4. Email appears in Resend logs
5. User receives email at any domain (Gmail, iCloud, etc.)

## Test Results
TBD - Run test script after fix

## Validation Steps for Human
1. Go to `/register` in the app
2. Register a new user with any email domain (iCloud, Gmail, etc.)
3. Check Replit console logs for: `[EMAIL] Sending verification email to ...`
4. Check Resend dashboard for the email record
5. Check inbox for the verification email
