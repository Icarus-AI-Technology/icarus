import { LucideIcon } from 'lucide-react'

export interface ModuleRoute {
  id: string
  path: string
  name: string
  icon: LucideIcon
  category: string
  description?: string
  isImplemented?: boolean
}

export interface NavigationCategory {
  name: string
  icon: LucideIcon
  routes: ModuleRoute[]
}
