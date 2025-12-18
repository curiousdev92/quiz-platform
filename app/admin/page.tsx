import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, ShoppingCart, DollarSign, ArrowRight } from "lucide-react"

export default async function AdminDashboard() {
  const user = await getSession()
  if (!user) redirect("/login")
  if (user.role !== "admin") redirect("/")

  const stats = await sql`
    SELECT 
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM users WHERE role = 'teacher') as total_teachers,
      (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
      (SELECT COUNT(*) FROM quizzes) as total_quizzes,
      (SELECT COUNT(*) FROM quizzes WHERE is_published = true) as published_quizzes,
      (SELECT COUNT(*) FROM purchases) as total_purchases,
      (SELECT COALESCE(SUM(amount_cents), 0) FROM purchases) as total_revenue
  `

  const recentUsers = await sql`
    SELECT id, name, email, role, is_active, created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT 5
  `

  const recentPurchases = await sql`
    SELECT p.*, q.title as quiz_title, u.name as user_name
    FROM purchases p
    JOIN quizzes q ON p.quiz_id = q.id
    JOIN users u ON p.student_id = u.id
    ORDER BY p.created_at DESC
    LIMIT 5
  `

  const s = stats[0]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardDescription>
              <CardTitle className="text-2xl">{s.total_users}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {s.total_teachers} teachers, {s.total_students} students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Quizzes
              </CardDescription>
              <CardTitle className="text-2xl">{s.total_quizzes}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{s.published_quizzes} published</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Purchases
              </CardDescription>
              <CardTitle className="text-2xl">{s.total_purchases}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Total transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Revenue
              </CardDescription>
              <CardTitle className="text-2xl">${(Number(s.total_revenue) / 100).toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Total earnings</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest registrations</CardDescription>
              </div>
              <Link href="/admin/users">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 rounded bg-muted capitalize">{user.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Purchases */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Purchases</CardTitle>
                <CardDescription>Latest transactions</CardDescription>
              </div>
              <Link href="/admin/purchases">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentPurchases.length === 0 ? (
                <p className="text-muted-foreground text-sm">No purchases yet</p>
              ) : (
                <div className="space-y-3">
                  {recentPurchases.map((purchase) => (
                    <div key={purchase.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{purchase.quiz_title}</p>
                        <p className="text-xs text-muted-foreground">by {purchase.user_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(purchase.amount_cents / 100).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(purchase.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/users">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-transparent">
              <Users className="h-6 w-6" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/quizzes">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-transparent">
              <BookOpen className="h-6 w-6" />
              Manage Quizzes
            </Button>
          </Link>
          <Link href="/admin/purchases">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-transparent">
              <ShoppingCart className="h-6 w-6" />
              View Purchases
            </Button>
          </Link>
          <Link href="/quizzes">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-transparent">
              <ArrowRight className="h-6 w-6" />
              View Site
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
