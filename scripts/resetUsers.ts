/**
 * Development User Reset Script
 * 
 * ⚠️  WARNING: This script is for DEVELOPMENT ONLY!
 * 
 * This script will:
 * 1. Delete ALL users and all related records from the database
 * 2. Seed a fresh admin user account for testing
 * 
 * Safety Guards:
 *   - Will NOT run if NODE_ENV === 'production'
 *   - Requires CONFIRM_RESET_USERS=yes environment variable
 *   - Uses transaction to ensure atomic operations (all or nothing)
 * 
 * Usage:
 *   CONFIRM_RESET_USERS=yes npm run reset:users
 * 
 * After running, log in with:
 *   Email: admin@suverse.io (or ADMIN_SEED_EMAIL env var)
 *   Password: SuVerseAdmin123! (or ADMIN_SEED_PASSWORD env var)
 * 
 * Sessions:
 *   - EmailVerificationToken records are cleared from DB
 *   - If using stateless cookies (sv.session), clear cookies in browser
 *   - No server-side session table to clear
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Admin account configuration (can be overridden with env vars)
const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL ?? 'admin@suverse.io';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD ?? 'SuVerseAdmin123!';
const ADMIN_NAME = process.env.ADMIN_SEED_NAME ?? 'SuVerse Admin';

async function main() {
  // SAFETY GUARD 1: Prevent execution in production
  if (process.env.NODE_ENV === 'production') {
    console.error('\n❌ [resetUsers] ERROR: This script cannot run in production!');
    console.error('   This is a DEVELOPMENT-ONLY script that deletes all users.');
    console.error('   NODE_ENV is set to "production".\n');
    process.exit(1);
  }
  
  // SAFETY GUARD 2: Require explicit confirmation flag
  if (process.env.CONFIRM_RESET_USERS !== 'yes') {
    console.error('\n⚠️  [resetUsers] SAFETY CHECK FAILED');
    console.error('   This script will DELETE ALL USERS and related data.');
    console.error('   To confirm, run:');
    console.error('');
    console.error('   CONFIRM_RESET_USERS=yes npm run reset:users');
    console.error('');
    process.exit(1);
  }
  
  console.log('[resetUsers] 🚀 Starting database reset...\n');
  
  try {
    // Use transaction to ensure atomic operations (all or nothing)
    await prisma.$transaction(async (tx) => {
      // Step 1: Delete all records that reference User (in correct FK order)
      console.log('[resetUsers] 📋 Deleting related records...');
      
      // Delete email verification tokens (has FK to User)
      const deletedTokens = await tx.emailVerificationToken.deleteMany();
      console.log(`  ✓ Deleted ${deletedTokens.count} email verification tokens`);
      
      // Delete accountant-client relationships (has FK to User via accountantId)
      const deletedAccountantClients = await tx.accountantClient.deleteMany();
      console.log(`  ✓ Deleted ${deletedAccountantClients.count} accountant-client links`);
      
      // Delete purchases (has FK to User via accountantId)
      // First delete payments that reference purchases
      const deletedPayments = await tx.payment.deleteMany();
      console.log(`  ✓ Deleted ${deletedPayments.count} payments`);
      
      const deletedPurchases = await tx.purchase.deleteMany();
      console.log(`  ✓ Deleted ${deletedPurchases.count} purchases`);
      
      // Delete payment logs (may have userId)
      const deletedPaymentLogs = await tx.paymentLog.deleteMany();
      console.log(`  ✓ Deleted ${deletedPaymentLogs.count} payment logs`);
      
      // Delete audit logs (has FK to User via actorId and Company)
      const deletedAuditLogs = await tx.auditLog.deleteMany();
      console.log(`  ✓ Deleted ${deletedAuditLogs.count} audit logs`);
      
      // Delete documents (has FK to User via uploadedById and Company)
      const deletedDocuments = await tx.document.deleteMany();
      console.log(`  ✓ Deleted ${deletedDocuments.count} documents`);
      
      // Delete holds (has FK to Company)
      const deletedHolds = await tx.hold.deleteMany();
      console.log(`  ✓ Deleted ${deletedHolds.count} holds`);
      
      // Delete purchase orders (has FK to Company)
      const deletedPurchaseOrders = await tx.purchaseOrder.deleteMany();
      console.log(`  ✓ Deleted ${deletedPurchaseOrders.count} purchase orders`);
      
      // Step 2: Delete Companies (User has optional FK to Company)
      const deletedCompanies = await tx.company.deleteMany();
      console.log(`  ✓ Deleted ${deletedCompanies.count} companies`);
      
      // Step 3: Delete broker credit pools (has FK to Broker)
      const deletedCreditPools = await tx.brokerCreditPool.deleteMany();
      console.log(`  ✓ Deleted ${deletedCreditPools.count} broker credit pools`);
      
      // Step 4: Delete Brokers (User has optional FK to Broker)
      const deletedBrokers = await tx.broker.deleteMany();
      console.log(`  ✓ Deleted ${deletedBrokers.count} brokers`);
      
      // Step 5: Finally, delete all users
      const deletedUsers = await tx.user.deleteMany();
      console.log(`  ✓ Deleted ${deletedUsers.count} users\n`);
    });
    
    console.log('[resetUsers] ✅ All existing data cleared successfully!\n');
    
    // Step 6: Create new admin user
    console.log('[resetUsers] 👤 Creating fresh admin user...');
    
    // Hash password using same method as registration
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    // Create admin user with all required fields
    const adminUser = await prisma.user.create({
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        hashedPassword,
        role: 'COMPANY', // Using COMPANY role for normal dashboard access
        status: 'ACTIVE', // Set to ACTIVE so login works immediately
        emailVerifiedAt: new Date(), // Mark email as verified
      },
    });
    
    console.log(`  ✓ Admin user created: ${adminUser.email}`);
    console.log(`  ✓ User ID: ${adminUser.id}`);
    console.log(`  ✓ Role: ${adminUser.role}`);
    console.log(`  ✓ Status: ${adminUser.status}\n`);
    
    // Step 7: Create a company for the admin user (optional but recommended for COMPANY role)
    console.log('[resetUsers] 🏢 Creating admin company...');
    
    const adminCompany = await prisma.company.create({
      data: {
        legalName: 'SuVerse Admin Company',
        contactEmail: ADMIN_EMAIL,
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED', // Pre-verify for easier testing
        ownerId: adminUser.id,
      },
    });
    
    // Link company to user
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { companyId: adminCompany.id },
    });
    
    console.log(`  ✓ Company created: ${adminCompany.legalName}`);
    console.log(`  ✓ Company ID: ${adminCompany.id}`);
    console.log(`  ✓ Verification Status: ${adminCompany.verificationStatus}\n`);
    
    // Success summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Database reset complete!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('🔑 Login credentials:');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Clear browser cookies (sv.session)');
    console.log('   2. Navigate to /login');
    console.log('   3. Sign in with the credentials above');
    console.log('   4. You should land on the company dashboard');
    console.log('');
    console.log('═══════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ [resetUsers] ERROR:', error);
    throw error;
  }
}

// Execute the script
main()
  .catch((err) => {
    console.error('\n💥 [resetUsers] Fatal error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('[resetUsers] Database connection closed.');
  });
