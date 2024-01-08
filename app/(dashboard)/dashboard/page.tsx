'use client'

import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import { Switch } from '@/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useSettings } from '@/lib/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const SettingsDialogSchema = z.object({
  model_uri: z.string().url({ message: 'Bitte gib eine valide URL an.' }),
  model_name: z.string().min(1, 'Bitte gib einen validen Namen an.'),
  bottom_glow: z.boolean()
})

type SettingsDialogValues = z.infer<typeof SettingsDialogSchema>

export interface SettingsDialogProps extends React.ComponentProps<'div'> {}

export default function DashboardPage() {
  const { toast } = useToast()
  const { settings, setSetting } = useSettings()

  const form = useForm<SettingsDialogValues>({
    resolver: zodResolver(SettingsDialogSchema),
    defaultValues: settings,
    mode: 'onChange'
  })

  function onSubmit(data: SettingsDialogValues) {
    toast({
      title: 'Einstellungen gespeichert'
    })
    setSetting('model_uri', data.model_uri)
    setSetting('model_name', data.model_name)
    setSetting('bottom_glow', data.bottom_glow)
    toast({
      title: 'Einstellungen gespeichert',
      description: 'Deine Einstellungen wurden gespeichert.'
    })
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Einstellungen"
        text="Einstellungen des Chatbots"
      ></DashboardHeader>
      <div className="px-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="model_uri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Server URL</FormLabel>
                  <FormDescription>
                    Die (BASE-)URL des LocalAI Servers. Auch kompatible mit der
                    OpenAI API
                    <br />
                    Diese URL endet normalerweise mit /v1/.
                  </FormDescription>
                  <FormControl>
                    <Input placeholder={settings.model_uri} {...field} />
                  </FormControl>
                  <FormDescription>
                    <i>
                      Azure Container in Arbeit. Solange OpenAI API als
                      Standardwert gesetzt
                    </i>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modell Name</FormLabel>
                  <FormDescription>
                    Der Name des Modells, welches du verwenden möchtest.
                  </FormDescription>
                  <FormControl>
                    <Input placeholder={settings.model_name} {...field} />
                  </FormControl>
                  <FormDescription>
                    <i>
                      Falls du OpenAI als Provider nutzt, siehe hier die Liste
                      alle verfügbaren Modelle:
                      <br />
                      https://platform.openai.com/docs/models <br />
                    </i>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bottom_glow"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Glow Effekt</FormLabel>
                    <FormDescription>
                      Der Glow Effekt am unteren Rand des Chatfensters.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="text-sm text-muted-foreground">
              Notiz: Du brauchst keinen eigenen OpenAI API Key, falls du OpenAI
              als Provider nutzt.
            </div>
            <Button
              type="submit"
              className="right-0 border"
              disabled={form.control._formValues === settings}
            >
              Änderungen Speichern
            </Button>
          </form>
        </Form>
      </div>
    </DashboardShell>
  )
}
