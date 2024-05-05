'use client'

import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import * as z from 'zod'

const SettingsDialogSchema = z.object({
  model_uri: z.string().url({ message: 'Bitte gib eine valide URL an.' }),
  model_name: z.string().min(1, 'Bitte gib einen validen Namen an.'),
  bottom_glow: z.boolean()
})

export interface SettingsDialogProps extends React.ComponentProps<'div'> {}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Einstellungen"
        text="Einstellungen des Chatbots"
      ></DashboardHeader>
      <div className="px-2">WIP</div>
    </DashboardShell>
  )
}
