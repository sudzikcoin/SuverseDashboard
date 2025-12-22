# Test User Cleanup Script

## Purpose

This script deletes specific test users from the development database by email address, allowing you to reuse those emails for new registrations during testing.

## ⚠️ DEVELOPMENT/TEST ONLY

This script is designed **exclusively** for development and testing environments. It includes a safety guard that prevents execution in production (`NODE_ENV === 'production'`).

## How to Use

### 1. Edit the Email List

Open `scripts/cleanup-test-users.ts` and edit the `TEST_EMAILS` array to include the emails you want to clean up:

```typescript
const TEST_EMAILS: string[] = [
  'agip31@gmail.com',
  'agip32@icloud.com',
  'sudzikcoin@gmail.com',
  // Add more test emails below:
  // 'another-test@example.com',
];
```

### 2. Run the Script

In the Replit Shell, run:

```bash
npm run cleanup:test-users
```

### 3. Expected Output

The script will:
- Show which emails it's looking for
- Report which users were found in the database
- Delete all related records (verification tokens, companies, brokers, audit logs, etc.)
- Confirm which users were deleted
- Report any emails that weren't found (already clean)

Example output:
```
[cleanup-test-users] 🧹 Starting test user cleanup...
[cleanup-test-users] 📋 Emails to clean up: 3
   - agip31@gmail.com
   - agip32@icloud.com
   - sudzikcoin@gmail.com

[cleanup-test-users] 🔍 Found 2 user(s) to delete:
   - agip31@gmail.com (id: abc123)
   - agip32@icloud.com (id: def456)

[cleanup-test-users] 📋 Deleting related records...
   ✓ Deleted 2 email verification tokens
   ✓ Deleted 2 companies
   ✓ Deleted 2 users

═══════════════════════════════════════════════════════
✅ Cleanup complete!
═══════════════════════════════════════════════════════

Cleaned up emails:
   ✓ agip31@gmail.com
   ✓ agip32@icloud.com

Not found (already clean):
   - sudzikcoin@gmail.com

📝 You can now re-register with these email addresses.
```

## What Gets Deleted

When a test user is deleted, the script also removes:

- Email verification tokens
- Accountant-client relationships (if accountant)
- Audit logs created by the user
- Documents uploaded by the user
- Company and all company-related records (holds, purchase orders, purchases, payments)
- Broker and broker credit pools (if broker)

## Safety Features

1. **Production Guard**: Will not run if `NODE_ENV === 'production'`
2. **Targeted Deletion**: Only deletes users whose emails are in the `TEST_EMAILS` array
3. **Idempotent**: Safe to run multiple times - won't throw if users don't exist
4. **Atomic Transaction**: All deletions happen in a transaction (all or nothing)

## Adding New Emails

Simply add new emails to the `TEST_EMAILS` array in `scripts/cleanup-test-users.ts`:

```typescript
const TEST_EMAILS: string[] = [
  'agip31@gmail.com',
  'agip32@icloud.com',
  'sudzikcoin@gmail.com',
  'new-test-email@example.com',  // Add new emails here
];
```
