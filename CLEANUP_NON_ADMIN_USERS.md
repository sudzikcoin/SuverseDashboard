# Non-Admin User Cleanup Script

## Purpose

This script deletes **all non-admin users** and their related data from the development database, while preserving admin accounts. Use this when you've run out of test email addresses and need to reuse them.

## ⚠️ WARNING: DEVELOPMENT ONLY

This script will **permanently delete** all non-admin user accounts and their associated data. It is designed exclusively for development and testing environments.

## What Gets Deleted

| Model | Relationship |
|-------|--------------|
| `User` | All users where role != 'ADMIN' |
| `Company` | Companies linked to deleted users |
| `Broker` | Brokers linked to deleted users |
| `EmailVerificationToken` | Tokens for deleted users |
| `AccountantClient` | Accountant-client relationships |
| `AuditLog` | Logs for deleted users/companies |
| `Document` | Documents uploaded by deleted users |
| `PaymentLog` | Payment logs for deleted users |
| `Payment` | Payments for deleted companies |
| `Purchase` | Purchases for deleted companies |
| `Hold` | Holds for deleted companies |
| `PurchaseOrder` | Purchase orders for deleted companies |
| `BrokerCreditPool` | Credit pools for deleted brokers |

## What Is Preserved

- All users with `role === 'ADMIN'`
- Global/system data:
  - `CreditInventory` (tax credit listings)
  - Any other reference data not tied to specific users

## How to Run

```bash
npm run cleanup:non-admin-users
```

## Safety Features

1. **Production Guard**: Will not run if `NODE_ENV === 'production'`
2. **Admin Protection**: Explicitly logs all admin users that will be preserved
3. **Preview Before Delete**: Shows all non-admin users that will be deleted
4. **Atomic Transaction**: All deletions happen in a single transaction (all or nothing)

## Example Output

```
═══════════════════════════════════════════════════════
🧹 Non-Admin User Cleanup Script
═══════════════════════════════════════════════════════

[cleanup] 🛡️  Admin users (WILL BE PRESERVED):
   ✓ admin@suverse.io (ADMIN) - ID: abc123

[cleanup] 🗑️  Non-admin users (WILL BE DELETED): 5
   - test1@gmail.com (COMPANY)
   - test2@icloud.com (BROKER)
   - test3@example.com (ACCOUNTANT)
   ...

[cleanup] 📋 Deleting related records...
   ✓ Deleted 5 email verification tokens
   ✓ Deleted 3 companies
   ✓ Deleted 1 brokers
   ✓ Deleted 5 users

═══════════════════════════════════════════════════════
✅ Cleanup Complete!
═══════════════════════════════════════════════════════

📊 Summary of deleted records:
   EmailVerificationToken: 5
   Company: 3
   Broker: 1
   User: 5

🛡️  Preserved admin users:
   ✓ admin@suverse.io

📝 You can now reuse the deleted email addresses for new registrations.
```

## Models Affected (14 total)

1. EmailVerificationToken
2. AccountantClient
3. AuditLog
4. Document
5. PaymentLog
6. Payment
7. Purchase
8. Hold
9. PurchaseOrder
10. Company
11. BrokerCreditPool
12. Broker
13. User

## After Running

You can verify the cleanup by:
1. Trying to register with a previously used email address
2. Checking the database via Prisma Studio (`npx prisma studio`)
3. Logging in as an admin to confirm admin access still works
