# Email Verification Status

## Current Implementation

Email verification is handled by **Resend** (not SendGrid).

### Files Involved

| File | Purpose |
|------|---------|
| `lib/auth/emailVerification.ts` | Main verification logic - creates tokens and sends emails via Resend |
| `lib/email/resendClient.ts` | Resend client wrapper (optional, for shared usage) |
| `scripts/test-resend-email.ts` | Dev-only script to test Resend configuration |

### Environment Variables Required

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Your Resend API key (required) |
| `RESEND_FROM` | Email address to send from (must be from a verified domain) |

## ⚠️ IMPORTANT: RESEND_FROM Configuration

The `RESEND_FROM` address **must** be from a verified domain in your Resend account.

### Problem: Sandbox Mode
If `RESEND_FROM` is set to `onboarding@resend.dev` (Resend's sandbox address):
- Emails can **only** be sent to the Resend account owner's email
- All other recipients will get a 403 error
- Emails won't appear in Resend dashboard for other recipients

### Solution: Use a Verified Domain
1. Go to [Resend Domains](https://resend.com/domains)
2. Add and verify your domain (e.g., `suverse.io`)
3. Set `RESEND_FROM` to an email from that domain (e.g., `info@suverse.io`)

## Testing Email Verification

### Quick Test (Dev Only)

```bash
npm run test:resend-email
```

This sends a test email and shows:
- Whether `RESEND_API_KEY` is configured
- The Resend API response
- Any errors with helpful hints

### Full Flow Test

1. Register a new user through the signup form
2. Check console logs for `[EMAIL]` markers:
   - `[EMAIL] Sending verification email to...`
   - `[EMAIL] Resend API response...`
   - `[EMAIL] ✓ Verification email sent successfully...` (on success)
3. Check your Resend dashboard for the email
4. Check the recipient's inbox

## Console Log Markers

All email-related logs use the `[EMAIL]` prefix for easy filtering:

```
[EMAIL] Sending verification email to test@example.com, userId=abc123
[EMAIL] From address: info@suverse.io
[EMAIL] Resend API response for test@example.com: {"data":{"id":"msg_xxx"}}
[EMAIL] ✓ Verification email sent successfully to test@example.com, id=msg_xxx
```

### Error Examples

**Sandbox Mode Error:**
```
[EMAIL] Resend API error for test@example.com:
[EMAIL]   Status: 403
[EMAIL]   Name: validation_error
[EMAIL]   Message: You can only send testing emails to your own email address...
[EMAIL] ⚠️  FIX: Set RESEND_FROM to a verified domain email (e.g., info@suverse.io)
```

**Missing API Key:**
```
[EMAIL] Missing RESEND_API_KEY, cannot send emails
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Emails not appearing in Resend dashboard | Check `RESEND_FROM` is a verified domain email, not `onboarding@resend.dev` |
| 403 "validation_error" | Set `RESEND_FROM` to a verified domain email |
| Emails not arriving | Check spam folder, verify domain DNS in Resend |
| Missing API key errors | Ensure `RESEND_API_KEY` secret is set |

## Previous Issues (Fixed)

- **Dec 22, 2025**: Fixed email verification to use Resend instead of SendGrid
- Added detailed logging with `[EMAIL]` markers
- Added sandbox mode detection and warnings
- Created test script for debugging
