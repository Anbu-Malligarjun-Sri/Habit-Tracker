"use client"

import { Check, Flame, Trophy } from "lucide-react"
import { cn } from "@/shared/utils/utils"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { LegacyHabit } from "@/core/types"

interface HabitCardProps {
    habit: LegacyHabit
    completed?: boolean
    streak?: number
    onComplete?: () => void
}

export function HabitCard({ habit, completed = false, streak = 0, onComplete }: HabitCardProps) {
    return (
        <Card className={cn("w-full transition-all hover:shadow-md", completed && "opacity-75 bg-muted/50")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{habit.icon}</span>
                    <CardTitle className="text-base font-semibold">{habit.name}</CardTitle>
                </div>
                <Badge variant={completed ? "secondary" : "default"} className={cn(
                    "transition-colors",
                    completed ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400" : ""
                )}>
                    {completed ? "Done" : "To Do"}
                </Badge>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {habit.description || "No description provided."}
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm font-medium">
                    <div className="flex items-center gap-1 text-orange-500">
                        <Flame className="h-4 w-4 fill-orange-500" />
                        <span>{streak} day streak</span>
                    </div>
                    {habit.difficulty > 3 && (
                        <div className="flex items-center gap-1 text-purple-500">
                            <Trophy className="h-4 w-4" />
                            <span>High XP</span>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full gap-2"
                    variant={completed ? "outline" : "default"}
                    onClick={onComplete}
                    disabled={completed}
                >
                    {completed ? (
                        <>
                            <Check className="h-4 w-4" /> Completed
                        </>
                    ) : (
                        "Mark Complete"
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
