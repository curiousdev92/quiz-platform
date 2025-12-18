import Link from "next/link"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, BookOpen, Star, Eye, EyeOff } from "lucide-react"

export default async function TeacherDashboard() {
  const user = await getSession()
  if (!user) redirect("/login")
  if (user.role !== "teacher" && user.role !== "admin") redirect("/")

  const quizzes = await sql`
    SELECT q.*, 
      (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count,
      (SELECT COALESCE(AVG(value), 0) FROM ratings WHERE quiz_id = q.id) as avg_rating,
      (SELECT COUNT(*) FROM ratings WHERE quiz_id = q.id) as rating_count
    FROM quizzes q
    WHERE q.author_id = ${user.id}
    ORDER BY q.created_at DESC
  `

  const stats = await sql`
    SELECT 
      COUNT(*) as total_quizzes,
      COUNT(*) FILTER (WHERE is_published = true) as published_quizzes,
      (SELECT COUNT(*) FROM questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE author_id = ${user.id})) as total_questions,
      (SELECT COUNT(*) FROM purchases WHERE quiz_id IN (SELECT id FROM quizzes WHERE author_id = ${user.id})) as total_purchases
    FROM quizzes WHERE author_id = ${user.id}
  `

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
          </div>
          <Link href="/teacher/quizzes/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Quiz
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Quizzes</CardDescription>
              <CardTitle className="text-2xl">{stats[0]?.total_quizzes || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Published</CardDescription>
              <CardTitle className="text-2xl">{stats[0]?.published_quizzes || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Questions</CardDescription>
              <CardTitle className="text-2xl">{stats[0]?.total_questions || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Sales</CardDescription>
              <CardTitle className="text-2xl">{stats[0]?.total_purchases || 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Quizzes List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Quizzes</h2>
          {quizzes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No quizzes yet</h3>
                <p className="text-muted-foreground mb-4">Create your first quiz to get started</p>
                <Link href="/teacher/quizzes/new">
                  <Button>Create Quiz</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {quizzes.map((quiz) => (
                <Link key={quiz.id} href={`/teacher/quizzes/${quiz.id}`}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{quiz.title}</h3>
                            {quiz.is_published ? (
                              <Badge variant="default" className="shrink-0">
                                <Eye className="h-3 w-3 mr-1" />
                                Published
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="shrink-0">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Draft
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {quiz.description || "No description"}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Level: {quiz.level}</span>
                            <span>{quiz.question_count} questions</span>
                            <span>${(quiz.price_cents / 100).toFixed(2)}</span>
                            {Number.parseFloat(quiz.avg_rating) > 0 && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {Number.parseFloat(quiz.avg_rating).toFixed(1)} ({quiz.rating_count})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
