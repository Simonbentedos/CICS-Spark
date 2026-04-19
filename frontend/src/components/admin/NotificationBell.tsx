'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { getNotifications, markAllRead, markOneRead, createTestNotification, type ApiNotification } from '@/lib/api/notifications'

type Props = {
  /** Accent color for the badge and mark-all button */
  accentColor?: string
}

export default function NotificationBell({ accentColor = '#800000' }: Props) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<ApiNotification[]>([])
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  // Fetch notifications on mount and refresh every 30 seconds
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const data = await getNotifications()
        setNotifications(data)
      } catch {
        setNotifications([])
      }
    }

    // Initial fetch
    fetchNotifications()

    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [])

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Refresh when opening the panel
  useEffect(() => {
    if (!open) return
    setLoading(true)
    getNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [open])

  async function handleMarkAllRead() {
    try {
      await markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch { /* ignore */ }
  }

  async function handleMarkOne(id: string) {
    try {
      await markOneRead(id)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
    } catch { /* ignore */ }
  }

  async function handleCreateTest() {
    try {
      await createTestNotification()
      // Refresh notifications
      const updated = await getNotifications()
      setNotifications(updated)
    } catch (err) {
      console.error('Failed to create test notification:', err)
    }
  }

  function formatTime(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    const diffDay = Math.floor(diffHr / 24)
    if (diffDay < 7) return `${diffDay}d ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-grey-500 hover:bg-grey-100 focus-visible:outline-none focus-visible:ring-2"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold text-white"
            style={{ backgroundColor: accentColor }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-[340px] rounded-lg border border-grey-200 bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-grey-100 px-4 py-3">
            <p className="text-sm font-semibold text-grey-700">Notifications</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCreateTest}
                className="text-xs font-medium hover:underline text-blue-600"
                title="Create test notification"
              >
                Test
              </button>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs font-medium hover:underline"
                  style={{ color: accentColor }}
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <p className="py-8 text-center text-xs text-grey-400">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="py-8 text-center text-xs text-grey-400">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleMarkOne(n.id)}
                  className={`w-full px-4 py-3 text-left transition-colors hover:bg-grey-50 ${!n.is_read ? 'bg-grey-50' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && (
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: accentColor }}
                      />
                    )}
                    {n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs leading-relaxed ${n.is_read ? 'text-grey-500' : 'font-medium text-grey-700'}`}>
                        {n.message}
                      </p>
                      <p className="mt-0.5 text-[10px] text-grey-400">{formatTime(n.created_at)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
