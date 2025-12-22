/**
 * Test Email Verification Script
 * 
 * Tests the registration flow to verify that email verification emails
 * are sent correctly via Resend for all user types.
 * 
 * Usage: npx tsx scripts/test-email-verification.ts
 * 
 * NOTE: This script is for development testing only.
 * It will NOT run in production.
 */

if (process.env.NODE_ENV === 'production') {
  console.error('[TEST] This script cannot run in production');
  process.exit(1);
}

const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5000';
const TEST_PASSWORD = 'TestPassword123!';

interface TestCase {
  email: string;
  name: string;
  role: 'COMPANY' | 'BROKER' | 'ACCOUNTANT';
  extraFields?: Record<string, unknown>;
}

const testCases: TestCase[] = [
  {
    email: `test-company-${Date.now()}@suverse-test.dev`,
    name: 'Test Company User',
    role: 'COMPANY',
    extraFields: {
      companyLegalName: 'Test Company LLC',
      state: 'CA',
      ein: '12-3456789',
      taxLiability: 100000,
      targetCloseYear: 2025,
    },
  },
  {
    email: `test-broker-${Date.now()}@suverse-test.dev`,
    name: 'Test Broker User',
    role: 'BROKER',
    extraFields: {
      brokerCompanyName: 'Test Broker Corp',
      brokerContactName: 'Test Broker Contact',
      state: 'NY',
      phone: '555-123-4567',
    },
  },
  {
    email: `test-accountant-${Date.now()}@suverse-test.dev`,
    name: 'Test Accountant User',
    role: 'ACCOUNTANT',
  },
];

async function testRegistration(testCase: TestCase): Promise<boolean> {
  console.log(`\n[TEST] Testing registration for ${testCase.role}: ${testCase.email}`);
  
  const payload = {
    email: testCase.email,
    password: TEST_PASSWORD,
    name: testCase.name,
    role: testCase.role,
    ...testCase.extraFields,
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`[TEST] ✓ Registration successful for ${testCase.email}`);
      console.log(`[TEST]   User ID: ${data.user?.id}`);
      console.log(`[TEST]   Role: ${data.user?.role}`);
      console.log(`[TEST]   Requires Email Verification: ${data.requiresEmailVerification}`);
      return true;
    } else {
      console.error(`[TEST] ✗ Registration failed for ${testCase.email}`);
      console.error(`[TEST]   Status: ${response.status}`);
      console.error(`[TEST]   Error: ${data.error || JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    console.error(`[TEST] ✗ Exception during registration for ${testCase.email}:`, error);
    return false;
  }
}

async function main() {
  console.log('[TEST] Starting Email Verification Test Suite');
  console.log(`[TEST] Base URL: ${BASE_URL}`);
  console.log(`[TEST] Test cases: ${testCases.length}`);
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    const success = await testRegistration(testCase);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n[TEST] ==============================');
  console.log(`[TEST] Results: ${passed} passed, ${failed} failed`);
  console.log('[TEST] ==============================');
  
  console.log('\n[TEST] Check the console logs above for [EMAIL] markers.');
  console.log('[TEST] You should see:');
  console.log('[TEST]   - "[EMAIL] Sending verification email to ..." for each user');
  console.log('[TEST]   - "[EMAIL] Verification email sent successfully to ..." on success');
  console.log('[TEST]   - OR "[EMAIL] Resend API error ..." if there was an issue');
  
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
