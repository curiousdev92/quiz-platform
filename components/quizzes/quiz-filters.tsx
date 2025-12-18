"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, X } from "lucide-react"
import { useState, useTransition } from "react"

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
const popularTags = ["grammar", "vocabulary", "reading", "listening", "writing", "speaking"]

type Filters = {
  level?: string
  tag?: string
  minPrice?: string
  maxPrice?: string
  search?: string
}

export function QuizFilters({ currentFilters }: { currentFilters: Filters }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(currentFilters.search || "")
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || "")
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || "")

  const selectedLevels = currentFilters.level?.split(",").filter(Boolean) || []
  const selectedTags = currentFilters.tag?.split(",").filter(Boolean) || []

  const updateFilters = (updates: Partial<Filters>) => {
    const params = new URLSearchParams()
    const newFilters = { ...currentFilters, ...updates }

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const toggleLevel = (level: string) => {
    const newLevels = selectedLevels.includes(level)
      ? selectedLevels.filter((l) => l !== level)
      : [...selectedLevels, level]
    updateFilters({ level: newLevels.join(",") || undefined })
  }

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]
    updateFilters({ tag: newTags.join(",") || undefined })
  }

  const clearFilters = () => {
    setSearch("")
    setMinPrice("")
    setMaxPrice("")
    router.push(pathname)
  }

  const hasFilters =
    selectedLevels.length > 0 || selectedTags.length > 0 || minPrice || maxPrice || currentFilters.search

  return (
    <Card className={isPending ? "opacity-60" : ""}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label>Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateFilters({ search: search || undefined })
                }
              }}
              placeholder="Search quizzes..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Levels */}
        <div className="space-y-2">
          <Label>Level</Label>
          <div className="grid grid-cols-3 gap-2">
            {levels.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={`level-${level}`}
                  checked={selectedLevels.includes(level)}
                  onCheckedChange={() => toggleLevel(level)}
                />
                <Label htmlFor={`level-${level}`} className="text-sm font-normal cursor-pointer">
                  {level}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range (USD)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={() => updateFilters({ minPrice: minPrice || undefined })}
              className="w-20"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={() => updateFilters({ maxPrice: maxPrice || undefined })}
              className="w-20"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
