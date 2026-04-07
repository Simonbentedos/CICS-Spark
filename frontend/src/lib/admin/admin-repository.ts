import { ApiAdminRepository } from '@/lib/admin/repositories/api-admin-repository'
import { MockAdminRepository } from '@/lib/admin/repositories/mock-admin-repository'
import type { AdminRepository } from '@/lib/admin/repositories/types'

const repositoryMode = process.env.NEXT_PUBLIC_ADMIN_REPOSITORY?.toLowerCase()

export function createAdminRepository(): AdminRepository {
  if (repositoryMode === 'api') {
    return new ApiAdminRepository()
  }

  return new MockAdminRepository()
}

export const adminRepository = createAdminRepository()

export type { AdminRepository } from '@/lib/admin/repositories/types'
export { ApiAdminRepository } from '@/lib/admin/repositories/api-admin-repository'
export { MockAdminRepository } from '@/lib/admin/repositories/mock-admin-repository'
