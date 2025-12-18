"use client"

import { useState } from "react"
import { updateQuestion, deleteQuestion } from "@/app/actions/quiz"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Trash2, X, Check } from "lucide-react"
import type { Question } from "@/lib/db"

export function QuestionList({ questions }: { questions: Question[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No questions added yet. Add your first question above.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Questions ({questions.length})</h3>
      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-base font-medium">
                {index + 1}. {question.prompt}
              </CardTitle>
              <div className="flex gap-1 shrink-0">
                {editingId !== question.id && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => setEditingId(question.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        if (confirm("Delete this question?")) {
                          await deleteQuestion(question.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {editingId === question.id ? (
              <QuestionEditForm
                question={question}
                onCancel={() => setEditingId(null)}
                onSave={() => setEditingId(null)}
              />
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div
                    className={`p-2 rounded ${question.correct_option === "A" ? "bg-green-100 text-green-800" : "bg-muted"}`}
                  >
                    A: {question.option_a}
                  </div>
                  <div
                    className={`p-2 rounded ${question.correct_option === "B" ? "bg-green-100 text-green-800" : "bg-muted"}`}
                  >
                    B: {question.option_b}
                  </div>
                  <div
                    className={`p-2 rounded ${question.correct_option === "C" ? "bg-green-100 text-green-800" : "bg-muted"}`}
                  >
                    C: {question.option_c}
                  </div>
                  <div
                    className={`p-2 rounded ${question.correct_option === "D" ? "bg-green-100 text-green-800" : "bg-muted"}`}
                  >
                    D: {question.option_d}
                  </div>
                </div>
                {question.explanation && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="font-medium">Explanation:</span> {question.explanation}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function QuestionEditForm({
  question,
  onCancel,
  onSave,
}: {
  question: Question
  onCancel: () => void
  onSave: () => void
}) {
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    await updateQuestion(question.id, formData)
    setIsPending(false)
    onSave()
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Question</Label>
        <Textarea name="prompt" defaultValue={question.prompt} rows={2} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Option A</Label>
          <Input name="optionA" defaultValue={question.option_a} required />
        </div>
        <div className="space-y-2">
          <Label>Option B</Label>
          <Input name="optionB" defaultValue={question.option_b} required />
        </div>
        <div className="space-y-2">
          <Label>Option C</Label>
          <Input name="optionC" defaultValue={question.option_c} required />
        </div>
        <div className="space-y-2">
          <Label>Option D</Label>
          <Input name="optionD" defaultValue={question.option_d} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Correct Answer</Label>
        <RadioGroup name="correctOption" defaultValue={question.correct_option} className="flex gap-6">
          {["A", "B", "C", "D"].map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`edit-correct-${option}`} />
              <Label htmlFor={`edit-correct-${option}`} className="font-normal">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Explanation</Label>
        <Textarea name="explanation" defaultValue={question.explanation || ""} rows={2} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          <Check className="h-4 w-4 mr-1" />
          {isPending ? "Saving..." : "Save"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </form>
  )
}
