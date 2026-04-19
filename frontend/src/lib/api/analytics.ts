import { apiRequest } from './client'

export type UsageMetrics = {
  repositoryViews: number
  uniqueVisitors: number
  searches: number
  downloads: number
}

/**
 * GET /api/analytics/usage
 * Admin/SuperAdmin only. Fetches usage metrics for reports page.
 */
export async function getUsageMetrics(): Promise<UsageMetrics> {
  return apiRequest<UsageMetrics>('/api/analytics/usage')
}
