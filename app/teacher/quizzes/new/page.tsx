import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { Header } from "@/components/header"
import { QuizForm } from "@/components/teacher/quiz-form"

export default async function NewQuizPage() {
  const user = await getSession()
  if (!user) redirect("/login")
  if (user.role !== "teacher" && user.role !== "admin") redirect("/")

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Create New Quiz</h1>
        <QuizForm />
      </main>
    </div>
  )
}
