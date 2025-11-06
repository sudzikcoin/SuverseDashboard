# Payment Fallback System

## Overview
The SuVerse Tax Credit Dashboard now supports both Stripe payments and a demo mode fallback when Stripe is not configured. This allows testing and development without requiring Stripe API keys.

## How It Works

### Stripe Detection
- **Helper Function**: `lib/isStripeEnabled.ts` checks for valid Stripe secret key
- **Client Exposure**: `NEXT_PUBLIC_STRIPE_ON` environment variable indicates Stripe status to frontend
- **Conditional Initialization**: Stripe SDK only initialized if keys are present

### Purchase Flow

#### With Stripe (Production Mode)
1. User clicks "Purchase Now" on marketplace
2. API creates PurchaseOrder with status `PENDING_PAYMENT`
3. Stripe Checkout session created
4. User redirected to Stripe payment page
5. After payment, webhook marks order as `PAID`
6. Admin approves order in dashboard

#### Without Stripe (Demo Mode)
1. User clicks "Purchase Now" on marketplace
2. Yellow banner appears: "💡 **Demo Mode:** Payments are simulated — no real charges will be made."
3. API creates PurchaseOrder with status `PAID_TEST`
4. Inventory automatically decrements in atomic transaction
5. Audit log entry created: `PURCHASE_TEST`
6. User sees success message and redirects to dashboard
7. Admin can approve order same as regular purchases

## Implementation Details

### Backend Changes

**File**: `app/api/checkout/route.ts`
```typescript
if (isStripeEnabled() && stripe) {
  // Stripe checkout flow
  // - Create purchase order
  // - Create Stripe session
  // - Return redirect URL
} else {
  // Demo mode flow
  // - Create purchase order (PAID_TEST)
  // - Decrement inventory
  // - Create audit log
  // - Return success response
}
```

**Transaction Safety**: Demo mode uses `prisma.$transaction()` to ensure:
- Purchase order creation
- Inventory decrement
- Audit log entry

All happen atomically or none at all.

### Frontend Changes

**File**: `app/marketplace/page.tsx`

**Demo Mode Indicator**:
```tsx
{process.env.NEXT_PUBLIC_STRIPE_ON !== 'true' && (
  <div className="mb-4 px-4 py-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
    <p className="text-sm text-yellow-200">
      💡 <strong>Demo Mode:</strong> Payments are simulated — no real charges will be made.
    </p>
  </div>
)}
```

**Response Handling**:
```typescript
const data = await res.json()

if (res.ok) {
  if (data.url) {
    // Stripe mode: redirect to payment
    window.location.href = data.url
  } else if (data.ok) {
    // Demo mode: show success and redirect
    alert(`✅ ${data.message}`)
    router.push(session?.user.role === "ADMIN" ? "/admin/purchases" : "/dashboard")
  }
}
```

### Error Handling

**Improved Error Messages**:
- Server logs detailed error information
- Client receives user-friendly error messages
- Errors include ✅/❌ emojis for clarity
- Console logging for debugging

**Example**:
```typescript
} catch (error: any) {
  const errorMsg = error.message || "An error occurred"
  console.error("Purchase error:", error)
  alert(`❌ Error: ${errorMsg}`)
}
```

## Testing the System

### Without Stripe (Demo Mode)

1. **Browse Marketplace**
   - Navigate to `/marketplace`
   - Click on any credit card
   - Modal opens with yellow demo mode banner

2. **Make Demo Purchase**
   - Enter purchase amount (or use minimum)
   - Click "Purchase Now"
   - See success message
   - Redirect to purchases page

3. **Verify Purchase**
   - Check `/admin/purchases` (as admin)
   - Find order with `PAID_TEST` status
   - Approve order normally
   - Check inventory - available amount reduced

4. **Check Audit Log**
   - Navigate to `/admin/audit`
   - Find `PURCHASE_TEST` action
   - Verify purchase order ID

### With Stripe (Production Mode)

1. Set `STRIPE_SECRET_KEY` environment variable
2. Restart server
3. Demo mode banner disappears
4. Purchase flow redirects to Stripe
5. Use test card: `4242 4242 4242 4242`
6. After payment, webhook handles status update

## Database Schema

**Purchase Order Status Values**:
- `PENDING_PAYMENT` - Awaiting Stripe payment
- `PAID` - Paid via Stripe, awaiting admin approval
- `PAID_TEST` - Demo mode purchase, awaiting admin approval

**Broker Status** (same for both modes):
- `PENDING` - Awaiting admin review
- `APPROVED` - Admin approved, certificates generated
- `REJECTED` - Admin rejected
- `NEEDS_INFO` - Admin requests more information

## Environment Variables

### Required for Production
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Auto-Generated
```env
NEXT_PUBLIC_STRIPE_ON=true  # Set automatically by next.config.js
```

### Optional (Demo Mode Only)
```env
# No Stripe variables needed
# System automatically enters demo mode
```

## Benefits

### Development
- ✅ Test purchase flow without Stripe account
- ✅ No payment processing delays
- ✅ Instant order creation for testing
- ✅ Full admin workflow testing

### Production
- ✅ Real payment processing with Stripe
- ✅ Secure webhook verification
- ✅ PCI compliance via Stripe
- ✅ Professional checkout experience

## Security Notes

- Demo mode clearly labeled to prevent confusion
- Production mode requires valid Stripe keys
- Webhook signatures verified in production
- Audit logs track all purchase types
- Admin approval required for both modes

## Future Enhancements

Potential improvements:
- Add toast notifications instead of alerts
- Email notifications for demo purchases
- Admin dashboard indicator for demo vs real purchases
- Bulk approval for demo purchases
- Auto-approval option for demo mode
