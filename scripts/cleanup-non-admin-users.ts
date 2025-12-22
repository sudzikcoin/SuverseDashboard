/**
 * Non-Admin User Cleanup Script
 * 
 * ⚠️  WARNING: This script is for DEVELOPMENT/TEST ONLY!
 * 
 * This script deletes ALL non-admin users and their related data,
 * while preserving admin accounts.
 * 
 * What gets deleted:
 * - All users with role != 'ADMIN'
 * - Companies owned by non-admin users
 * - Brokers linked to non-admin users
 * - All related records (purchases, orders, holds, documents, tokens, etc.)
 * 
 * What is preserved:
 * - All users with role === 'ADMIN'
 * - Global/system data not tied to specific users
 * 
 * Usage:
 *   npm run cleanup:non-admin-users
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // SAFETY GUARD: Prevent execution in production
  if (process.env.NODE_ENV === 'production') {
    console.error('\n❌ [cleanup] ERROR: This script cannot run in production!');
    console.error('   This is a DEVELOPMENT-ONLY script.');
    process.exit(1);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🧹 Non-Admin User Cleanup Script');
  console.log('═══════════════════════════════════════════════════════\n');

  // Step 1: Identify admin users (will be preserved)
  const adminUsers = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, role: true, name: true },
  });

  console.log('[cleanup] 🛡️  Admin users (WILL BE PRESERVED):');
  if (adminUsers.length === 0) {
    console.log('   (No admin users found)');
  } else {
    adminUsers.forEach((u) => {
      console.log(`   ✓ ${u.email} (${u.role}) - ID: ${u.id}`);
    });
  }
  console.log('');

  // Step 2: Identify non-admin users (will be deleted)
  const nonAdminUsers = await prisma.user.findMany({
    where: { role: { not: 'ADMIN' } },
    select: { id: true, email: true, role: true, companyId: true, brokerId: true },
  });

  if (nonAdminUsers.length === 0) {
    console.log('[cleanup] ℹ️  No non-admin users found. Nothing to clean up.\n');
    return;
  }

  console.log(`[cleanup] 🗑️  Non-admin users (WILL BE DELETED): ${nonAdminUsers.length}`);
  nonAdminUsers.forEach((u) => {
    console.log(`   - ${u.email} (${u.role})`);
  });
  console.log('');

  // Collect IDs for batch deletion
  const userIds = nonAdminUsers.map((u) => u.id);
  const companyIds = nonAdminUsers.map((u) => u.companyId).filter(Boolean) as string[];
  const brokerIds = nonAdminUsers.map((u) => u.brokerId).filter(Boolean) as string[];

  console.log('[cleanup] 📊 Related entities to clean:');
  console.log(`   - User IDs: ${userIds.length}`);
  console.log(`   - Company IDs: ${companyIds.length}`);
  console.log(`   - Broker IDs: ${brokerIds.length}`);
  console.log('');

  // Step 3: Delete in correct order (respecting foreign keys)
  console.log('[cleanup] 📋 Deleting related records...');

  const stats: Record<string, number> = {};

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete email verification tokens (has FK to User)
      const deletedTokens = await tx.emailVerificationToken.deleteMany({
        where: { userId: { in: userIds } },
      });
      stats['EmailVerificationToken'] = deletedTokens.count;
      if (deletedTokens.count > 0) {
        console.log(`   ✓ Deleted ${deletedTokens.count} email verification tokens`);
      }

      // 2. Delete accountant-client relationships (accountantId -> User)
      const deletedAccountantClients = await tx.accountantClient.deleteMany({
        where: {
          OR: [
            { accountantId: { in: userIds } },
            { companyId: { in: companyIds } },
          ],
        },
      });
      stats['AccountantClient'] = deletedAccountantClients.count;
      if (deletedAccountantClients.count > 0) {
        console.log(`   ✓ Deleted ${deletedAccountantClients.count} accountant-client links`);
      }

      // 3. Delete audit logs (actorId -> User, companyId -> Company)
      const deletedAuditLogs = await tx.auditLog.deleteMany({
        where: {
          OR: [
            { actorId: { in: userIds } },
            { companyId: { in: companyIds } },
          ],
        },
      });
      stats['AuditLog'] = deletedAuditLogs.count;
      if (deletedAuditLogs.count > 0) {
        console.log(`   ✓ Deleted ${deletedAuditLogs.count} audit logs`);
      }

      // 4. Delete documents (companyId -> Company, uploadedById -> User)
      const deletedDocuments = await tx.document.deleteMany({
        where: {
          OR: [
            { companyId: { in: companyIds } },
            { uploadedById: { in: userIds } },
          ],
        },
      });
      stats['Document'] = deletedDocuments.count;
      if (deletedDocuments.count > 0) {
        console.log(`   ✓ Deleted ${deletedDocuments.count} documents`);
      }

      // 5. Delete payment logs (userId, companyId)
      const deletedPaymentLogs = await tx.paymentLog.deleteMany({
        where: {
          OR: [
            { userId: { in: userIds } },
            { companyId: { in: companyIds } },
          ],
        },
      });
      stats['PaymentLog'] = deletedPaymentLogs.count;
      if (deletedPaymentLogs.count > 0) {
        console.log(`   ✓ Deleted ${deletedPaymentLogs.count} payment logs`);
      }

      // 6. Delete payments (via Purchase -> companyId)
      // First get purchase IDs for these companies
      const purchaseIdsForPayments = await tx.purchase.findMany({
        where: { companyId: { in: companyIds } },
        select: { id: true },
      });
      const purchaseIds = purchaseIdsForPayments.map((p) => p.id);
      
      if (purchaseIds.length > 0) {
        const deletedPayments = await tx.payment.deleteMany({
          where: { purchaseId: { in: purchaseIds } },
        });
        stats['Payment'] = deletedPayments.count;
        if (deletedPayments.count > 0) {
          console.log(`   ✓ Deleted ${deletedPayments.count} payments`);
        }
      }

      // 7. Delete purchases (companyId -> Company, accountantId -> User)
      const deletedPurchases = await tx.purchase.deleteMany({
        where: {
          OR: [
            { companyId: { in: companyIds } },
            { accountantId: { in: userIds } },
          ],
        },
      });
      stats['Purchase'] = deletedPurchases.count;
      if (deletedPurchases.count > 0) {
        console.log(`   ✓ Deleted ${deletedPurchases.count} purchases`);
      }

      // 8. Delete holds (companyId -> Company)
      const deletedHolds = await tx.hold.deleteMany({
        where: { companyId: { in: companyIds } },
      });
      stats['Hold'] = deletedHolds.count;
      if (deletedHolds.count > 0) {
        console.log(`   ✓ Deleted ${deletedHolds.count} holds`);
      }

      // 9. Delete purchase orders (companyId -> Company)
      const deletedPurchaseOrders = await tx.purchaseOrder.deleteMany({
        where: { companyId: { in: companyIds } },
      });
      stats['PurchaseOrder'] = deletedPurchaseOrders.count;
      if (deletedPurchaseOrders.count > 0) {
        console.log(`   ✓ Deleted ${deletedPurchaseOrders.count} purchase orders`);
      }

      // 10. Clear user references to companies/brokers before deleting them
      await tx.user.updateMany({
        where: { id: { in: userIds } },
        data: { companyId: null, brokerId: null },
      });

      // 11. Delete companies (owned by non-admin users)
      if (companyIds.length > 0) {
        const deletedCompanies = await tx.company.deleteMany({
          where: { id: { in: companyIds } },
        });
        stats['Company'] = deletedCompanies.count;
        if (deletedCompanies.count > 0) {
          console.log(`   ✓ Deleted ${deletedCompanies.count} companies`);
        }
      }

      // 12. Delete broker credit pools (brokerId -> Broker)
      if (brokerIds.length > 0) {
        const deletedCreditPools = await tx.brokerCreditPool.deleteMany({
          where: { brokerId: { in: brokerIds } },
        });
        stats['BrokerCreditPool'] = deletedCreditPools.count;
        if (deletedCreditPools.count > 0) {
          console.log(`   ✓ Deleted ${deletedCreditPools.count} broker credit pools`);
        }

        // 13. Delete brokers
        const deletedBrokers = await tx.broker.deleteMany({
          where: { id: { in: brokerIds } },
        });
        stats['Broker'] = deletedBrokers.count;
        if (deletedBrokers.count > 0) {
          console.log(`   ✓ Deleted ${deletedBrokers.count} brokers`);
        }
      }

      // 14. Finally, delete the non-admin users
      const deletedUsers = await tx.user.deleteMany({
        where: { id: { in: userIds } },
      });
      stats['User'] = deletedUsers.count;
      console.log(`   ✓ Deleted ${deletedUsers.count} users`);
    });

    // Summary
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Cleanup Complete!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 Summary of deleted records:');
    Object.entries(stats).forEach(([model, count]) => {
      if (count > 0) {
        console.log(`   ${model}: ${count}`);
      }
    });
    console.log('');
    console.log('🛡️  Preserved admin users:');
    if (adminUsers.length === 0) {
      console.log('   (No admin users in database)');
    } else {
      adminUsers.forEach((u) => {
        console.log(`   ✓ ${u.email}`);
      });
    }
    console.log('');
    console.log('📝 You can now reuse the deleted email addresses for new registrations.');
    console.log('');

  } catch (error) {
    console.error('\n❌ [cleanup] ERROR during cleanup:', error);
    throw error;
  }
}

// Execute the script
main()
  .catch((err) => {
    console.error('\n💥 [cleanup] Fatal error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('[cleanup] Database connection closed.\n');
  });
