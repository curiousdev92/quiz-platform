import Link from "next/link"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, BookOpen, Play } from "lucide-react"

export default async function MyPurchasesPage() {
  const user = await getSession()
  if (!user) redirect("/login")

  const purchases = await sql`
    SELECT p.*, q.title, q.description, q.level, q.tags,
      u.name as author_name,
      (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count
    FROM purchases p
    JOIN quizzes q ON p.quiz_id = q.id
    JOIN users u ON q.author_id = u.id
    WHERE p.student_id = ${user.id}
    ORDER BY p.created_at DESC
  `

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Purchases</h1>
          <p className="text-muted-foreground">Your purchased quizzes</p>
        </div>

        {purchases.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No purchases yet</h3>
              <p className="text-muted-foreground mb-4">Browse our quiz catalog to find something you like</p>
              <Link href="/quizzes">
                <Button>Browse Quizzes</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchases.map((purchase) => (
              <Card key={purchase.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{purchase.title}</CardTitle>
                    <Badge variant="secondary">{purchase.level}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{purchase.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {purchase.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <BookOpen className="h-4 w-4" />
                    <span>{purchase.question_count} questions</span>
                    <span className="mx-1">•</span>
                    <span>by {purchase.author_name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/my-purchases/${purchase.quiz_id}/take`} className="flex-1">
                      <Button className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Take Quiz
                      </Button>
                    </Link>
                    <Link href={`/quizzes/${purchase.quiz_id}`}>
                      <Button variant="outline">View</Button>
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Purchased {new Date(purchase.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
