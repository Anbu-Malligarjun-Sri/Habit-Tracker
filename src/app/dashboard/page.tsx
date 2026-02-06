/**
 * Dashboard Overview Page
 * 
 * Main dashboard with stats, habits overview, and gamification.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Progress } from "@/shared/components/ui/progress"
import { Badge } from "@/shared/components/ui/badge"
import { 
  Activity, 
  Flame, 
  Trophy, 
  TrendingUp, 
  Target,
  Sparkles,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Circle,
  Coins,
  Zap,
} from "lucide-react"
import { useHabits } from "@/shared/hooks/use-habits"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/shared/utils/utils"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// Mock data for gamification (will be replaced with tRPC)
const mockGamification = {
  xp: 1250,
  level: 12,
  levelProgress: 65,
  currentRank: { name: 'Gold', color: '#FFD700', icon: '🥇' },
  nextRank: { name: 'Platinum', xpRequired: 250 },
  currentStreak: 15,
  longestStreak: 28,
  resources: {
    gold: 350,
    elixir: 125,
  },
  recentAchievements: [
    { id: '1', name: 'Week Warrior', icon: '⚔️', unlockedAt: new Date() },
    { id: '2', name: 'Early Bird', icon: '🐦', unlockedAt: new Date(Date.now() - 86400000) },
  ],
}

export default function DashboardPage() {
  const { habits, getStats } = useHabits()
  const stats = getStats()
  
  const todayHabits = habits.slice(0, 5)
  const completedToday = habits.filter(h => h.completed).length
  const completionRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0

  return (
    <motion.div 
      className="flex flex-1 flex-col gap-6 p-4 md:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            You're on a {mockGamification.currentStreak}-day streak. Keep it up!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-950 px-3 py-1.5 rounded-full">
            <Coins className="h-4 w-4 text-amber-600" />
            <span className="font-semibold text-amber-700 dark:text-amber-400">
              {mockGamification.resources.gold}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-violet-100 dark:bg-violet-950 px-3 py-1.5 rounded-full">
            <Zap className="h-4 w-4 text-violet-600" />
            <span className="font-semibold text-violet-700 dark:text-violet-400">
              {mockGamification.resources.elixir}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* XP & Level */}
        <Card className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Level {mockGamification.level}</CardTitle>
            <Trophy className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGamification.xp.toLocaleString()} XP</div>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-white/80 mb-1">
                <span>Progress to Level {mockGamification.level + 1}</span>
                <span>{mockGamification.levelProgress}%</span>
              </div>
              <Progress value={mockGamification.levelProgress} className="h-1.5 bg-white/20" />
            </div>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className={cn(
              "h-4 w-4",
              mockGamification.currentStreak >= 7 ? "text-orange-500 fill-orange-500" : "text-muted-foreground"
            )} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockGamification.currentStreak} Days</div>
            <p className="text-xs text-muted-foreground">
              Best: {mockGamification.longestStreak} days
            </p>
          </CardContent>
        </Card>

        {/* Today's Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {completedToday} / {habits.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        {/* Rank */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
            <span className="text-lg">{mockGamification.currentRank.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: mockGamification.currentRank.color }}>
              {mockGamification.currentRank.name}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockGamification.nextRank.xpRequired} XP to {mockGamification.nextRank.name}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Today's Habits */}
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Today's Habits
                </CardTitle>
                <CardDescription>
                  {completedToday} of {habits.length} completed
                </CardDescription>
              </div>
              <Link href="/dashboard/habits">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayHabits.length > 0 ? (
                todayHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      habit.completed 
                        ? "bg-green-50 dark:bg-green-950/30" 
                        : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <span className="text-2xl">{habit.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium truncate",
                        habit.completed && "line-through text-muted-foreground"
                      )}>
                        {habit.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {habit.category} • {habit.streak} day streak
                      </p>
                    </div>
                    {habit.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300 shrink-0" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No habits yet</p>
                  <Link href="/dashboard/habits">
                    <Button variant="link" className="mt-2">
                      Create your first habit
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column */}
        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-6">
          {/* Recent Achievements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Recent Achievements
              </CardTitle>
              <Link href="/dashboard/achievements">
                <Button variant="ghost" size="sm">
                  All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockGamification.recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Unlocked recently
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    New!
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weekly Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center">
                    <span className="text-xs text-muted-foreground">{day}</span>
                    <div
                      className={cn(
                        "w-8 h-8 mx-auto mt-1 rounded-lg flex items-center justify-center text-xs font-medium",
                        i < 5 
                          ? "bg-green-500 text-white" 
                          : i === 5 
                            ? "bg-violet-500 text-white ring-2 ring-violet-300" 
                            : "bg-gray-100 dark:bg-gray-800 text-muted-foreground"
                      )}
                    >
                      {i < 5 ? '✓' : i === 5 ? '•' : '—'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weekly completion</span>
                  <span className="font-medium">83%</span>
                </div>
                <Progress value={83} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Link href="/dashboard/habits">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="mr-2 h-4 w-4" />
                  Habits
                </Button>
              </Link>
              <Link href="/dashboard/fitness">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  Fitness
                </Button>
              </Link>
              <Link href="/dashboard/journal">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Journal
                </Button>
              </Link>
              <Link href="/dashboard/finance">
                <Button variant="outline" className="w-full justify-start">
                  <Coins className="mr-2 h-4 w-4" />
                  Finance
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
