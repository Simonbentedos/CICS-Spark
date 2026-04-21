"use client"

import { useEffect, useState } from 'react'
import { Save, Shield, Users, Settings as SettingsIcon } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getAdminUsers, type ApiUser } from '@/lib/api/users'
import { 
  getDepartmentPermissions, 
  updateDepartmentPermissions,
} from '@/lib/api/permissions'

type Permission = {
  id: string
  name: string
  description: string
  category: 'submissions' | 'users' | 'reports' | 'system'
}

type AdminPermissions = {
  userId: string
  permissions: string[]
}

type DepartmentSaveState = {
  [department: string]: boolean
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  // Submissions
  { id: 'submissions.view', name: 'View Submissions', description: 'Can view all submissions in their department', category: 'submissions' },
  { id: 'submissions.review', name: 'Review Submissions', description: 'Can approve, reject, or request revisions', category: 'submissions' },
  { id: 'submissions.delete', name: 'Delete Submissions', description: 'Can permanently delete submissions', category: 'submissions' },
  
  // Users
  { id: 'users.view', name: 'View Users', description: 'Can view users in their department', category: 'users' },
  { id: 'users.create', name: 'Create Users', description: 'Can create new student accounts', category: 'users' },
  
  // Reports
  { id: 'reports.view', name: 'View Reports', description: 'Can access analytics and reports', category: 'reports' },
  { id: 'reports.export', name: 'Export Reports', description: 'Can export reports in CSV/JSON format', category: 'reports' },
  
  // System
  { id: 'fulltext.manage', name: 'Manage Full-Text Requests', description: 'Can approve/deny full-text access requests', category: 'system' },
]

const DEFAULT_ADMIN_PERMISSIONS = [
  'submissions.view',
  'submissions.review',
  'users.view',
  'reports.view',
  'reports.export',
  'fulltext.manage',
]

const DEPARTMENTS = ['CS', 'IT', 'IS'] as const

export default function SuperAdminSettingsPage() {
  const [admins, setAdmins] = useState<ApiUser[]>([])
  const [adminPermissions, setAdminPermissions] = useState<AdminPermissions[]>([])
  const [loading, setLoading] = useState(true)
  const [savingStates, setSavingStates] = useState<DepartmentSaveState>({})
  const [error, setError] = useState<string | null>(null)
  const [successMessages, setSuccessMessages] = useState<DepartmentSaveState>({})

  useEffect(() => {
    fetchAdmins()
  }, [])

  async function fetchAdmins() {
    try {
      setLoading(true)
      setError(null) // Clear any previous errors
      const users = await getAdminUsers()
      const adminUsers = users.filter(user => user.role === 'admin')
      setAdmins(adminUsers)
      
      // Fetch actual permissions from backend for each department
      const permissionsPromises = DEPARTMENTS.map(dept => 
        getDepartmentPermissions(dept).catch(() => [])
      )
      const departmentPermissions = await Promise.all(permissionsPromises)
      
      // Flatten all permissions
      const allPermissions: AdminPermissions[] = []
      departmentPermissions.forEach(deptPerms => {
        allPermissions.push(...deptPerms)
      })
      
      // Ensure all admins have permission entries (even if empty)
      const permissionsMap = new Map(allPermissions.map(ap => [ap.userId, ap]))
      
      const completePermissions = adminUsers.map(admin => {
        const existing = permissionsMap.get(admin.id)
        if (existing) {
          return existing
        }
        // Admin has no permissions in database yet, use defaults
        return {
          userId: admin.id,
          permissions: DEFAULT_ADMIN_PERMISSIONS,
        }
      })
      
      setAdminPermissions(completePermissions)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load admins'
      
      // Check if it's an authentication error
      if (errorMessage.includes('authentication') || errorMessage.includes('token') || errorMessage.includes('401')) {
        setError('Your session has expired. Please log out and log back in.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  function updatePermission(userId: string, permissionId: string, granted: boolean) {
    setAdminPermissions(prev => 
      prev.map(adminPerm => {
        if (adminPerm.userId === userId) {
          let permissions: string[]
          if (granted) {
            // Add permission only if it doesn't already exist
            permissions = adminPerm.permissions.includes(permissionId)
              ? adminPerm.permissions
              : [...adminPerm.permissions, permissionId]
          } else {
            // Remove permission
            permissions = adminPerm.permissions.filter(p => p !== permissionId)
          }
          return { ...adminPerm, permissions }
        }
        return adminPerm
      })
    )
  }

  function hasPermission(userId: string, permissionId: string): boolean {
    const adminPerm = adminPermissions.find(ap => ap.userId === userId)
    return adminPerm?.permissions.includes(permissionId) ?? false
  }

  async function handleSaveDepartment(department: string) {
    try {
      setSavingStates(prev => ({ ...prev, [department]: true }))
      setError(null)
      
      // Get admins for this department
      const departmentAdmins = getAdminsByDepartment(department)
      
      // Get permissions for these admins
      const departmentPermissions = departmentAdmins.map(admin => {
        const adminPerm = adminPermissions.find(ap => ap.userId === admin.id)
        return {
          userId: admin.id,
          permissions: adminPerm?.permissions || [],
        }
      })
      
      // Save to backend
      await updateDepartmentPermissions(department, departmentPermissions)
      
      setSuccessMessages(prev => ({ ...prev, [department]: true }))
      setTimeout(() => {
        setSuccessMessages(prev => ({ ...prev, [department]: false }))
      }, 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save permissions'
      
      // Check if it's an authentication error
      if (errorMessage.includes('authentication') || errorMessage.includes('token') || errorMessage.includes('401')) {
        setError('Your session has expired. Please log out and log back in.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setSavingStates(prev => ({ ...prev, [department]: false }))
    }
  }

  function getPermissionsByCategory(category: Permission['category']) {
    return AVAILABLE_PERMISSIONS.filter(p => p.category === category)
  }

  function getAdminsByDepartment(department: string) {
    return admins.filter(admin => admin.department === department)
  }

  const categoryIcons = {
    submissions: Shield,
    users: Users,
    reports: SettingsIcon,
    system: SettingsIcon,
  }

  const categoryLabels = {
    submissions: 'Submission Management',
    users: 'User Management', 
    reports: 'Reports & Analytics',
    system: 'System Administration',
  }

  const departmentColors = {
    CS: 'bg-blue-500',
    IT: 'bg-green-500', 
    IS: 'bg-orange-500',
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <AdminPageHeader
          title="Settings"
          subtitle="Manage admin permissions and access control by department"
        />
        <div className="flex items-center justify-center py-12">
          <p className="text-grey-500">Loading admin settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Settings"
        subtitle="Manage admin permissions and access control by department"
      />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {DEPARTMENTS.map(department => {
          const departmentAdmins = getAdminsByDepartment(department)
          const isSaving = savingStates[department]
          const showSuccess = successMessages[department]
          
          return (
            <Card key={department} className="border border-grey-200 shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${departmentColors[department]} text-white font-bold`}>
                      {department}
                    </div>
                    <div>
                      <p className="text-navy">{department} Department</p>
                      <p className="text-sm font-normal text-grey-500">
                        {departmentAdmins.length} admin{departmentAdmins.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </CardTitle>
                  <Button 
                    onClick={() => handleSaveDepartment(department)}
                    disabled={isSaving || departmentAdmins.length === 0}
                    className="h-9 px-4 text-xs"
                  >
                    <Save className="mr-1 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
                
                {showSuccess && (
                  <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                    {department} department permissions updated successfully!
                  </div>
                )}
              </CardHeader>
              
              {departmentAdmins.length > 0 ? (
                <CardContent className="space-y-6">
                  {departmentAdmins.map(admin => (
                    <div key={admin.id} className="border-l-4 border-grey-200 pl-4">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-grey-600 text-white text-sm font-medium">
                          {admin.first_name.charAt(0)}{admin.last_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-navy">{admin.first_name} {admin.last_name}</p>
                          <p className="text-sm text-grey-500">{admin.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {(['submissions', 'users', 'reports', 'system'] as const).map(category => {
                          const permissions = getPermissionsByCategory(category)
                          const CategoryIcon = categoryIcons[category]
                          
                          return (
                            <div key={category} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CategoryIcon className="h-4 w-4 text-grey-600" />
                                <h4 className="text-sm font-medium text-navy">{categoryLabels[category]}</h4>
                              </div>
                              <div className="grid gap-2 sm:grid-cols-2 ml-6">
                                {permissions.map(permission => (
                                  <label key={permission.id} className="flex items-start gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={hasPermission(admin.id, permission.id)}
                                      onChange={(e) => updatePermission(admin.id, permission.id, e.target.checked)}
                                      className="mt-1 rounded border-grey-300 text-cics-maroon focus:ring-cics-maroon"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-grey-700">{permission.name}</p>
                                      <p className="text-xs text-grey-500">{permission.description}</p>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              ) : (
                <CardContent className="py-8 text-center">
                  <Users className="mx-auto h-8 w-8 text-grey-400" />
                  <p className="mt-2 text-grey-500">No admins in {department} department</p>
                  <p className="text-sm text-grey-400">Create admin accounts from the User Management page</p>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}