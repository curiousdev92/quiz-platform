import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default async function AdminPurchasesPage() {
  const user = await getSession()
  if (!user) redirect("/login")
  if (user.role !== "admin") redirect("/")

  const purchases = await sql`
    SELECT p.*, q.title as quiz_title, q.level,
      u.name as user_name, u.email as user_email,
      author.name as author_name
    FROM purchases p
    JOIN quizzes q ON p.quiz_id = q.id
    JOIN users u ON p.student_id = u.id
    JOIN users author ON q.author_id = author.id
    ORDER BY p.created_at DESC
  `

  const totalRevenue = purchases.reduce((sum, p) => sum + p.amount_cents, 0)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">All Purchases</h1>
          <p className="text-muted-foreground">
            {purchases.length} transactions &bull; ${(totalRevenue / 100).toFixed(2)} total revenue
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No purchases yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Quiz</th>
                      <th className="pb-3 font-medium">Buyer</th>
                      <th className="pb-3 font-medium">Author</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b last:border-0">
                        <td className="py-4 text-sm">{new Date(purchase.created_at).toLocaleString()}</td>
                        <td className="py-4">
                          <Link href={`/quizzes/${purchase.quiz_id}`} className="hover:underline">
                            <p className="font-medium">{purchase.quiz_title}</p>
                          </Link>
                          <p className="text-xs text-muted-foreground">{purchase.level}</p>
                        </td>
                        <td className="py-4">
                          <p className="text-sm">{purchase.user_name}</p>
                          <p className="text-xs text-muted-foreground">{purchase.user_email}</p>
                        </td>
                        <td className="py-4 text-sm">{purchase.author_name}</td>
                        <td className="py-4 text-right font-medium">${(purchase.amount_cents / 100).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
