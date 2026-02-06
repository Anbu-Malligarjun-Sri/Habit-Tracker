"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { LegacyHabit } from "@/core/types"
import { toast } from "sonner"

interface HabitsContextType {
  habits: (LegacyHabit & { completed: boolean; streak: number })[]
  addHabit: (habit: Omit<LegacyHabit, "id" | "isActive">) => void
  toggleHabit: (id: string, date?: Date) => void
  deleteHabit: (id: string) => void
  getStats: () => { total: number; completed: number; streak: number }
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined)

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<(LegacyHabit & { completed: boolean; streak: number })[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem("life-os-habits")
        if (saved) {
        try {
            setHabits(JSON.parse(saved))
        } catch (e) {
            console.error("Failed to parse habits", e)
        }
        } else {
        // Default seed data if empty
        setHabits([
            {
            id: "1",
            name: "Morning Meditation",
            description: "Start the day with 10 mins of mindfulness",
            category: "Personal",
            icon: "🧘‍♂️",
            frequency: "daily",
            difficulty: 3,
            isActive: true,
            completed: false,
            streak: 5
            }
        ])
        }
        setIsLoaded(true)
    }
  }, [])

  // Save to LocalStorage whenever habits change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("life-os-habits", JSON.stringify(habits))
    }
  }, [habits, isLoaded])

  const addHabit = (newHabit: Omit<LegacyHabit, "id" | "isActive">) => {
    const habit = {
      ...newHabit,
      id: crypto.randomUUID(),
      isActive: true,
      completed: false,
      streak: 0
    }
    setHabits((prev) => [...prev, habit])
    toast.success("Habit created successfully!")
  }

  const toggleHabit = (id: string) => {
    setHabits((prev) => 
      prev.map((h) => {
        if (h.id === id) {
          const isCompleting = !h.completed
          // Simple streak logic: +1 if completing, -1 (clamped to 0) if un-completing
          const newStreak = isCompleting ? h.streak + 1 : Math.max(0, h.streak - 1)
          return { ...h, completed: isCompleting, streak: newStreak }
        }
        return h
      })
    )
  }

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id))
    toast.success("Habit deleted")
  }

  const getStats = () => {
    const total = habits.length
    const completed = habits.filter(h => h.completed).length
    const streak = habits.reduce((acc, curr) => acc + curr.streak, 0)
    return { total, completed, streak }
  }

  return (
    <HabitsContext.Provider value={{ habits, addHabit, toggleHabit, deleteHabit, getStats }}>
      {children}
    </HabitsContext.Provider>
  )
}

export function useHabits() {
  const context = useContext(HabitsContext)
  if (context === undefined) {
    throw new Error("useHabits must be used within a HabitsProvider")
  }
  return context
}
