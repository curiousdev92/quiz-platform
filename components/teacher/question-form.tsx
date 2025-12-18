"use client"

import { useActionState } from "react"
import { useRef, useEffect } from "react"
import { addQuestion } from "@/app/actions/quiz"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, CheckCircle } from "lucide-react"

export function QuestionForm({ quizId }: { quizId: string }) {
  const formRef = useRef<HTMLFormElement>(null)
  const boundAction = addQuestion.bind(null, quizId)
  const [state, formAction, isPending] = useActionState(boundAction, null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state?.error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          <AlertCircle className="h-4 w-4" />
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 rounded-md">
          <CheckCircle className="h-4 w-4" />
          Question added successfully
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="prompt">Question *</Label>
        <Textarea id="prompt" name="prompt" placeholder="Enter your question..." rows={2} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="optionA">Option A *</Label>
          <Input id="optionA" name="optionA" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="optionB">Option B *</Label>
          <Input id="optionB" name="optionB" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="optionC">Option C *</Label>
          <Input id="optionC" name="optionC" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="optionD">Option D *</Label>
          <Input id="optionD" name="optionD" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Correct Answer *</Label>
        <RadioGroup name="correctOption" defaultValue="A" className="flex gap-6">
          {["A", "B", "C", "D"].map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`correct-${option}`} />
              <Label htmlFor={`correct-${option}`} className="font-normal cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="explanation">Explanation (optional)</Label>
        <Textarea id="explanation" name="explanation" placeholder="Explain the correct answer..." rows={2} />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding..." : "Add Question"}
      </Button>
    </form>
  )
}
