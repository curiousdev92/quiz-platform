"use server"

import { redirect } from "next/navigation"
import { neon } from "@neondatabase/serverless"
import { hashPassword, verifyPassword, createSession, deleteSession } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function register(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as "student" | "teacher"

  console.log("[v0] Register attempt:", { name, email, role })

  if (!name || !email || !password || !role) {
    return { error: "All fields are required" }
  }

  if (!["student", "teacher"].includes(role)) {
    return { error: "Invalid role" }
  }

  try {
    // Check if user exists
    console.log("[v0] Checking for existing user...")
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`
    console.log("[v0] Existing user check result:", existingUser)

    if (existingUser.length > 0) {
      return { error: "Email already registered" }
    }

    const passwordHash = await hashPassword(password)
    console.log("[v0] Password hashed, inserting user...")

    const result = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${passwordHash}, ${role})
      RETURNING id
    `
    console.log("[v0] User inserted:", result)

    await createSession(result[0].id)
    console.log("[v0] Session created, redirecting...")
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return { error: "Failed to create account. Please try again." }
  }

  if (role === "teacher") {
    redirect("/teacher/dashboard")
  } else {
    redirect("/quizzes")
  }
}

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const result = await sql`
    SELECT * FROM users WHERE email = ${email} AND is_active = true
  `

  const user = result[0]
  if (!user) {
    return { error: "Invalid credentials" }
  }

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) {
    return { error: "Invalid credentials" }
  }

  await createSession(user.id)

  if (user.role === "admin") {
    redirect("/admin")
  } else if (user.role === "teacher") {
    redirect("/teacher/dashboard")
  } else {
    redirect("/quizzes")
  }
}

export async function logout() {
  await deleteSession()
  redirect("/")
}
