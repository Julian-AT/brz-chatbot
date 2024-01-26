'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { useState, useTransition } from 'react'
import Balancer from 'react-wrap-balancer'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'

interface ClearHistoryProps {
  children: React.ReactNode
}

export function ImprintDialog({ children }: ClearHistoryProps) {
  const [open, setOpen] = useState(false)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="flex flex-col overflow-hidden h-2/3 2xl:h-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Impressum</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="flex-grow overflow-hidden">
          <ScrollArea className="flex flex-col h-full pr-2 gap-y-3">
            <div className="flex flex-col gap-1 my-5">
              <span className="mb-3">
                <b>Verantwortlich für das Projekt:</b>
                <br /> Autor: Julian Schmidt
                <br /> Mail: 200318@studierende.htl-donaustadt.at
              </span>
              <span className="text-lg text-secondary-foreground">
                Rechtlicher Hinweis
              </span>
              <Balancer>
                Der vorliegende Chatbot ist ein unabhängiges Demo-Projekt und
                steht in keiner Verbindung zum Bundesrechenzentrum (BRZ) oder zu
                anderen staatlichen Einrichtungen.
              </Balancer>
            </div>
            <div className="flex flex-col gap-1 my-5">
              <span className="text-lg text-secondary-foreground">
                Informationsgrundlage
              </span>
              <Balancer>
                Alle im Chatbot verwendeten Daten stammen von der offiziellen
                Website des{' '}
                <Button
                  variant={'link'}
                  size={'sm'}
                  className="h-5 p-0 font-normal text-secondary-foreground"
                >
                  <Link href={'https://brz.gv.at/'}>Bundesrechenzentrums</Link>
                </Button>{' '}
                sowie der{' '}
                <Button
                  variant={'link'}
                  size={'sm'}
                  className="h-5 p-0 font-normal text-secondary-foreground"
                >
                  <Link href={'https://www.brz-jobs.at/Jobs'}>
                    BRZ-Jobs-Website
                  </Link>
                </Button>
                . Diese Daten dienen als Grundlage für die bereitgestellten
                Informationen und Funktionen des Chatbots.
              </Balancer>
            </div>
            <div className="flex flex-col gap-1 my-5">
              <span className="text-lg text-secondary-foreground">
                Quellcode & Lizenz
              </span>
              <Balancer>
                Das Projekt ist als Open Source unter der MIT-Lizenz
                veröffentlicht. Dies ermöglicht die freie Einsichtnahme,
                Nutzung, Modifikation und Weiterverbreitung des Quellcodes.
                Details zur MIT-Lizenz sowie der Quellcode sind auf{' '}
                <Button
                  variant={'link'}
                  size={'sm'}
                  className="h-5 p-0 font-normal text-secondary-foreground"
                >
                  <Link href={'https://github.com/Julian-AT/brz-chatbot'}>
                    GitHub
                  </Link>
                </Button>{' '}
                verfügbar.
              </Balancer>
            </div>
            <div className="flex flex-col gap-1 my-5">
              <span className="text-lg text-secondary-foreground">
                Datenschutz
              </span>
              <Balancer>
                Die Nutzung des Chatbots erfolgt ohne Angabe personenbezogener
                Daten. Eine Erhebung personenbezogener Daten, sofern sie
                stattfindet, erfolgt auf freiwilliger Basis und ohne Weitergabe
                an Dritte ohne ausdrückliche Zustimmung.
              </Balancer>
            </div>
          </ScrollArea>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogAction>Schließen</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
