export interface Tenant { id: string; name: string }
export interface Organization { id: string; name: string }
export interface OrganizationBranding { logo?: string; colors?: Record<string, string> }
export type UserRole = 'admin' | 'member' | 'viewer'
