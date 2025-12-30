'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getEvent, createRSVP, Event, EventQuestion } from '@/lib/api'
import { useTelegram } from '@/app/providers/telegram-provider'

export default function RSVPPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guestCount: 1,
    consentGiven: false,
    answers: {} as Record<string, string>,
  })
  const { initData, isReady } = useTelegram()

  useEffect(() => {
    if (isReady && slug) {
      loadEvent()
      authenticate()
    }
  }, [isReady, slug])

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
      const data = await getEvent(slug)
      setEvent(data)
    } catch (error) {
      console.error('Failed to load event:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const answers = event?.questions
        ?.filter((q) => formData.answers[q.id])
        .map((q) => ({
          questionId: q.id,
          answer: formData.answers[q.id],
        }))

      const rsvp = await createRSVP(event!.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        guestCount: formData.guestCount,
        consentGiven: formData.consentGiven,
        answers,
      })

      router.push(`/e/${slug}/confirm?rsvpId=${rsvp.id}`)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to RSVP')
    } finally {
      setLoading(false)
    }
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-hint">Loading...</p>
      </div>
    )
  }

  const confirmedCount = event._count?.rsvps || 0
  const isFull = event.capacity && confirmedCount >= event.capacity

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text mb-2">RSVP to {event.title}</h1>
        {isFull && (
          <p className="text-orange-600 mb-6">
            This event is full. You'll be added to the waitlist.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Number of Guests (including you)
            </label>
            <input
              type="number"
              min="1"
              value={formData.guestCount}
              onChange={(e) =>
                setFormData({ ...formData, guestCount: parseInt(e.target.value) || 1 })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
            />
          </div>

          {event.questions && event.questions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-text">Additional Questions</h2>
              {event.questions.map((question) => (
                <div key={question.id}>
                  <label className="block text-sm font-medium text-text mb-2">
                    {question.question}
                    {question.isRequired && <span className="text-red-500"> *</span>}
                  </label>
                  {question.type === 'SELECT' || question.type === 'MULTIPLE_CHOICE' ? (
                    <select
                      required={question.isRequired}
                      value={formData.answers[question.id] || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          answers: { ...formData.answers, [question.id]: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
                    >
                      <option value="">Select an option</option>
                      {question.options &&
                        JSON.parse(question.options).map((opt: string) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type={question.type === 'EMAIL' ? 'email' : question.type === 'PHONE' ? 'tel' : question.type === 'NUMBER' ? 'number' : 'text'}
                      required={question.isRequired}
                      value={formData.answers[question.id] || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          answers: { ...formData.answers, [question.id]: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-background text-text"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-start">
            <input
              type="checkbox"
              id="consent"
              checked={formData.consentGiven}
              onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
              className="mt-1 mr-2"
            />
            <label htmlFor="consent" className="text-sm text-text">
              I consent to receive event updates and notifications
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-button text-buttonText rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Submitting...' : isFull ? 'Join Waitlist' : 'Confirm RSVP'}
          </button>
        </form>
      </div>
    </div>
  )
}

