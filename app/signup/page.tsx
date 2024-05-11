import { auth } from '@/auth'
import SignupForm from '@/components/auth/signup-form'
import { Session } from '@/types'
import { redirect } from 'next/navigation'

export default async function SignupPage() {
  const session = (await auth()) as Session

  if (session) {
    redirect('/')
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden">
      <SignupForm />
    </main>
  )
}
