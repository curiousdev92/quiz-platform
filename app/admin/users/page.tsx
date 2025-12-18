import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { UserActions } from "@/components/admin/user-actions"

export default async function AdminUsersPage() {
  const user = await getSession()
  if (!user) redirect("/login")
  if (user.role !== "admin") redirect("/")

  const users = await sql`
    SELECT u.*, 
      (SELECT COUNT(*) FROM quizzes WHERE author_id = u.id) as quiz_count,
      (SELECT COUNT(*) FROM purchases WHERE student_id = u.id) as purchase_count
    FROM users u
    ORDER BY u.created_at DESC
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
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <p className="text-muted-foreground">{users.length} total users</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Activity</th>
                    <th className="pb-3 font-medium">Joined</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-4">
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </td>
                      <td className="py-4">
                        <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Badge variant={u.is_active ? "default" : "destructive"}>
                          {u.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {u.role === "teacher" ? (
                          <span>{u.quiz_count} quizzes</span>
                        ) : u.role === "student" ? (
                          <span>{u.purchase_count} purchases</span>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right">
                        <UserActions user={u} currentUserId={user.id} />
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
