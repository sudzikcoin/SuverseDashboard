import Link from "next/link"
import Card from "@/components/Card"
import Button from "@/components/Button"

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="text-yellow-600 text-6xl mb-4">⚠</div>
        <h1 className="text-3xl font-bold mb-4">Checkout Cancelled</h1>
        <p className="text-gray-600 mb-6">
          Your payment was not processed. You can return to the marketplace to
          try again.
        </p>
        <Link href="/marketplace">
          <Button className="w-full">Back to Marketplace</Button>
        </Link>
      </Card>
    </div>
  )
}
