import Link from "next/link"
import { getSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Award, CreditCard } from "lucide-react"

export default async function HomePage() {
  const user = await getSession()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
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
                <form
                  action={async () => {
                    "use server"
                    const { logout } = await import("@/app/actions/auth")
                    await logout()
                  }}
                >
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

      {/* Hero Section */}
      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
              English Quizzes Created by Teachers, for Learners
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Discover high-quality English quizzes crafted by professional teachers. From grammar to vocabulary, find
              the perfect quiz for your level.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/quizzes">
                <Button size="lg">Browse Quizzes</Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  Become a Teacher
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-12">Why QuizHub?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Quality Content</h3>
                <p className="text-sm text-muted-foreground">
                  Quizzes created and reviewed by professional English teachers
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Teacher Community</h3>
                <p className="text-sm text-muted-foreground">
                  Teachers rate and review each other's work for continuous improvement
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">All CEFR Levels</h3>
                <p className="text-sm text-muted-foreground">Find quizzes from A1 beginner to C2 proficiency level</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">Safe checkout powered by Stripe for all purchases</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} QuizHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
