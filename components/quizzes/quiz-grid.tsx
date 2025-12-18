import Link from "next/link"
import { sql } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, BookOpen } from "lucide-react"

type Filters = {
  level?: string
  tag?: string
  minPrice?: string
  maxPrice?: string
  search?: string
}

export async function QuizGrid({ filters }: { filters: Filters }) {
  // Build dynamic query
  const conditions: string[] = ["q.is_published = true"]
  const values: (string | number)[] = []

  if (filters.level) {
    const levels = filters.level.split(",")
    conditions.push(`q.level::text = ANY($${values.length + 1})`)
    values.push(levels as unknown as string)
  }

  if (filters.tag) {
    const tags = filters.tag.split(",")
    conditions.push(`q.tags && $${values.length + 1}`)
    values.push(tags as unknown as string)
  }

  if (filters.minPrice) {
    conditions.push(`q.price_cents >= $${values.length + 1}`)
    values.push(Math.round(Number.parseFloat(filters.minPrice) * 100))
  }

  if (filters.maxPrice) {
    conditions.push(`q.price_cents <= $${values.length + 1}`)
    values.push(Math.round(Number.parseFloat(filters.maxPrice) * 100))
  }

  if (filters.search) {
    conditions.push(`(q.title ILIKE $${values.length + 1} OR q.description ILIKE $${values.length + 1})`)
    values.push(`%${filters.search}%`)
  }

  const quizzes = await sql(
    `
    SELECT q.*, u.name as author_name,
      (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count,
      (SELECT COALESCE(AVG(value), 0) FROM ratings WHERE quiz_id = q.id) as avg_rating,
      (SELECT COUNT(*) FROM ratings WHERE quiz_id = q.id) as rating_count
    FROM quizzes q
    JOIN users u ON q.author_id = u.id
    WHERE ${conditions.join(" AND ")}
    ORDER BY q.created_at DESC
  `,
    values,
  )

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">No quizzes found</h3>
        <p className="text-muted-foreground">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {quizzes.map((quiz) => (
        <Link key={quiz.id} href={`/quizzes/${quiz.id}`}>
          <Card className="h-full hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                <Badge variant="secondary">{quiz.level}</Badge>
              </div>
              <CardDescription className="line-clamp-2">{quiz.description || "No description"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 mb-3">
                {quiz.tags?.slice(0, 3).map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>{quiz.question_count} questions</span>
                  {Number.parseFloat(quiz.avg_rating) > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {Number.parseFloat(quiz.avg_rating).toFixed(1)}
                    </span>
                  )}
                </div>
                <span className="font-semibold">
                  {quiz.price_cents === 0 ? "Free" : `$${(quiz.price_cents / 100).toFixed(2)}`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">by {quiz.author_name}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
