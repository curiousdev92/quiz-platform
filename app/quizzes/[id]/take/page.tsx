import { notFound, redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Header } from "@/components/header"
import { QuizTaker } from "@/components/quizzes/quiz-taker"

export default async function TakeFreeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSession()
  if (!user) redirect("/login")

  // Only allow free quizzes to be taken directly
  const quizResult = await sql`
    SELECT q.*, u.name as author_name
    FROM quizzes q
    JOIN users u ON q.author_id = u.id
    WHERE q.id = ${id} AND q.is_published = true AND q.price_cents = 0
  `

  if (quizResult.length === 0) notFound()
  const quiz = quizResult[0]

  const questions = await sql`
    SELECT id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation
    FROM questions 
    WHERE quiz_id = ${id}
    ORDER BY sort_order ASC
  `

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <QuizTaker quiz={quiz} questions={questions} isFreeQuiz />
      </main>
    </div>
  )
}
