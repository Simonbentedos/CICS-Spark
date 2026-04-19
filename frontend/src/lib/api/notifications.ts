import { apiRequest } from './client'

export type ApiNotification = {
  id: string
  type: string
  message: string
  is_read: boolean
  reference_id: string | null
  created_at: string
}

export async function getNotifications(): Promise<ApiNotification[]> {
  return apiRequest<ApiNotification[]>('/api/notifications')
}

export async function markAllRead(): Promise<{ message: string }> {
  return apiRequest('/api/notifications/read-all', { method: 'PATCH' })
}

export async function markOneRead(id: string): Promise<ApiNotification> {
  return apiRequest<ApiNotification>(`/api/notifications/${id}/read`, { method: 'PATCH' })
}

export async function createTestNotification(): Promise<{ message: string; notification: ApiNotification }> {
  return apiRequest('/api/notifications/test', { method: 'PATCH' })
}
