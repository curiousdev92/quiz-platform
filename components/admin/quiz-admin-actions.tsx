"use client"

import { useState } from "react"
import { adminDeleteQuiz, adminToggleQuizPublish } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, EyeOff, Trash2, ExternalLink } from "lucide-react"
import type { Quiz } from "@/lib/db"

export function QuizAdminActions({ quiz }: { quiz: Quiz }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleTogglePublish = async () => {
    setIsLoading(true)
    await adminToggleQuizPublish(quiz.id)
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) return
    setIsLoading(true)
    await adminDeleteQuiz(quiz.id)
    setIsLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isLoading}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href={`/quizzes/${quiz.id}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Quiz
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleTogglePublish}>
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
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Quiz
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
