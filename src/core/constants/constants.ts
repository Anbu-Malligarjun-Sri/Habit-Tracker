/**
 * Application Constants
 * 
 * Central location for all app constants.
 */

// ============ Habit Categories ============

export const HABIT_CATEGORIES = [
  { id: 'health', name: 'Health', icon: '💪', color: '#10B981' },
  { id: 'fitness', name: 'Fitness', icon: '🏃', color: '#F59E0B' },
  { id: 'mindfulness', name: 'Mindfulness', icon: '🧘', color: '#8B5CF6' },
  { id: 'productivity', name: 'Productivity', icon: '📊', color: '#3B82F6' },
  { id: 'learning', name: 'Learning', icon: '📚', color: '#EC4899' },
  { id: 'creativity', name: 'Creativity', icon: '🎨', color: '#F97316' },
  { id: 'social', name: 'Social', icon: '👥', color: '#06B6D4' },
  { id: 'finance', name: 'Finance', icon: '💰', color: '#22C55E' },
  { id: 'sleep', name: 'Sleep', icon: '😴', color: '#6366F1' },
  { id: 'nutrition', name: 'Nutrition', icon: '🥗', color: '#84CC16' },
  { id: 'hydration', name: 'Hydration', icon: '💧', color: '#0EA5E9' },
  { id: 'other', name: 'Other', icon: '📌', color: '#64748B' },
] as const;

export type HabitCategoryId = typeof HABIT_CATEGORIES[number]['id'];

// ============ Habit Icons ============

export const HABIT_ICONS = [
  '🎯', '📚', '💪', '🧘', '🏃', '💧', '😴', '🥗', '💰', '✍️',
  '🎨', '🎵', '🧠', '💻', '📱', '🌱', '☀️', '🌙', '⭐', '🔥',
  '❤️', '🙏', '📝', '📖', '🎓', '🏋️', '🚴', '🏊', '⚽', '🎾',
  '🧹', '🍎', '🥤', '☕', '🍳', '🛏️', '🚿', '🦷', '💊', '🧴',
  '📞', '✈️', '🎮', '📺', '🎭', '🎪', '🏠', '🌳', '🐕', '🐈',
] as const;

// ============ Habit Colors ============

export const HABIT_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#64748B', '#475569', '#1E293B',
] as const;

// ============ Ranks ============

export const RANKS = [
  { id: 'unranked', name: 'Unranked', minXP: 0, color: '#9CA3AF', icon: '🌱' },
  { id: 'bronze', name: 'Bronze', minXP: 100, color: '#CD7F32', icon: '🥉' },
  { id: 'silver', name: 'Silver', minXP: 300, color: '#C0C0C0', icon: '🥈' },
  { id: 'gold', name: 'Gold', minXP: 600, color: '#FFD700', icon: '🥇' },
  { id: 'platinum', name: 'Platinum', minXP: 1000, color: '#E5E4E2', icon: '💎' },
  { id: 'diamond', name: 'Diamond', minXP: 1500, color: '#B9F2FF', icon: '💠' },
  { id: 'master', name: 'Master', minXP: 2200, color: '#9B59B6', icon: '🔮' },
  { id: 'champion', name: 'Champion', minXP: 3000, color: '#E74C3C', icon: '👑' },
  { id: 'legend', name: 'Legend', minXP: 4000, color: '#F39C12', icon: '🌟' },
] as const;

export type RankId = typeof RANKS[number]['id'];

// ============ Resources ============

export const RESOURCES = [
  { type: 'GOLD', name: 'Gold', icon: '🪙', color: '#FFD700', description: 'Primary currency for purchases' },
  { type: 'ELIXIR', name: 'Elixir', icon: '⚗️', color: '#9B59B6', description: 'Used for special boosts' },
  { type: 'DARK_MATTER', name: 'Dark Matter', icon: '🌑', color: '#4A5568', description: 'Rare currency for premium items' },
  { type: 'GEMS', name: 'Gems', icon: '💎', color: '#3B82F6', description: 'Premium currency' },
] as const;

// ============ Achievement Tiers ============

export const ACHIEVEMENT_TIERS = [
  { tier: 'BRONZE', name: 'Bronze', color: '#CD7F32', xpMultiplier: 1 },
  { tier: 'SILVER', name: 'Silver', color: '#C0C0C0', xpMultiplier: 1.5 },
  { tier: 'GOLD', name: 'Gold', color: '#FFD700', xpMultiplier: 2 },
  { tier: 'PLATINUM', name: 'Platinum', color: '#E5E4E2', xpMultiplier: 3 },
  { tier: 'DIAMOND', name: 'Diamond', color: '#B9F2FF', xpMultiplier: 5 },
] as const;

// ============ XP Rewards ============

export const XP_REWARDS = {
  HABIT_COMPLETE_EASY: 5,
  HABIT_COMPLETE_MEDIUM: 10,
  HABIT_COMPLETE_HARD: 15,
  HABIT_COMPLETE_EXTREME: 25,
  STREAK_BONUS_7: 50,
  STREAK_BONUS_30: 200,
  STREAK_BONUS_100: 1000,
  ACHIEVEMENT_BRONZE: 25,
  ACHIEVEMENT_SILVER: 50,
  ACHIEVEMENT_GOLD: 100,
  ACHIEVEMENT_PLATINUM: 250,
  ACHIEVEMENT_DIAMOND: 500,
  DAILY_LOGIN: 5,
  JOURNAL_ENTRY: 10,
  WORKOUT_LOGGED: 15,
} as const;

// ============ Difficulty Levels ============

export const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Very Easy', xpMultiplier: 0.5, color: '#22C55E' },
  { value: 2, label: 'Easy', xpMultiplier: 0.75, color: '#84CC16' },
  { value: 3, label: 'Medium', xpMultiplier: 1, color: '#F59E0B' },
  { value: 4, label: 'Hard', xpMultiplier: 1.5, color: '#F97316' },
  { value: 5, label: 'Extreme', xpMultiplier: 2, color: '#EF4444' },
] as const;

// ============ Frequency Types ============

export const FREQUENCY_TYPES = [
  { value: 'DAILY', label: 'Daily', description: 'Every day' },
  { value: 'WEEKLY', label: 'Weekly', description: 'Once per week' },
  { value: 'SPECIFIC_DAYS', label: 'Specific Days', description: 'Specific days of the week' },
  { value: 'X_TIMES_WEEK', label: 'X Times/Week', description: 'X times per week' },
  { value: 'X_TIMES_MONTH', label: 'X Times/Month', description: 'X times per month' },
] as const;

// ============ Target Types ============

export const TARGET_TYPES = [
  { value: 'BOOLEAN', label: 'Yes/No', description: 'Simple completion' },
  { value: 'QUANTITY', label: 'Quantity', description: 'Track a number (e.g., 8 glasses of water)' },
  { value: 'DURATION', label: 'Duration', description: 'Track time (e.g., 30 minutes)' },
  { value: 'DISTANCE', label: 'Distance', description: 'Track distance (e.g., 5 km)' },
] as const;

// ============ Days of Week ============

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun', letter: 'S' },
  { value: 1, label: 'Monday', short: 'Mon', letter: 'M' },
  { value: 2, label: 'Tuesday', short: 'Tue', letter: 'T' },
  { value: 3, label: 'Wednesday', short: 'Wed', letter: 'W' },
  { value: 4, label: 'Thursday', short: 'Thu', letter: 'T' },
  { value: 5, label: 'Friday', short: 'Fri', letter: 'F' },
  { value: 6, label: 'Saturday', short: 'Sat', letter: 'S' },
] as const;

// ============ Finance Categories ============

export const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: '🍽️', color: '#F97316' },
  { id: 'transportation', name: 'Transportation', icon: '🚗', color: '#3B82F6' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: '#EAB308' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#EC4899' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#8B5CF6' },
  { id: 'health', name: 'Health', icon: '🏥', color: '#10B981' },
  { id: 'education', name: 'Education', icon: '📚', color: '#06B6D4' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#F43F5E' },
  { id: 'subscriptions', name: 'Subscriptions', icon: '📱', color: '#6366F1' },
  { id: 'other', name: 'Other', icon: '📦', color: '#64748B' },
] as const;

export const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary', icon: '💼', color: '#22C55E' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#3B82F6' },
  { id: 'investments', name: 'Investments', icon: '📈', color: '#8B5CF6' },
  { id: 'gifts', name: 'Gifts', icon: '🎁', color: '#EC4899' },
  { id: 'refunds', name: 'Refunds', icon: '↩️', color: '#F59E0B' },
  { id: 'other', name: 'Other', icon: '💰', color: '#64748B' },
] as const;

// ============ Mood Levels ============

export const MOOD_LEVELS = [
  { value: 1, label: 'Terrible', emoji: '😢', color: '#EF4444' },
  { value: 2, label: 'Bad', emoji: '😔', color: '#F97316' },
  { value: 3, label: 'Okay', emoji: '😐', color: '#EAB308' },
  { value: 4, label: 'Good', emoji: '🙂', color: '#84CC16' },
  { value: 5, label: 'Great', emoji: '😄', color: '#22C55E' },
] as const;

// ============ Workout Types ============

export const WORKOUT_TYPES = [
  { value: 'STRENGTH', label: 'Strength', icon: '🏋️', color: '#EF4444' },
  { value: 'CARDIO', label: 'Cardio', icon: '🏃', color: '#F97316' },
  { value: 'FLEXIBILITY', label: 'Flexibility', icon: '🧘', color: '#8B5CF6' },
  { value: 'SPORTS', label: 'Sports', icon: '⚽', color: '#3B82F6' },
  { value: 'OTHER', label: 'Other', icon: '🎯', color: '#64748B' },
] as const;

// ============ Date Formats ============

export const DATE_FORMATS = {
  SHORT: 'MMM d',
  MEDIUM: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  FULL: 'EEEE, MMMM d, yyyy',
  TIME: 'h:mm a',
  DATETIME: 'MMM d, yyyy h:mm a',
  ISO: 'yyyy-MM-dd',
} as const;

// ============ Animation Variants ============

export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
} as const;
