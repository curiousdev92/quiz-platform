"use server"

import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { requireAuth } from "@/lib/auth"

export async function createCheckoutSession(quizId: string) {
  const user = await requireAuth()

  // Get quiz details
  const quizResult = await sql`
    SELECT id, title, description, price_cents, author_id
    FROM quizzes
    WHERE id = ${quizId} AND is_published = true
  `

  if (quizResult.length === 0) {
    throw new Error("Quiz not found")
  }

  const quiz = quizResult[0]

  if (quiz.price_cents === 0) {
    throw new Error("This quiz is free")
  }

  // Check if already purchased
  const existingPurchase = await sql`
    SELECT id FROM purchases WHERE quiz_id = ${quizId} AND student_id = ${user.id}
  `

  if (existingPurchase.length > 0) {
    redirect(`/my-purchases/${quizId}/take`)
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: quiz.title,
            description: quiz.description || "English Quiz",
          },
          unit_amount: quiz.price_cents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      quiz_id: quizId,
      user_id: user.id,
    },
  })

  return session.client_secret
}

export async function handlePaymentSuccess(sessionId: string) {
  const user = await requireAuth()

  // Get session from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== "paid") {
    return { error: "Payment not completed" }
  }

  const quizId = session.metadata?.quiz_id
  const userId = session.metadata?.user_id

  if (!quizId || userId !== user.id) {
    return { error: "Invalid session" }
  }

  // Check if purchase already exists
  const existingPurchase = await sql`
    SELECT id FROM purchases WHERE quiz_id = ${quizId} AND student_id = ${user.id}
  `

  if (existingPurchase.length > 0) {
    return { success: true, quizId }
  }

  // Get quiz price for record
  const quiz = await sql`SELECT price_cents FROM quizzes WHERE id = ${quizId}`

  // Create purchase record
  await sql`
    INSERT INTO purchases (quiz_id, student_id, stripe_session_id, stripe_payment_intent_id, amount_cents)
    VALUES (${quizId}, ${user.id}, ${session.id}, ${session.payment_intent as string}, ${quiz[0]?.price_cents || 0})
  `

  return { success: true, quizId }
}
