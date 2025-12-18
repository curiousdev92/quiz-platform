"use client"

import { useState } from "react"
import { toggleUserStatus, updateUserRole } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, UserX, UserCheck, Shield, GraduationCap } from "lucide-react"
import type { User } from "@/lib/db"

export function UserActions({ user, currentUserId }: { user: User; currentUserId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleStatus = async () => {
    setIsLoading(true)
    await toggleUserStatus(user.id)
    setIsLoading(false)
  }

  const handleRoleChange = async (role: "student" | "teacher" | "admin") => {
    setIsLoading(true)
    await updateUserRole(user.id, role)
    setIsLoading(false)
  }

  // Don't allow actions on self
  if (user.id === currentUserId) {
    return <span className="text-sm text-muted-foreground">You</span>
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

        <DropdownMenuItem onClick={handleToggleStatus}>
          {user.is_active ? (
            <>
              <UserX className="h-4 w-4 mr-2" />
              Deactivate
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4 mr-2" />
              Activate
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Change Role</DropdownMenuLabel>

        {user.role !== "student" && (
          <DropdownMenuItem onClick={() => handleRoleChange("student")}>
            <GraduationCap className="h-4 w-4 mr-2" />
            Make Student
          </DropdownMenuItem>
        )}

        {user.role !== "teacher" && (
          <DropdownMenuItem onClick={() => handleRoleChange("teacher")}>
            <GraduationCap className="h-4 w-4 mr-2" />
            Make Teacher
          </DropdownMenuItem>
        )}

        {user.role !== "admin" && (
          <DropdownMenuItem onClick={() => handleRoleChange("admin")}>
            <Shield className="h-4 w-4 mr-2" />
            Make Admin
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
