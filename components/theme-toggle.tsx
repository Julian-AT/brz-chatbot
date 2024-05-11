'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { IconMoon, IconSun } from '@/components/ui/icons'

interface ThemeToggleProps extends React.ComponentPropsWithoutRef<'button'> {}

export function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme()
  const [_, startTransition] = React.useTransition()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        startTransition(() => {
          setTheme(theme === 'light' ? 'dark' : 'light')
        })
      }}
      className={className}
    >
      {!theme ? null : theme === 'dark' ? (
        <IconMoon className="mr-3 transition-all" />
      ) : (
        <IconSun className="mr-3 transition-all" />
      )}
      <span>Theme Ändern</span>
    </Button>
  )
}
