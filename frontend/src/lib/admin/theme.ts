import type { AdminSession } from '@/types/admin'

export type AdminTheme = {
  departmentCode: AdminSession['departmentCode']
  departmentName: string
  dashboardLabel: string
  accentHex: string
  accentSoft: string
  accentText: string
  accentDark: string
  badgeBg: string
  badgeText: string
}

const THEMES: Record<AdminSession['departmentCode'], AdminTheme> = {
  cs: {
    departmentCode: 'cs',
    departmentName: 'Computer Science',
    dashboardLabel: 'Computer Science Dashboard',
    accentHex: '#2563eb',
    accentSoft: '#dbeafe',
    accentText: '#1d4ed8',
    accentDark: '#1e40af',
    badgeBg: '#dbeafe',
    badgeText: '#1e3a8a',
  },
  it: {
    departmentCode: 'it',
    departmentName: 'Information Technology',
    dashboardLabel: 'Information Technology Dashboard',
    accentHex: '#16a34a',
    accentSoft: '#dcfce7',
    accentText: '#15803d',
    accentDark: '#166534',
    badgeBg: '#dcfce7',
    badgeText: '#166534',
  },
  is: {
    departmentCode: 'is',
    departmentName: 'Information Systems',
    dashboardLabel: 'Information Systems Dashboard',
    accentHex: '#ea580c',
    accentSoft: '#ffedd5',
    accentText: '#c2410c',
    accentDark: '#9a3412',
    badgeBg: '#ffedd5',
    badgeText: '#9a3412',
  },
}

export function getAdminTheme(departmentCode: AdminSession['departmentCode']): AdminTheme {
  return THEMES[departmentCode]
}