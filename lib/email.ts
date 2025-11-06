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
