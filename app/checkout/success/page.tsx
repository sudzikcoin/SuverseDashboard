import Link from "next/link"
import Card from "@/components/Card"
import Button from "@/components/Button"

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. We are preparing your Broker Package and
          will notify you when it's ready for review.
        </p>
        <Link href="/purchases">
          <Button className="w-full">View My Purchases</Button>
        </Link>
      </Card>
    </div>
  )
}
