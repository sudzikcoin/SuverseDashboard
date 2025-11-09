import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string
  subject: string
  html: string
  attachments?: Array<{ filename: string; content: Buffer }>
}) {
  if (!resend) {
    console.log('[EMAIL STUB] Would send email:', { to, subject })
    console.log('[EMAIL STUB] HTML:', html)
    return { success: false, message: 'Resend API key not configured' }
  }

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@suverse.io',
      to,
      subject,
      html,
      attachments: attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
      })),
    })
    return { success: true }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, message: String(error) }
  }
}

export async function sendHoldConfirmation(
  email: string,
  holdDetails: {
    creditType: string
    amountUSD: number
    expiresAt: Date
  }
) {
  const html = `
    <h2>Hold Confirmation - SuVerse Tax Credits</h2>
    <p>Your hold has been successfully created:</p>
    <ul>
      <li><strong>Credit Type:</strong> ${holdDetails.creditType}</li>
      <li><strong>Amount:</strong> $${holdDetails.amountUSD.toLocaleString()}</li>
      <li><strong>Expires:</strong> ${holdDetails.expiresAt.toLocaleString()}</li>
    </ul>
    <p>Please complete your purchase before the hold expires.</p>
  `
  
  return sendEmail({
    to: email,
    subject: 'Hold Confirmation - SuVerse',
    html,
  })
}

export async function sendPaymentConfirmation(email: string, poNumber: string) {
  const html = `
    <h2>Payment Received - SuVerse Tax Credits</h2>
    <p>Thank you for your purchase!</p>
    <p><strong>Order Number:</strong> ${poNumber}</p>
    <p>We are preparing your Broker Package and will notify you when it's ready for review.</p>
  `
  
  return sendEmail({
    to: email,
    subject: 'Payment Received - SuVerse',
    html,
  })
}

export async function sendClosingCertificate(
  email: string,
  poNumber: string,
  pdfBuffer?: Buffer
) {
  const html = `
    <h2>Closing Certificate Ready - SuVerse Tax Credits</h2>
    <p>Congratulations! Your purchase has been approved.</p>
    <p><strong>Order Number:</strong> ${poNumber}</p>
    <p>Your Closing Certificate is attached to this email.</p>
  `
  
  const attachments = pdfBuffer
    ? [{ filename: `closing-certificate-${poNumber}.pdf`, content: pdfBuffer }]
    : undefined
  
  return sendEmail({
    to: email,
    subject: 'Closing Certificate - SuVerse',
    html,
    attachments,
  })
}

export async function sendWelcomeEmail(
  email: string,
  role: "COMPANY" | "ACCOUNTANT",
  name?: string
) {
  const dashboardType = role === "COMPANY" ? "Company" : "Accountant"
  const greeting = name ? `Hi ${name}` : "Welcome"
  const baseUrl = process.env.NEXTAUTH_URL || "https://suverse.io"
  
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0B1220; color: #EAF2FB;">
      <div style="background: linear-gradient(135deg, #34D399 0%, #38BDF8 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #0B1220;">SuVerse</h1>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #0F172A; opacity: 0.9;">Tax Credit Marketplace</p>
      </div>
      
      <div style="background-color: #0F172A; padding: 30px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);">
        <h2 style="margin: 0 0 20px 0; color: #34D399; font-size: 24px;">${greeting}!</h2>
        
        <p style="margin: 0 0 15px 0; line-height: 1.6; color: #AFC3D6;">
          Your ${dashboardType} account has been successfully created on the SuVerse Tax Credit Dashboard.
        </p>
        
        <div style="background-color: rgba(52, 211, 153, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #34D399;">
          <p style="margin: 0 0 10px 0; font-weight: 600; color: #EAF2FB;">Account Details</p>
          <p style="margin: 0; color: #AFC3D6;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 10px 0 0 0; color: #AFC3D6;"><strong>Role:</strong> ${dashboardType}</p>
        </div>
        
        <p style="margin: 20px 0 15px 0; line-height: 1.6; color: #AFC3D6;">
          You can now sign in to your dashboard and start ${role === "COMPANY" ? "purchasing tax credits" : "managing client companies"}.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/login" style="display: inline-block; background-color: #34D399; color: #0B1220; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Sign In to Dashboard
          </a>
        </div>
        
        <p style="margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 14px; color: #AFC3D6; line-height: 1.6;">
          If you have any questions or need assistance, please don't hesitate to reach out to our support team.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding: 20px; color: #AFC3D6; font-size: 12px;">
        <p style="margin: 0;">© ${new Date().getFullYear()} SuVerse. All rights reserved.</p>
      </div>
    </div>
  `
  
  return sendEmail({
    to: email,
    subject: `Welcome to SuVerse ${dashboardType} Dashboard`,
    html,
  })
}
