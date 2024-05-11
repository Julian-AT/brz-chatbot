'use client'

import { useFormState } from 'react-dom'
import { authenticate } from '@/app/login/actions'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn, getMessageFromCode } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { IconSpinner } from '@/components/ui/icons'
import BRZLogo from '@/public/logo-brz.png'
import Image from 'next/image'
import { Button, buttonVariants } from '@/components/ui/button'
import { FooterText } from '@/components/footer'

export default function LoginForm() {
  const router = useRouter()
  const [result, dispatch] = useFormState(authenticate, undefined)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (result) {
      if (result.type === 'error') {
        toast.error(getMessageFromCode(result.resultCode))
      } else {
        toast.success(getMessageFromCode(result.resultCode))
        router.refresh()
      }
    }

    setIsLoading(false)
  }, [result, router])

  return (
    <main className="flex flex-col items-center justify-center w-full h-full px-4 overflow-hidden">
      <div className="w-full max-w-sm text-muted-foreground">
        <div className="text-center">
          <Image
            src={BRZLogo}
            width={100}
            height={100}
            alt="BRZ Logo"
            className="mx-auto"
          />
          <div className="mt-5 space-y-2">
            <h3 className="text-2xl font-bold text-secondary-foreground sm:text-3xl"></h3>
            <p className="">
              Noch keinen Account?{' '}
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ variant: 'link' }),
                  'text-secondary-foreground px-0'
                )}
              >
                Registrieren
              </Link>
            </p>
          </div>
        </div>
        <form
          action={data => {
            setIsLoading(true)
            return dispatch(data)
          }}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="font-medium">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 mt-2 bg-transparent border rounded-lg shadow-sm outline-none text-muted-foreground focus:border-primary"
            />
          </div>
          <div>
            <label className="font-medium">Passwort</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 mt-2 bg-transparent border rounded-lg shadow-sm outline-none text-muted-foreground focus:border-primary"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-10">
            {isLoading && <IconSpinner className="w-5 h-5 mr-2 animate-spin" />}
            Anmelden
          </Button>
        </form>
      </div>
      <FooterText className="absolute text-center bottom-3 mx-center" />
    </main>
  )
}
