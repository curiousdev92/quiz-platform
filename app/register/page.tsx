import Link from "next/link"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { RegisterForm } from "@/components/auth/register-form"
import { BookOpen } from "lucide-react"

export default async function RegisterPage() {
  const user = await getSession()
  if (user) {
    if (user.role === "teacher") redirect("/teacher/dashboard")
    if (user.role === "admin") redirect("/admin")
    redirect("/quizzes")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="font-semibold text-2xl">QuizHub</span>
          </Link>
          <h1 className="text-2xl font-semibold">Create an account</h1>
          <p className="text-muted-foreground">Join QuizHub today</p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
