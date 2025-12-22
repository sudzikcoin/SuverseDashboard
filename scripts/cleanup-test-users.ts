/**
 * Test User Cleanup Script
 * 
 * ⚠️  WARNING: This script is for DEVELOPMENT/TEST ONLY!
 * 
 * This script deletes specific test users by email address,
 * allowing you to reuse those emails for new registrations.
 * 
 * Safety Guards:
 *   - Will NOT run if NODE_ENV === 'production'
 *   - Only deletes users with emails in the specified list
 *   - Safe and idempotent - won't throw if user doesn't exist
 * 
 * Usage:
 *   npm run cleanup:test-users
 * 
 * To add/remove emails: Edit the TEST_EMAILS array below.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════════════
// EDIT THIS LIST: Add or remove test emails as needed
// ═══════════════════════════════════════════════════════════════════════════
const TEST_EMAILS: string[] = [
  'agip31@gmail.com',
  'agip32@icloud.com',
  'sudzikcoin@gmail.com',
  // Add more test emails below:
  // 'another-test@example.com',
];
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  // SAFETY GUARD: Prevent execution in production
  if (process.env.NODE_ENV === 'production') {
    console.error('\n❌ [cleanup-test-users] ERROR: This script cannot run in production!');
    console.error('   This is a DEVELOPMENT-ONLY script.');
    process.exit(1);
  }

  if (TEST_EMAILS.length === 0) {
    console.log('\n⚠️  [cleanup-test-users] No emails specified in TEST_EMAILS array.');
    console.log('   Edit scripts/cleanup-test-users.ts to add emails to clean up.\n');
    process.exit(0);
  }

  console.log('\n[cleanup-test-users] 🧹 Starting test user cleanup...');
  console.log(`[cleanup-test-users] 📋 Emails to clean up: ${TEST_EMAILS.length}`);
  TEST_EMAILS.forEach((email) => console.log(`   - ${email}`));
  console.log('');

  try {
    // First, find which users actually exist
    const existingUsers = await prisma.user.findMany({
      where: { email: { in: TEST_EMAILS } },
      select: { id: true, email: true, companyId: true, brokerId: true },
    });

    if (existingUsers.length === 0) {
      console.log('[cleanup-test-users] ℹ️  No matching users found in database.');
      console.log('   Nothing to clean up.\n');
      return;
    }

    console.log(`[cleanup-test-users] 🔍 Found ${existingUsers.length} user(s) to delete:`);
    existingUsers.forEach((u) => console.log(`   - ${u.email} (id: ${u.id})`));
    console.log('');

    const userIds = existingUsers.map((u) => u.id);
    const companyIds = existingUsers.map((u) => u.companyId).filter(Boolean) as string[];
    const brokerIds = existingUsers.map((u) => u.brokerId).filter(Boolean) as string[];

    // Use transaction to ensure atomic operations
    await prisma.$transaction(async (tx) => {
      console.log('[cleanup-test-users] 📋 Deleting related records...');

      // Delete email verification tokens for these users
      const deletedTokens = await tx.emailVerificationToken.deleteMany({
        where: { userId: { in: userIds } },
      });
      if (deletedTokens.count > 0) {
        console.log(`   ✓ Deleted ${deletedTokens.count} email verification tokens`);
      }

      // Delete accountant-client relationships
      const deletedAccountantClients = await tx.accountantClient.deleteMany({
        where: { accountantId: { in: userIds } },
      });
      if (deletedAccountantClients.count > 0) {
        console.log(`   ✓ Deleted ${deletedAccountantClients.count} accountant-client links`);
      }

      // Delete audit logs for these users
      const deletedAuditLogs = await tx.auditLog.deleteMany({
        where: { actorId: { in: userIds } },
      });
      if (deletedAuditLogs.count > 0) {
        console.log(`   ✓ Deleted ${deletedAuditLogs.count} audit logs`);
      }

      // Delete documents uploaded by these users
      const deletedDocuments = await tx.document.deleteMany({
        where: { uploadedById: { in: userIds } },
      });
      if (deletedDocuments.count > 0) {
        console.log(`   ✓ Deleted ${deletedDocuments.count} documents`);
      }

      // If users have companies, clean up company-related records
      if (companyIds.length > 0) {
        // Delete holds for these companies
        const deletedHolds = await tx.hold.deleteMany({
          where: { companyId: { in: companyIds } },
        });
        if (deletedHolds.count > 0) {
          console.log(`   ✓ Deleted ${deletedHolds.count} holds`);
        }

        // Delete purchase orders for these companies
        const deletedPurchaseOrders = await tx.purchaseOrder.deleteMany({
          where: { companyId: { in: companyIds } },
        });
        if (deletedPurchaseOrders.count > 0) {
          console.log(`   ✓ Deleted ${deletedPurchaseOrders.count} purchase orders`);
        }

        // Delete purchases for these users/companies
        const deletedPayments = await tx.payment.deleteMany({
          where: {
            purchase: { companyId: { in: companyIds } },
          },
        });
        if (deletedPayments.count > 0) {
          console.log(`   ✓ Deleted ${deletedPayments.count} payments`);
        }

        const deletedPurchases = await tx.purchase.deleteMany({
          where: { companyId: { in: companyIds } },
        });
        if (deletedPurchases.count > 0) {
          console.log(`   ✓ Deleted ${deletedPurchases.count} purchases`);
        }

        // Delete companies
        const deletedCompanies = await tx.company.deleteMany({
          where: { id: { in: companyIds } },
        });
        if (deletedCompanies.count > 0) {
          console.log(`   ✓ Deleted ${deletedCompanies.count} companies`);
        }
      }

      // If users are brokers, clean up broker-related records
      if (brokerIds.length > 0) {
        // Delete broker credit pools
        const deletedCreditPools = await tx.brokerCreditPool.deleteMany({
          where: { brokerId: { in: brokerIds } },
        });
        if (deletedCreditPools.count > 0) {
          console.log(`   ✓ Deleted ${deletedCreditPools.count} broker credit pools`);
        }

        // Delete brokers
        const deletedBrokers = await tx.broker.deleteMany({
          where: { id: { in: brokerIds } },
        });
        if (deletedBrokers.count > 0) {
          console.log(`   ✓ Deleted ${deletedBrokers.count} brokers`);
        }
      }

      // Finally, delete the users
      const deletedUsers = await tx.user.deleteMany({
        where: { email: { in: TEST_EMAILS } },
      });
      console.log(`   ✓ Deleted ${deletedUsers.count} users`);
    });

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ Cleanup complete!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('Cleaned up emails:');
    existingUsers.forEach((u) => console.log(`   ✓ ${u.email}`));
    
    const notFound = TEST_EMAILS.filter(
      (email) => !existingUsers.some((u) => u.email === email)
    );
    if (notFound.length > 0) {
      console.log('');
      console.log('Not found (already clean):');
      notFound.forEach((email) => console.log(`   - ${email}`));
    }
    console.log('');
    console.log('📝 You can now re-register with these email addresses.\n');

  } catch (error) {
    console.error('\n❌ [cleanup-test-users] ERROR:', error);
    throw error;
  }
}

// Execute the script
main()
  .catch((err) => {
    console.error('\n💥 [cleanup-test-users] Fatal error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('[cleanup-test-users] Database connection closed.');
  });
