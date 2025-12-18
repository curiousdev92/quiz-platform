"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, RotateCcw } from "lucide-react"
import type { Quiz, Question } from "@/lib/db"

type QuizWithAuthor = Quiz & { author_name: string }

export function QuizTaker({
  quiz,
  questions,
  isFreeQuiz = false,
}: {
  quiz: QuizWithAuthor
  questions: Question[]
  isFreeQuiz?: boolean
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  const selectAnswer = (option: string) => {
    if (showResults) return
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }))
  }

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const submitQuiz = () => {
    setShowResults(true)
  }

  const resetQuiz = () => {
    setAnswers({})
    setShowResults(false)
    setCurrentIndex(0)
  }

  const correctCount = questions.reduce((count, q) => {
    return count + (answers[q.id] === q.correct_option ? 1 : 0)
  }, 0)

  const score = Math.round((correctCount / questions.length) * 100)

  const backLink = isFreeQuiz ? "/quizzes" : "/my-purchases"
  const backLabel = isFreeQuiz ? "Back to Quizzes" : "Back to My Purchases"

  if (showResults) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
          <p className="text-muted-foreground">{quiz.title}</p>
        </div>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-6xl font-bold mb-2">{score}%</div>
            <p className="text-lg text-muted-foreground mb-4">
              {correctCount} out of {questions.length} correct
            </p>
            <Badge
              variant={score >= 70 ? "default" : score >= 50 ? "secondary" : "destructive"}
              className="text-lg px-4 py-1"
            >
              {score >= 70 ? "Great Job!" : score >= 50 ? "Keep Practicing" : "Need More Practice"}
            </Badge>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Review Answers</h2>
          {questions.map((q, index) => {
            const userAnswer = answers[q.id]
            const isCorrect = userAnswer === q.correct_option

            return (
              <Card key={q.id} className={isCorrect ? "border-green-200" : "border-red-200"}>
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <CardTitle className="text-base">
                      {index + 1}. {q.prompt}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {(["A", "B", "C", "D"] as const).map((opt) => {
                      const optionKey = `option_${opt.toLowerCase()}` as keyof Question
                      const isUserAnswer = userAnswer === opt
                      const isCorrectAnswer = q.correct_option === opt

                      let className = "p-2 rounded "
                      if (isCorrectAnswer) {
                        className += "bg-green-100 text-green-800 border border-green-300"
                      } else if (isUserAnswer && !isCorrect) {
                        className += "bg-red-100 text-red-800 border border-red-300"
                      } else {
                        className += "bg-muted"
                      }

                      return (
                        <div key={opt} className={className}>
                          {opt}: {q[optionKey] as string}
                        </div>
                      )
                    })}
                  </div>
                  {q.explanation && (
                    <p className="text-sm text-muted-foreground mt-3">
                      <span className="font-medium">Explanation:</span> {q.explanation}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={resetQuiz} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Link href={backLink}>
            <Button>{backLabel}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={backLink} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Exit Quiz
        </Link>
        <Badge variant="secondary">{quiz.level}</Badge>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>{Object.keys(answers).length} answered</span>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.prompt}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(["A", "B", "C", "D"] as const).map((opt) => {
            const optionKey = `option_${opt.toLowerCase()}` as keyof Question
            const isSelected = answers[currentQuestion.id] === opt

            return (
              <button
                key={opt}
                onClick={() => selectAnswer(opt)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <span className="font-medium mr-2">{opt}.</span>
                {currentQuestion[optionKey] as string}
              </button>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={goPrev} disabled={currentIndex === 0}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentIndex === questions.length - 1 ? (
          <Button onClick={submitQuiz} disabled={Object.keys(answers).length !== questions.length}>
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={goNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Question Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        {questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(index)}
            className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
              index === currentIndex
                ? "bg-primary text-primary-foreground"
                : answers[q.id]
                  ? "bg-primary/20 text-primary"
                  : "bg-muted"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
