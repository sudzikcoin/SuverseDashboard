/**
 * Resend Email Test Script
 * 
 * ⚠️  DEVELOPMENT ONLY - Tests that Resend is properly configured
 * 
 * This script sends a simple test email using Resend with
 * the same configuration that the application uses.
 * 
 * Usage:
 *   npm run test:resend-email                    # Uses default test email
 *   npm run test:resend-email -- user@example.com  # Sends to specified email
 * 
 * After running:
 *   1. Check the console output for success/error messages
 *   2. Check your Resend dashboard to see the email in the logs
 *   3. Check the inbox for the test email
 */

import { Resend } from 'resend';

// Default test email - override with CLI arg
const DEFAULT_TEST_EMAIL = 'sudzikgroup@gmail.com';

async function main() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📧 Resend Email Test Script');
  console.log('═══════════════════════════════════════════════════════\n');

  // Get recipient from CLI args or use default
  const recipientArg = process.argv[2];
  const recipient = recipientArg || DEFAULT_TEST_EMAIL;

  // Check environment variables
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM;

  console.log('[TEST] Environment check:');
  
  if (apiKey) {
    console.log(`  ✓ RESEND_API_KEY: Present (length=${apiKey.length}, starts with "${apiKey.substring(0, 4)}...")`);
  } else {
    console.error('  ✗ RESEND_API_KEY: MISSING - Cannot send emails!');
    process.exit(1);
  }
  
  if (fromAddress) {
    console.log(`  ✓ RESEND_FROM: ${fromAddress}`);
    if (fromAddress.includes('resend.dev')) {
      console.warn('  ⚠️  WARNING: Using sandbox address - can only send to account owner email');
    }
  } else {
    console.error('  ✗ RESEND_FROM: MISSING - Cannot send emails!');
    console.error('     Set RESEND_FROM to an email from your verified domain (e.g., no-reply@suverse.io)');
    process.exit(1);
  }
  
  console.log('');

  // Initialize Resend client
  const resend = new Resend(apiKey);

  // Send test email
  console.log(`[TEST] Sending test email:`);
  console.log(`       To:   ${recipient}`);
  console.log(`       From: ${fromAddress}`);
  console.log('');

  try {
    const result = await resend.emails.send({
      from: fromAddress,
      to: recipient,
      subject: 'Resend Test from SuVerse Dashboard',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #34D399;">SuVerse Email Test</h1>
          <p>This is a test email from the SuVerse Dashboard to verify Resend is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>From:</strong> ${fromAddress}</p>
          <p><strong>To:</strong> ${recipient}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            If you received this email, Resend is properly configured!
          </p>
        </div>
      `,
      text: `SuVerse Email Test\n\nThis is a test email from the SuVerse Dashboard to verify Resend is working correctly.\n\nTimestamp: ${new Date().toISOString()}\nFrom: ${fromAddress}\nTo: ${recipient}\n\nIf you received this email, Resend is properly configured!`,
    });

    console.log('[TEST] Resend API Response:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    if ('error' in result && result.error) {
      const error = result.error as any;
      console.error('═══════════════════════════════════════════════════════');
      console.error('❌ EMAIL SEND FAILED');
      console.error('═══════════════════════════════════════════════════════');
      console.error('');
      console.error(`Status: ${error.statusCode || 'unknown'}`);
      console.error(`Name:   ${error.name || 'unknown'}`);
      console.error(`Message: ${error.message || JSON.stringify(error)}`);
      console.error('');
      
      if (error.message?.includes('only send testing emails')) {
        console.error('💡 FIX: Your RESEND_FROM is using the sandbox domain.');
        console.error('   Update RESEND_FROM to use your verified domain:');
        console.error('   e.g., no-reply@suverse.io');
      }
      
      process.exit(1);
    }

    const emailId = (result as any).data?.id || (result as any).id;
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ EMAIL SENT SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log(`  Message ID: ${emailId}`);
    console.log(`  Recipient:  ${recipient}`);
    console.log(`  From:       ${fromAddress}`);
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Check your Resend dashboard for this email');
    console.log('   2. Check the inbox for the test email');
    console.log('   3. If both work, email verification should also work');
    console.log('');

  } catch (error: any) {
    console.error('═══════════════════════════════════════════════════════');
    console.error('❌ EMAIL SEND FAILED (Exception)');
    console.error('═══════════════════════════════════════════════════════');
    console.error('');
    console.error('Error:', error.message || error);
    console.error('');
    console.error('Common issues:');
    console.error('  - Invalid API key');
    console.error('  - "from" address not from a verified domain');
    console.error('  - Network connectivity issues');
    console.error('');
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
