import Link from "next/link"
import { getSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import { logout } from "@/app/actions/auth"

export async function Header() {
  const user = await getSession()

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-semibold text-xl">QuizHub</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/quizzes">
            <Button variant="ghost">Browse Quizzes</Button>
          </Link>
          {user ? (
            <>
              {user.role === "teacher" && (
                <Link href="/teacher/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              )}
              {user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="ghost">Admin</Button>
                </Link>
              )}
              {user.role === "student" && (
                <Link href="/my-purchases">
                  <Button variant="ghost">My Purchases</Button>
                </Link>
              )}
              <form action={logout}>
                <Button variant="outline">Logout</Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
