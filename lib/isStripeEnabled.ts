export function isStripeEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')
}
