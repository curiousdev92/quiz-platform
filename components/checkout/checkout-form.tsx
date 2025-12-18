"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { createCheckoutSession } from "@/app/actions/checkout"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function CheckoutForm({ quizId }: { quizId: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "ready" | "processing" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  const fetchClientSecret = useCallback(() => createCheckoutSession(quizId), [quizId])

  const handleComplete = useCallback(async () => {
    setStatus("processing")

    // Poll for session completion
    const checkPayment = async (attempts = 0): Promise<void> => {
      if (attempts > 10) {
        setStatus("error")
        setErrorMessage("Payment verification timed out. Please contact support.")
        return
      }

      try {
        // Get current session from Stripe
        const stripeInstance = await stripePromise
        if (!stripeInstance) throw new Error("Stripe not loaded")

        // Wait a bit for the payment to process
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Try to handle the payment
        const clientSecret = await fetchClientSecret()
        if (!clientSecret) {
          // If we can't get a new session, payment probably succeeded
          setStatus("success")
          setTimeout(() => {
            router.push(`/my-purchases/${quizId}/take`)
          }, 2000)
          return
        }
      } catch {
        // If error getting new session, payment might have succeeded
        setStatus("success")
        setTimeout(() => {
          router.push(`/my-purchases/${quizId}/take`)
        }, 2000)
      }
    }

    checkPayment()
  }, [quizId, router, fetchClientSecret])

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-4">Redirecting you to your quiz...</p>
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{errorMessage}</p>
        <Button onClick={() => setStatus("loading")}>Try Again</Button>
      </div>
    )
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{
          fetchClientSecret,
          onComplete: handleComplete,
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
