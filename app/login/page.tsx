import { auth } from '@/auth'
import LoginForm from '@/components/auth/login-form'
import { Session } from '@/types'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = (await auth()) as Session

  if (session) {
    redirect('/')
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden">
      <LoginForm />
    </main>
  )
}
