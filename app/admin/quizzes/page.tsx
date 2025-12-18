import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star } from "lucide-react"
import { QuizAdminActions } from "@/components/admin/quiz-admin-actions"

export default async function AdminQuizzesPage() {
  const user = await getSession()
  if (!user) redirect("/login")
  if (user.role !== "admin") redirect("/")

  const quizzes = await sql`
    SELECT q.*, u.name as author_name,
      (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count,
      (SELECT COALESCE(AVG(value), 0) FROM ratings WHERE quiz_id = q.id) as avg_rating,
      (SELECT COUNT(*) FROM purchases WHERE quiz_id = q.id) as purchase_count
    FROM quizzes q
    JOIN users u ON q.author_id = u.id
    ORDER BY q.created_at DESC
  `

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Manage Quizzes</h1>
          <p className="text-muted-foreground">{quizzes.length} total quizzes</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Quiz</th>
                    <th className="pb-3 font-medium">Author</th>
                    <th className="pb-3 font-medium">Level</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Stats</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz) => (
                    <tr key={quiz.id} className="border-b last:border-0">
                      <td className="py-4">
                        <Link href={`/quizzes/${quiz.id}`} className="hover:underline">
                          <p className="font-medium">{quiz.title}</p>
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {quiz.description || "No description"}
                        </p>
                      </td>
                      <td className="py-4 text-sm">{quiz.author_name}</td>
                      <td className="py-4">
                        <Badge variant="secondary">{quiz.level}</Badge>
                      </td>
                      <td className="py-4">
                        <Badge variant={quiz.is_published ? "default" : "secondary"}>
                          {quiz.is_published ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span>{quiz.question_count} Q</span>
                          <span>{quiz.purchase_count} sales</span>
                          {Number.parseFloat(quiz.avg_rating) > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {Number.parseFloat(quiz.avg_rating).toFixed(1)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 font-medium">
                        {quiz.price_cents === 0 ? "Free" : `$${(quiz.price_cents / 100).toFixed(2)}`}
                      </td>
                      <td className="py-4 text-right">
                        <QuizAdminActions quiz={quiz} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
