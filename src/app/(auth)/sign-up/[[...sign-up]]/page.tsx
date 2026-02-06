/**
 * Sign Up Page
 * 
 * Clerk-powered sign-up page with custom styling.
 */

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: 'w-full',
          card: 'w-full shadow-none bg-transparent',
          headerTitle: 'text-xl font-semibold text-gray-900 dark:text-white',
          headerSubtitle: 'text-sm text-muted-foreground',
          socialButtonsBlockButton: 
            'border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800',
          socialButtonsBlockButtonText: 'font-medium',
          dividerLine: 'bg-gray-200 dark:bg-gray-700',
          dividerText: 'text-muted-foreground',
          formFieldLabel: 'text-sm font-medium text-gray-700 dark:text-gray-300',
          formFieldInput: 
            'rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-violet-500 focus:border-violet-500',
          formButtonPrimary: 
            'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium rounded-lg',
          footerActionLink: 'text-violet-600 hover:text-violet-700 dark:text-violet-400',
        },
        layout: {
          socialButtonsPlacement: 'top',
          socialButtonsVariant: 'blockButton',
        },
      }}
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      fallbackRedirectUrl="/dashboard"
    />
  );
}
