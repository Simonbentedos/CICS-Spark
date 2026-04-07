export interface Thesis {
  id: string
  title: string
  abstract: string
  authors: string[]
  department: string
  year: number
  keywords: string[]
  file_url?: string
  created_at: string
  updated_at: string
}

export interface Author {
  id: string
  name: string
  email?: string
  department?: string
}

export interface Department {
  id: string
  name: string
  code: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'guest'
  created_at: string
}

export interface SearchFilters {
  query?: string
  department?: string
  year?: number
  author?: string
  keywords?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
