"use server"

import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { requireRole } from "@/lib/auth"

export async function toggleUserStatus(userId: string) {
  await requireRole(["admin"])

  const user = await sql`SELECT is_active FROM users WHERE id = ${userId}`
  if (user.length === 0) {
    return { error: "User not found" }
  }

  await sql`
    UPDATE users SET is_active = ${!user[0].is_active}, updated_at = NOW()
    WHERE id = ${userId}
  `

  revalidatePath("/admin/users")
  return { success: true }
}

export async function updateUserRole(userId: string, role: "student" | "teacher" | "admin") {
  await requireRole(["admin"])

  if (!["student", "teacher", "admin"].includes(role)) {
    return { error: "Invalid role" }
  }

  await sql`
    UPDATE users SET role = ${role}::user_role, updated_at = NOW()
    WHERE id = ${userId}
  `

  revalidatePath("/admin/users")
  return { success: true }
}

export async function adminDeleteQuiz(quizId: string) {
  await requireRole(["admin"])

  await sql`DELETE FROM quizzes WHERE id = ${quizId}`

  revalidatePath("/admin/quizzes")
  return { success: true }
}

export async function adminToggleQuizPublish(quizId: string) {
  await requireRole(["admin"])

  const quiz = await sql`SELECT is_published FROM quizzes WHERE id = ${quizId}`
  if (quiz.length === 0) {
    return { error: "Quiz not found" }
  }

  await sql`
    UPDATE quizzes SET is_published = ${!quiz[0].is_published}, updated_at = NOW()
    WHERE id = ${quizId}
  `

  revalidatePath("/admin/quizzes")
  return { success: true }
}
