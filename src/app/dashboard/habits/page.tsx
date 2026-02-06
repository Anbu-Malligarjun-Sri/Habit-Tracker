"use client"

import { CreateHabitDialog } from "@/features/habits/components/create-habit-dialog"
import { HabitCard } from "@/features/habits/components/habit-card"
import { Separator } from "@/shared/components/ui/separator"
import { useHabits } from "@/shared/hooks/use-habits"

export default function HabitsPage() {
    const { habits, toggleHabit } = useHabits()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Habits</h2>
                    <p className="text-muted-foreground">
                        Track your daily routines and build consistency. (Local Persistence Active)
                    </p>
                </div>
                <CreateHabitDialog />
            </div>
            <Separator />

            {habits.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-muted/20">
                    <p className="text-lg font-medium">No habits yet</p>
                    <p className="text-sm text-muted-foreground mb-4">Create your first habit to get started.</p>
                    <CreateHabitDialog /> 
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {habits.map((habit) => (
                        <HabitCard
                            key={habit.id}
                            habit={habit}
                            completed={habit.completed}
                            streak={habit.streak}
                            onComplete={() => toggleHabit(habit.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
