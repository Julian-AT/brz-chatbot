'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useSettings } from '@/lib/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './ui/form'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Switch } from './ui/switch'

const SettingsDialogSchema = z.object({
  model_uri: z.string().url({ message: 'Bitte gib eine valide URL an.' }),
  model_name: z.string().min(1, 'Bitte gib einen validen Namen an.'),
  bottom_glow: z.boolean()
})

type SettingsDialogValues = z.infer<typeof SettingsDialogSchema>

export interface SettingsDialogProps extends React.ComponentProps<'div'> {}

export function SettingsDialog({ className, children }: SettingsDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const { settings, setSetting } = useSettings()

  const form = useForm<SettingsDialogValues>({
    resolver: zodResolver(SettingsDialogSchema),
    defaultValues: settings,
    mode: 'onChange'
  })

  function onSubmit(data: SettingsDialogValues) {
    setSetting('model_uri', data.model_uri)
    setSetting('model_name', data.model_name)
    setSetting('bottom_glow', data.bottom_glow)
    toast({
      title: 'Einstellungen gespeichert',
      description: 'Deine Einstellungen wurden gespeichert.'
    })
    setOpen(false)
  }

  return (
    <Dialog {...form} open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl rounded-lg">
        <DialogHeader>
          <DialogTitle>Einstellungen</DialogTitle>
          <DialogDescription>
            Hier kannst du deine Einstellungen bearbeiten.
          </DialogDescription>
        </DialogHeader>
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
            <Button type="submit" className="right-0 border">
              Änderungen Speichern
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
