'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { getEvent, checkIn, Event } from '@/lib/api'
import { useTelegram } from '@/app/providers/telegram-provider'

export default function CheckInPage() {
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<Event | null>(null)
  const [scanning, setScanning] = useState(false)
  const [lastCheckIn, setLastCheckIn] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { initData, isReady } = useTelegram()

  useEffect(() => {
    if (isReady && eventId) {
      authenticate()
      loadEvent()
    }
  }, [isReady, eventId])

  async function authenticate() {
    if (initData && !localStorage.getItem('auth_token')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        })
        const data = await response.json()
        if (data.token) {
          localStorage.setItem('auth_token', data.token)
        }
      } catch (error) {
        console.error('Auth failed:', error)
      }
    }
  }

  async function loadEvent() {
    try {
      const data = await getEvent(eventId)
      setEvent(data)
    } catch (error) {
      console.error('Failed to load event:', error)
    }
  }

  function handleManualInput() {
    const rsvpId = prompt('Enter RSVP ID:')
    if (rsvpId) {
      handleCheckIn(rsvpId)
    }
  }

  async function handleCheckIn(rsvpId: string) {
    try {
      const result = await checkIn(eventId, rsvpId)
      setLastCheckIn(result)
      // Haptic feedback
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        ;(window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success')
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to check in')
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        ;(window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('error')
      }
    }
  }

  function handleQRScan() {
    // Simple QR code scanner using camera
    // In production, use a library like html5-qrcode or jsQR
    setScanning(true)
    alert('QR scanner would open here. For now, use manual input.')
    setScanning(false)
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-hint">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text mb-2">Check-In Scanner</h1>
        <p className="text-hint mb-8">{event.title}</p>

        <div className="bg-secondaryBg rounded-xl p-6 mb-6">
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleQRScan}
              disabled={scanning}
              className="flex-1 px-6 py-3 bg-button text-buttonText rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {scanning ? 'Scanning...' : 'Scan QR Code'}
            </button>
            <button
              onClick={handleManualInput}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-secondaryBg transition-colors"
            >
              Manual Input
            </button>
          </div>

          {scanning && (
            <div className="mt-4">
              <video ref={videoRef} className="w-full rounded-lg" autoPlay playsInline />
              <p className="text-center text-hint mt-2">Point camera at QR code</p>
            </div>
          )}
        </div>

        {lastCheckIn && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-green-800 mb-2">✅ Checked In!</h2>
            <div className="text-green-700">
              <p>
                <strong>Name:</strong>{' '}
                {lastCheckIn.rsvp?.name ||
                  `${lastCheckIn.rsvp?.user?.firstName || ''} ${lastCheckIn.rsvp?.user?.lastName || ''}`.trim()}
              </p>
              <p>
                <strong>Guests:</strong> {lastCheckIn.rsvp?.guestCount}
              </p>
              <p className="text-sm text-green-600 mt-2">
                Checked in at {new Date(lastCheckIn.checkedInAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

