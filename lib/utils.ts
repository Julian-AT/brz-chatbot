import { clsx, type ClassValue } from 'clsx'
import moment from 'moment'
import { customAlphabet } from 'nanoid'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
) // 7-character random string

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init)

  if (!res.ok) {
    const json = await res.json()
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number
      }
      error.status = res.status
      throw error
    } else {
      throw new Error('An unexpected error occurred')
    }
  }

  return res.json()
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString('de', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)

export const runAsyncFnWithoutBlocking = (
  fn: (...args: any) => Promise<any>
) => {
  fn()
}

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

export const getStringFromBuffer = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

export enum ResultCode {
  InvalidCredentials = 'INVALID_CREDENTIALS',
  InvalidSubmission = 'INVALID_SUBMISSION',
  UserAlreadyExists = 'USER_ALREADY_EXISTS',
  UnknownError = 'UNKNOWN_ERROR',
  UserCreated = 'USER_CREATED',
  UserLoggedIn = 'USER_LOGGED_IN'
}

export const getMessageFromCode = (resultCode: string) => {
  switch (resultCode) {
    case ResultCode.InvalidCredentials:
      return 'Ungültige Anmeldedaten, bitte versuche es erneut!'
    case ResultCode.InvalidSubmission:
      return 'Ungültige Eingabe, bitte versuche es erneut!'
    case ResultCode.UserAlreadyExists:
      return 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.'
    case ResultCode.UserCreated:
      return 'Benutzer erstellt, Willkommen!'
    case ResultCode.UnknownError:
      return 'Ein unbekannter Fehler ist aufgetreten! Bitte versuche es erneut.'
    case ResultCode.UserLoggedIn:
      return 'Erfolgreich angemeldet!'
  }
}

export function abbreviateNumber(num: number): string {
  const abbreviations = ['', 'k', 'm', 'b', 't']
  const numAbs = Math.abs(num)
  const abbreviatedNum =
    numAbs > 999 ? abbreviations[Math.floor(Math.log10(numAbs) / 3)] : ''
  return (
    Math.round(num / Math.pow(10, Math.floor(Math.log10(numAbs) - 1))) +
    abbreviatedNum
  )
}

const dateFromNow = (date: Date) => {
  const fromNow = moment(date).fromNow()

  return moment(date).calendar(null, {
    lastWeek: '[Letzte] dddd',
    lastDay: '[Gestern um] HH:mm [Uhr]',
    sameDay: '[Heute um] HH:mm [Uhr]',
    nextDay: '[Morgen um] HH:mm [Uhr]',
    nextWeek: 'dddd',
    sameElse: function () {
      return '[' + fromNow + ']'
    }
  })
}
