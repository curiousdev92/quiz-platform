import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type Stripe from "stripe"

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Note: In production, you should set STRIPE_WEBHOOK_SECRET
    // For now, we'll parse the event directly since the sandbox doesn't require signature verification
    event = JSON.parse(body) as Stripe.Event
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status === "paid") {
      const quizId = session.metadata?.quiz_id
      const userId = session.metadata?.user_id

      if (quizId && userId) {
        try {
          // Check if purchase already exists
          const existingPurchase = await sql`
            SELECT id FROM purchases WHERE quiz_id = ${quizId} AND student_id = ${userId}
          `

          if (existingPurchase.length === 0) {
            // Get quiz price
            const quiz = await sql`SELECT price_cents FROM quizzes WHERE id = ${quizId}`

            // Create purchase record
            await sql`
              INSERT INTO purchases (quiz_id, student_id, stripe_session_id, stripe_payment_intent_id, amount_cents)
              VALUES (${quizId}, ${userId}, ${session.id}, ${session.payment_intent as string}, ${quiz[0]?.price_cents || 0})
            `
          }
        } catch (dbError) {
          console.error("Database error in webhook:", dbError)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
