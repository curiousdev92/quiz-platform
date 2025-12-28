"use client"

import { useState } from "react"
import { useActionState } from "react"
import Link from "next/link"
import { updateQuiz, deleteQuiz, togglePublish } from "@/app/actions/quiz"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Trash2, Eye, EyeOff, Star, MessageSquare, AlertCircle, CheckCircle } from "lucide-react"
import { QuestionList } from "./question-list"
import { QuestionForm } from "./question-form"
import type { Quiz, Question, Rating, Comment } from "@/lib/db"

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"]

type QuizWithAuthor = Quiz & { author_name: string }
type RatingWithTeacher = Rating & { teacher_name: string }
type CommentWithTeacher = Comment & { teacher_name: string }

export function QuizEditor({
  quiz,
  questions,
  ratings,
  comments,
}: {
  quiz: QuizWithAuthor
  questions: Question[]
  ratings: RatingWithTeacher[]
  comments: CommentWithTeacher[]
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const boundUpdateQuiz = updateQuiz.bind(null, quiz.id)
  const [updateState, updateFormAction, isUpdating] = useActionState(boundUpdateQuiz, null)

  const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length : 0

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) return
    setIsDeleting(true)
    await deleteQuiz(quiz.id)
  }

  const handleTogglePublish = async () => {
    setIsToggling(true)
    await togglePublish(quiz.id)
    setIsToggling(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/teacher/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTogglePublish} disabled={isToggling}>
            {quiz.is_published ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Publish
              </>
            )}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
        {quiz.is_published ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>}
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
          <TabsTrigger value="feedback">Feedback ({ratings.length + comments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
              <CardDescription>Update your quiz information</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateFormAction} className="space-y-6">
                {updateState?.error && (
                  <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    {updateState.error}
                  </div>
                )}
                {updateState?.success && (
                  <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 rounded-md">
                    <CheckCircle className="h-4 w-4" />
                    Quiz updated successfully
                  </div>
                )}

                <input type="hidden" name="isPublished" value={quiz.is_published.toString()} />

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" defaultValue={quiz.title} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" defaultValue={quiz.description || ""} rows={4} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select name="level" defaultValue={quiz.level}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={(quiz.price_cents / 100).toFixed(2)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" name="tags" defaultValue={quiz.tags?.join(", ") || ""} />
                </div>

                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Question</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionForm quizId={quiz.id} />
            </CardContent>
          </Card>

          <QuestionList questions={questions} />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          {/* Ratings Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ratings.length === 0 ? (
                <p className="text-muted-foreground">No ratings yet</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold">{avgRating.toFixed(1)}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${star <= avgRating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                        />
                      ))}
                    </div>
                    <span className="text-muted-foreground">({ratings.length} ratings)</span>
                  </div>
                  <div className="space-y-2">
                    {ratings.map((rating) => (
                      <div key={rating.id} className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{rating.teacher_name}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${star <= rating.value ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {comments.length === 0 ? (
                <p className="text-muted-foreground">No comments yet</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{comment.teacher_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
