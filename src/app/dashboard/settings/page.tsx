/**
 * Settings Page
 * 
 * User settings and preferences management.
 */

'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Palette,
  Shield,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Monitor,
  Save,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/shared/utils/utils';

// Settings sections
const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
] as const;

type SettingsSection = typeof settingsSections[number]['id'];

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // Profile
    displayName: '',
    bio: '',
    
    // Appearance
    theme: 'system' as 'light' | 'dark' | 'system',
    accentColor: 'violet',
    weekStartsOn: 0,
    defaultHabitView: 'grid' as 'grid' | 'list' | 'calendar',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    dailyReminder: true,
    dailyReminderTime: '09:00',
    weeklyReport: true,
    achievementAlerts: true,
    
    // Privacy
    profilePublic: false,
    showOnLeaderboard: true,
    shareProgress: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Save settings via tRPC
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <nav className="lg:w-56 shrink-0">
          <ul className="space-y-1">
            {settingsSections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    activeSection === section.id
                      ? 'bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-100'
                      : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile details and public information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                        {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || '?'}
                      </div>
                      <Badge className="absolute -bottom-1 -right-1 text-xs">
                        Pro
                      </Badge>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        Change Avatar
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG or GIF. Max 2MB.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Name */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        defaultValue={user?.firstName || ''}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        defaultValue={user?.lastName || ''}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                        @
                      </span>
                      <Input
                        id="username"
                        defaultValue={user?.username || ''}
                        placeholder="johndoe"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      rows={3}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about yourself..."
                      value={settings.bio}
                      onChange={(e) => updateSetting('bio', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Brief description for your profile. Max 160 characters.
                    </p>
                  </div>

                  {/* Email (read-only) */}
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={user?.emailAddresses[0]?.emailAddress || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email is managed through your Clerk account
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how HabitQuest looks and feels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme */}
                  <div className="space-y-3">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Monitor },
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => updateSetting('theme', value as 'light' | 'dark' | 'system')}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                            settings.theme === value
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-950'
                              : 'border-transparent bg-gray-50 dark:bg-gray-900 hover:border-gray-300'
                          )}
                        >
                          <Icon className={cn(
                            'h-5 w-5',
                            settings.theme === value ? 'text-violet-600' : 'text-muted-foreground'
                          )} />
                          <span className={cn(
                            'text-sm font-medium',
                            settings.theme === value ? 'text-violet-900 dark:text-violet-100' : ''
                          )}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Accent Color */}
                  <div className="space-y-3">
                    <Label>Accent Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'violet', color: 'bg-violet-500' },
                        { value: 'blue', color: 'bg-blue-500' },
                        { value: 'green', color: 'bg-green-500' },
                        { value: 'orange', color: 'bg-orange-500' },
                        { value: 'pink', color: 'bg-pink-500' },
                        { value: 'red', color: 'bg-red-500' },
                      ].map(({ value, color }) => (
                        <button
                          key={value}
                          onClick={() => updateSetting('accentColor', value)}
                          className={cn(
                            'w-8 h-8 rounded-full transition-all',
                            color,
                            settings.accentColor === value
                              ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white'
                              : 'hover:scale-110'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Week Start */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Week Starts On</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose which day your week begins
                      </p>
                    </div>
                    <Select
                      value={String(settings.weekStartsOn)}
                      onValueChange={(v) => updateSetting('weekStartsOn', parseInt(v))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Default View */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Default Habit View</Label>
                      <p className="text-sm text-muted-foreground">
                        How habits are displayed by default
                      </p>
                    </div>
                    <Select
                      value={settings.defaultHabitView}
                      onValueChange={(v) => updateSetting('defaultHabitView', v as 'grid' | 'list' | 'calendar')}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid</SelectItem>
                        <SelectItem value="list">List</SelectItem>
                        <SelectItem value="calendar">Calendar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Configure how and when you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(v) => updateSetting('emailNotifications', v)}
                    />
                  </div>

                  <Separator />

                  {/* Push Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications on your device
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(v) => updateSetting('pushNotifications', v)}
                    />
                  </div>

                  <Separator />

                  {/* Daily Reminder */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Daily Reminder</Label>
                        <p className="text-sm text-muted-foreground">
                          Get reminded to check your habits
                        </p>
                      </div>
                      <Switch
                        checked={settings.dailyReminder}
                        onCheckedChange={(v) => updateSetting('dailyReminder', v)}
                      />
                    </div>
                    {settings.dailyReminder && (
                      <div className="ml-6">
                        <Label htmlFor="reminderTime" className="text-sm">
                          Reminder Time
                        </Label>
                        <Input
                          id="reminderTime"
                          type="time"
                          value={settings.dailyReminderTime}
                          onChange={(e) => updateSetting('dailyReminderTime', e.target.value)}
                          className="w-32 mt-1"
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Weekly Report */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Progress Report</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a summary of your weekly progress
                      </p>
                    </div>
                    <Switch
                      checked={settings.weeklyReport}
                      onCheckedChange={(v) => updateSetting('weeklyReport', v)}
                    />
                  </div>

                  {/* Achievement Alerts */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Achievement Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you unlock achievements
                      </p>
                    </div>
                    <Switch
                      checked={settings.achievementAlerts}
                      onCheckedChange={(v) => updateSetting('achievementAlerts', v)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Privacy Section */}
          {activeSection === 'privacy' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>
                    Manage your privacy settings and data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Visibility */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to view your profile
                      </p>
                    </div>
                    <Switch
                      checked={settings.profilePublic}
                      onCheckedChange={(v) => updateSetting('profilePublic', v)}
                    />
                  </div>

                  <Separator />

                  {/* Leaderboard */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show on Leaderboard</Label>
                      <p className="text-sm text-muted-foreground">
                        Appear on public leaderboards
                      </p>
                    </div>
                    <Switch
                      checked={settings.showOnLeaderboard}
                      onCheckedChange={(v) => updateSetting('showOnLeaderboard', v)}
                    />
                  </div>

                  <Separator />

                  {/* Share Progress */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Share Progress</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow friends to see your progress
                      </p>
                    </div>
                    <Switch
                      checked={settings.shareProgress}
                      onCheckedChange={(v) => updateSetting('shareProgress', v)}
                    />
                  </div>

                  <Separator />

                  {/* Danger Zone */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-red-600 dark:text-red-400">
                      Danger Zone
                    </h4>
                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-950/50">
                      <div className="space-y-0.5">
                        <p className="font-medium text-red-900 dark:text-red-100">
                          Delete Account
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
