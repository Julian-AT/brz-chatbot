import * as React from 'react'
import { SidebarList } from '@/components/sidebar-list'

export async function ChatHistory() {
  return (
    <div className="flex flex-col h-full bg-background">
      <React.Suspense
        fallback={
          <div className="flex flex-col flex-1 px-4 space-y-4 overflow-auto">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-6 rounded-xl shrink-0 animate-pulse bg-background-secondary"
              />
            ))}
          </div>
        }
      >
        {/* @ts-ignore */}
        <SidebarList />
      </React.Suspense>
    </div>
  )
}
