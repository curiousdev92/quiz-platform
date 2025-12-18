"use server"

import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { requireRole } from "@/lib/auth"

export async function rateQuiz(quizId: string, value: number) {
  const user = await requireRole(["teacher", "admin"])

  if (value < 1 || value > 5) {
    return { error: "Rating must be between 1 and 5" }
  }

  // Check quiz exists and user is not the author
  const quiz = await sql`SELECT author_id FROM quizzes WHERE id = ${quizId}`
  if (quiz.length === 0) {
    return { error: "Quiz not found" }
  }
  if (quiz[0].author_id === user.id) {
    return { error: "You cannot rate your own quiz" }
  }

  // Upsert rating
  await sql`
    INSERT INTO ratings (quiz_id, teacher_id, value)
    VALUES (${quizId}, ${user.id}, ${value})
    ON CONFLICT (quiz_id, teacher_id)
    DO UPDATE SET value = ${value}, created_at = NOW()
  `

  revalidatePath(`/quizzes/${quizId}`)
  revalidatePath(`/teacher/quizzes/${quizId}`)
  return { success: true }
}

export async function addComment(quizId: string, text: string) {
  const user = await requireRole(["teacher", "admin"])

  if (!text.trim()) {
    return { error: "Comment cannot be empty" }
  }

  // Check quiz exists
  const quiz = await sql`SELECT author_id FROM quizzes WHERE id = ${quizId}`
  if (quiz.length === 0) {
    return { error: "Quiz not found" }
  }

  await sql`
    INSERT INTO comments (quiz_id, teacher_id, text)
    VALUES (${quizId}, ${user.id}, ${text.trim()})
  `

  revalidatePath(`/quizzes/${quizId}`)
  revalidatePath(`/teacher/quizzes/${quizId}`)
  return { success: true }
}

export async function deleteComment(commentId: string) {
  const user = await requireRole(["teacher", "admin"])

  // Check ownership or admin
  const comment = await sql`SELECT teacher_id FROM comments WHERE id = ${commentId}`
  if (comment.length === 0) {
    return { error: "Comment not found" }
  }
  if (comment[0].teacher_id !== user.id && user.role !== "admin") {
    return { error: "Not authorized" }
  }

  const result = await sql`DELETE FROM comments WHERE id = ${commentId} RETURNING quiz_id`

  if (result.length > 0) {
    revalidatePath(`/quizzes/${result[0].quiz_id}`)
    revalidatePath(`/teacher/quizzes/${result[0].quiz_id}`)
  }

  return { success: true }
}
