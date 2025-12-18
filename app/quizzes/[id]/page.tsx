import { notFound } from "next/navigation"
import Link from "next/link"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, BookOpen, User, Clock, ArrowLeft, Lock } from "lucide-react"
import { QuizFeedback } from "@/components/quizzes/quiz-feedback"

export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getSession()

  const quizResult = await sql`
    SELECT q.*, u.name as author_name,
      (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count,
      (SELECT COALESCE(AVG(value), 0) FROM ratings WHERE quiz_id = q.id) as avg_rating,
      (SELECT COUNT(*) FROM ratings WHERE quiz_id = q.id) as rating_count
    FROM quizzes q
    JOIN users u ON q.author_id = u.id
    WHERE q.id = ${id} AND q.is_published = true
  `

  if (quizResult.length === 0) notFound()
  const quiz = quizResult[0]

  // Check if user has purchased
  let hasPurchased = false
  if (user) {
    const purchaseCheck = await sql`
      SELECT id FROM purchases WHERE quiz_id = ${id} AND student_id = ${user.id}
    `
    hasPurchased = purchaseCheck.length > 0
  }

  // Get sample questions (first 2 if not purchased, all if purchased or free)
  const showAllQuestions = hasPurchased || quiz.price_cents === 0
  const questions = await sql`
    SELECT * FROM questions 
    WHERE quiz_id = ${id} 
    ORDER BY sort_order ASC
    ${showAllQuestions ? sql`` : sql`LIMIT 2`}
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

  // Get user's rating if they've rated
  let userRating: number | null = null
  if (user) {
    const userRatingResult = await sql`
      SELECT value FROM ratings WHERE quiz_id = ${id} AND teacher_id = ${user.id}
    `
    if (userRatingResult.length > 0) {
      userRating = userRatingResult[0].value
    }
  }

  const isAuthor = user?.id === quiz.author_id

  const totalQuestions = quiz.question_count

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/quizzes" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Quizzes
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{quiz.level}</Badge>
                {Number.parseFloat(quiz.avg_rating) > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{Number.parseFloat(quiz.avg_rating).toFixed(1)}</span>
                    <span className="text-muted-foreground">({quiz.rating_count} ratings)</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>
              <p className="text-muted-foreground">{quiz.description || "No description provided."}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {quiz.tags?.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>by {quiz.author_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{totalQuestions} questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>~{Math.ceil(totalQuestions * 1.5)} minutes</span>
              </div>
            </div>

            {/* Sample Questions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{showAllQuestions ? "Questions" : "Sample Questions"}</h2>
              {questions.map((q, index) => (
                <Card key={q.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {index + 1}. {q.prompt}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded bg-muted">A: {q.option_a}</div>
                      <div className="p-2 rounded bg-muted">B: {q.option_b}</div>
                      <div className="p-2 rounded bg-muted">C: {q.option_c}</div>
                      <div className="p-2 rounded bg-muted">D: {q.option_d}</div>
                    </div>
                    {showAllQuestions && (
                      <div className="mt-3 p-2 rounded bg-green-50 text-green-800 text-sm">
                        <span className="font-medium">Correct:</span> {q.correct_option}
                        {q.explanation && <span className="block mt-1 text-green-700">{q.explanation}</span>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {!showAllQuestions && totalQuestions > 2 && (
                <div className="text-center py-6 border border-dashed rounded-lg">
                  <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">{totalQuestions - 2} more questions available after purchase</p>
                </div>
              )}
            </div>

            <QuizFeedback
              quizId={id}
              user={user}
              ratings={ratings}
              comments={comments}
              userRating={userRating}
              isAuthor={isAuthor}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold mb-1">
                    {quiz.price_cents === 0 ? "Free" : `$${(quiz.price_cents / 100).toFixed(2)}`}
                  </p>
                  {quiz.price_cents > 0 && <p className="text-sm text-muted-foreground">One-time purchase</p>}
                </div>

                {hasPurchased ? (
                  <div className="space-y-3">
                    <Button className="w-full" asChild>
                      <Link href={`/my-purchases/${quiz.id}/take`}>Start Quiz</Link>
                    </Button>
                    <p className="text-center text-sm text-green-600">You own this quiz</p>
                  </div>
                ) : quiz.price_cents === 0 ? (
                  <Button className="w-full" asChild>
                    <Link href={user ? `/quizzes/${quiz.id}/take` : "/login"}>
                      {user ? "Start Quiz" : "Login to Start"}
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full" asChild>
                    <Link href={user ? `/quizzes/${quiz.id}/checkout` : "/login"}>
                      {user ? "Buy Now" : "Login to Purchase"}
                    </Link>
                  </Button>
                )}

                <div className="mt-6 pt-6 border-t space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Questions</span>
                    <span>{totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level</span>
                    <span>{quiz.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>~{Math.ceil(totalQuestions * 1.5)} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
