import { format, formatInTimeZone } from 'date-fns-tz'
import { formatDistanceToNow } from 'date-fns'

export function formatEventDate(date: string, timezone: string = 'UTC'): string {
  try {
    return formatInTimeZone(new Date(date), timezone, 'EEE, MMM d, yyyy • h:mm a zzz')
  } catch {
    return format(new Date(date), 'EEE, MMM d, yyyy • h:mm a')
  }
}

export function formatDateShort(date: string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatTime(date: string): string {
  return format(new Date(date), 'h:mm a')
}

export function getRelativeTime(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 100)
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  // Fallback
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
  return Promise.resolve()
}

export function shareTelegram(text: string, url: string) {
  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'your_bot'
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  window.open(telegramUrl, '_blank')
}

