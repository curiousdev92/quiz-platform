"use client"

import { useState } from "react"
import { rateQuiz, addComment } from "@/app/actions/feedback"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, MessageSquare, Send } from "lucide-react"
import type { User, Rating, Comment } from "@/lib/db"

type RatingWithTeacher = Rating & { teacher_name: string }
type CommentWithTeacher = Comment & { teacher_name: string }

export function QuizFeedback({
  quizId,
  user,
  ratings,
  comments,
  userRating,
  isAuthor,
}: {
  quizId: string
  user: User | null
  ratings: RatingWithTeacher[]
  comments: CommentWithTeacher[]
  userRating: number | null
  isAuthor: boolean
}) {
  const [hoveredStar, setHoveredStar] = useState(0)
  const [selectedRating, setSelectedRating] = useState(userRating || 0)
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length : 0

  const canRate = user && user.role === "teacher" && !isAuthor
  const canComment = user && user.role === "teacher"

  const handleRate = async (value: number) => {
    if (!canRate) return
    setSelectedRating(value)
    setIsSubmittingRating(true)
    await rateQuiz(quizId, value)
    setIsSubmittingRating(false)
  }

  const handleComment = async () => {
    if (!canComment || !commentText.trim()) return
    setIsSubmittingComment(true)
    const result = await addComment(quizId, commentText)
    if (result.success) {
      setCommentText("")
    }
    setIsSubmittingComment(false)
  }

  return (
    <div className="space-y-6">
      {/* Rating Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5" />
            Teacher Ratings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Average Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${star <= avgRating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                />
              ))}
            </div>
            <span className="text-2xl font-bold">{avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({ratings.length} ratings)</span>
          </div>

          {/* Rate This Quiz */}
          {canRate && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Rate this quiz</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => handleRate(star)}
                    disabled={isSubmittingRating}
                    className="p-1 disabled:opacity-50"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoveredStar || selectedRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted hover:text-yellow-200"
                      }`}
                    />
                  </button>
                ))}
                {selectedRating > 0 && <span className="ml-2 text-sm text-muted-foreground">Your rating</span>}
              </div>
            </div>
          )}

          {!user && (
            <p className="text-sm text-muted-foreground pt-4 border-t">Log in as a teacher to rate this quiz</p>
          )}

          {user && user.role !== "teacher" && (
            <p className="text-sm text-muted-foreground pt-4 border-t">Only teachers can rate quizzes</p>
          )}

          {isAuthor && <p className="text-sm text-muted-foreground pt-4 border-t">You cannot rate your own quiz</p>}
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Teacher Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Comment */}
          {canComment && (
            <div className="flex gap-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts on this quiz..."
                rows={2}
                className="flex-1"
              />
              <Button onClick={handleComment} disabled={isSubmittingComment || !commentText.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}

          {!user && <p className="text-sm text-muted-foreground">Log in as a teacher to comment</p>}

          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{comment.teacher_name}</span>
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
    </div>
  )
}
