import { neon } from "@neondatabase/serverless"

// Create the SQL client - neon() returns a tagged template function
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.warn("DATABASE_URL is not set - database queries will fail")
}

export const sql = neon(databaseUrl!)

export type User = {
  id: string
  name: string
  email: string
  password_hash: string
  role: "student" | "teacher" | "admin"
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export type Quiz = {
  id: string
  title: string
  description: string | null
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
  price_cents: number
  tags: string[]
  is_published: boolean
  author_id: string
  created_at: Date
  updated_at: Date
}

export type Question = {
  id: string
  quiz_id: string
  prompt: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: "A" | "B" | "C" | "D"
  explanation: string | null
  sort_order: number
  created_at: Date
}

export type Rating = {
  id: string
  quiz_id: string
  teacher_id: string
  value: number
  created_at: Date
}

export type Comment = {
  id: string
  quiz_id: string
  teacher_id: string
  text: string
  created_at: Date
}

export type Purchase = {
  id: string
  quiz_id: string
  student_id: string
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  amount_cents: number
  created_at: Date
}
