"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { requireRole } from "@/lib/auth"

export async function createQuiz(formData: FormData) {
  const user = await requireRole(["teacher", "admin"])

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const level = formData.get("level") as string
  const priceCents = Math.round(Number.parseFloat(formData.get("price") as string) * 100)
  const tagsRaw = formData.get("tags") as string
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  if (!title || !level) {
    return { error: "Title and level are required" }
  }

  const result = await sql`
    INSERT INTO quizzes (title, description, level, price_cents, tags, author_id)
    VALUES (${title}, ${description}, ${level}::cefr_level, ${priceCents}, ${tags}, ${user.id})
    RETURNING id
  `

  redirect(`/teacher/quizzes/${result[0].id}`)
}

export async function updateQuiz(quizId: string, formData: FormData) {
  const user = await requireRole(["teacher", "admin"])

  // Verify ownership
  const quiz = await sql`SELECT author_id FROM quizzes WHERE id = ${quizId}`
  if (quiz.length === 0) {
    return { error: "Quiz not found" }
  }
  if (quiz[0].author_id !== user.id && user.role !== "admin") {
    return { error: "Not authorized" }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const level = formData.get("level") as string
  const priceCents = Math.round(Number.parseFloat(formData.get("price") as string) * 100)
  const tagsRaw = formData.get("tags") as string
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : []
  const isPublished = formData.get("isPublished") === "true"

  await sql`
    UPDATE quizzes
    SET title = ${title}, description = ${description}, level = ${level}::cefr_level,
        price_cents = ${priceCents}, tags = ${tags}, is_published = ${isPublished},
        updated_at = NOW()
    WHERE id = ${quizId}
  `

  revalidatePath(`/teacher/quizzes/${quizId}`)
  revalidatePath("/teacher/dashboard")
  return { success: true }
}

export async function deleteQuiz(quizId: string) {
  const user = await requireRole(["teacher", "admin"])

  const quiz = await sql`SELECT author_id FROM quizzes WHERE id = ${quizId}`
  if (quiz.length === 0) {
    return { error: "Quiz not found" }
  }
  if (quiz[0].author_id !== user.id && user.role !== "admin") {
    return { error: "Not authorized" }
  }

  await sql`DELETE FROM quizzes WHERE id = ${quizId}`

  revalidatePath("/teacher/dashboard")
  redirect("/teacher/dashboard")
}

export async function togglePublish(quizId: string) {
  const user = await requireRole(["teacher", "admin"])

  const quiz = await sql`SELECT author_id, is_published FROM quizzes WHERE id = ${quizId}`
  if (quiz.length === 0) {
    return { error: "Quiz not found" }
  }
  if (quiz[0].author_id !== user.id && user.role !== "admin") {
    return { error: "Not authorized" }
  }

  await sql`
    UPDATE quizzes SET is_published = ${!quiz[0].is_published}, updated_at = NOW()
    WHERE id = ${quizId}
  `

  revalidatePath(`/teacher/quizzes/${quizId}`)
  revalidatePath("/teacher/dashboard")
  return { success: true }
}

export async function addQuestion(quizId: string, formData: FormData) {
  const user = await requireRole(["teacher", "admin"])

  const quiz = await sql`SELECT author_id FROM quizzes WHERE id = ${quizId}`
  if (quiz.length === 0) {
    return { error: "Quiz not found" }
  }
  if (quiz[0].author_id !== user.id && user.role !== "admin") {
    return { error: "Not authorized" }
  }

  const prompt = formData.get("prompt") as string
  const optionA = formData.get("optionA") as string
  const optionB = formData.get("optionB") as string
  const optionC = formData.get("optionC") as string
  const optionD = formData.get("optionD") as string
  const correctOption = formData.get("correctOption") as string
  const explanation = formData.get("explanation") as string

  if (!prompt || !optionA || !optionB || !optionC || !optionD || !correctOption) {
    return { error: "All fields except explanation are required" }
  }

  // Get next sort order
  const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), 0) as max FROM questions WHERE quiz_id = ${quizId}`

  await sql`
    INSERT INTO questions (quiz_id, prompt, option_a, option_b, option_c, option_d, correct_option, explanation, sort_order)
    VALUES (${quizId}, ${prompt}, ${optionA}, ${optionB}, ${optionC}, ${optionD}, ${correctOption}, ${explanation || null}, ${maxOrder[0].max + 1})
  `

  revalidatePath(`/teacher/quizzes/${quizId}`)
  return { success: true }
}

export async function updateQuestion(questionId: string, formData: FormData) {
  const user = await requireRole(["teacher", "admin"])

  const question = await sql`
    SELECT q.quiz_id, qz.author_id FROM questions q
    JOIN quizzes qz ON q.quiz_id = qz.id
    WHERE q.id = ${questionId}
  `
  if (question.length === 0) {
    return { error: "Question not found" }
  }
  if (question[0].author_id !== user.id && user.role !== "admin") {
    return { error: "Not authorized" }
  }

  const prompt = formData.get("prompt") as string
  const optionA = formData.get("optionA") as string
  const optionB = formData.get("optionB") as string
  const optionC = formData.get("optionC") as string
  const optionD = formData.get("optionD") as string
  const correctOption = formData.get("correctOption") as string
  const explanation = formData.get("explanation") as string

  await sql`
    UPDATE questions
    SET prompt = ${prompt}, option_a = ${optionA}, option_b = ${optionB},
        option_c = ${optionC}, option_d = ${optionD}, correct_option = ${correctOption},
        explanation = ${explanation || null}
    WHERE id = ${questionId}
  `

  revalidatePath(`/teacher/quizzes/${question[0].quiz_id}`)
  return { success: true }
}

export async function deleteQuestion(questionId: string) {
  const user = await requireRole(["teacher", "admin"])

  const question = await sql`
    SELECT q.quiz_id, qz.author_id FROM questions q
    JOIN quizzes qz ON q.quiz_id = qz.id
    WHERE q.id = ${questionId}
  `
  if (question.length === 0) {
    return { error: "Question not found" }
  }
  if (question[0].author_id !== user.id && user.role !== "admin") {
    return { error: "Not authorized" }
  }

  await sql`DELETE FROM questions WHERE id = ${questionId}`

  revalidatePath(`/teacher/quizzes/${question[0].quiz_id}`)
  return { success: true }
}
