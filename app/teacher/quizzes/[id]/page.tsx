import { notFound, redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Header } from "@/components/header"
import { QuizEditor } from "@/components/teacher/quiz-editor"

export default async function QuizEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSession()
  if (!user) redirect("/login")
  if (user.role !== "teacher" && user.role !== "admin") redirect("/")

  const quizResult = await sql`
    SELECT q.*, u.name as author_name
    FROM quizzes q
    JOIN users u ON q.author_id = u.id
    WHERE q.id = ${id}
  `

  if (quizResult.length === 0) notFound()

  const quiz = quizResult[0]

  // Check ownership
  if (quiz.author_id !== user.id && user.role !== "admin") {
    redirect("/teacher/dashboard")
  }

  const questions = await sql`
    SELECT * FROM questions WHERE quiz_id = ${id} ORDER BY sort_order ASC
  `

  const ratings = await sql`
    SELECT r.*, u.name as teacher_name
    FROM ratings r
    JOIN users u ON r.teacher_id = u.id
    WHERE r.quiz_id = ${id}
    ORDER BY r.created_at DESC
  `

  const comments = await sql`
    SELECT c.*, u.name as teacher_name
    FROM comments c
    JOIN users u ON c.teacher_id = u.id
    WHERE c.quiz_id = ${id}
    ORDER BY c.created_at DESC
  `

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <QuizEditor quiz={quiz} questions={questions} ratings={ratings} comments={comments} />
      </main>
    </div>
  )
}
