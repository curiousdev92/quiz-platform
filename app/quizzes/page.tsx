import { Suspense } from "react"
import { Header } from "@/components/header"
import { QuizFilters } from "@/components/quizzes/quiz-filters"
import { QuizGrid } from "@/components/quizzes/quiz-grid"
import { Skeleton } from "@/components/ui/skeleton"

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; tag?: string; minPrice?: string; maxPrice?: string; search?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Quizzes</h1>
          <p className="text-muted-foreground">Find the perfect English quiz for your level</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <QuizFilters currentFilters={params} />
          </aside>

          <div className="flex-1">
            <Suspense fallback={<QuizGridSkeleton />}>
              <QuizGrid filters={params} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}

function QuizGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}
