import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSession()
  if (!user) redirect("/login")

  const quizResult = await sql`
    SELECT q.*, u.name as author_name,
      (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count
    FROM quizzes q
    JOIN users u ON q.author_id = u.id
    WHERE q.id = ${id} AND q.is_published = true
  `

  if (quizResult.length === 0) notFound()
  const quiz = quizResult[0]

  if (quiz.price_cents === 0) {
    redirect(`/quizzes/${id}`)
  }

  // Check if already purchased
  const existingPurchase = await sql`
    SELECT id FROM purchases WHERE quiz_id = ${id} AND student_id = ${user.id}
  `

  if (existingPurchase.length > 0) {
    redirect(`/my-purchases/${id}/take`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href={`/quizzes/${id}`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quiz
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Complete your purchase to access this quiz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium">{quiz.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{quiz.description || "English Quiz"}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{quiz.level}</Badge>
                      <span className="text-sm text-muted-foreground">{quiz.question_count} questions</span>
                    </div>
                  </div>
                  <p className="font-semibold text-lg">${(quiz.price_cents / 100).toFixed(2)}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${(quiz.price_cents / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Secure checkout powered by Stripe. Your payment information is encrypted.</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <CheckoutForm quizId={id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
