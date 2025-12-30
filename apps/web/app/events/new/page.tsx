'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEvent } from '@/lib/api'
import { useTelegram } from '@/app/providers/telegram-provider'

export default function CreateEventPage() {
  const router = useRouter()
  const { initData } = useTelegram()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImageUrl: '',
    startDate: '',
    endDate: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    location: '',
    locationType: 'ONLINE' as 'ONLINE' | 'IN_PERSON' | 'HYBRID',
    onlineLink: '',
    capacity: '',
    priceType: 'FREE' as 'FREE' | 'PAID',
    priceAmount: '',
    priceCurrency: 'USD',
    isPublic: true,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // Authenticate if needed
      if (initData && !localStorage.getItem('auth_token')) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        })
        const data = await response.json()
        if (data.token) {
          localStorage.setItem('auth_token', data.token)
        }
      }

      const event = await createEvent({
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        priceAmount: formData.priceAmount ? parseFloat(formData.priceAmount) : undefined,
      })

      router.push(`/host/events/${event.id}`)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text mb-8">Create Event</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Cover Image URL
            </label>
            <input
              type="url"
              value={formData.coverImageUrl}
              onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Timezone
            </label>
            <input
              type="text"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Location Type
            </label>
            <select
              value={formData.locationType}
              onChange={(e) =>
                setFormData({ ...formData, locationType: e.target.value as any })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
            >
              <option value="ONLINE">Online</option>
              <option value="IN_PERSON">In Person</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          {formData.locationType !== 'ONLINE' && (
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
              />
            </div>
          )}

          {formData.locationType !== 'IN_PERSON' && (
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Online Link
              </label>
              <input
                type="url"
                value={formData.onlineLink}
                onChange={(e) => setFormData({ ...formData, onlineLink: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Capacity
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Price Type
            </label>
            <select
              value={formData.priceType}
              onChange={(e) => setFormData({ ...formData, priceType: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
            >
              <option value="FREE">Free</option>
              <option value="PAID">Paid</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-button text-buttonText rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  )
}

