import React from 'react'
export const TenantContext = React.createContext(null)
export function useTenantContext() { return null }
export function TenantProvider({ children }: { children: React.ReactNode }) { return <>{children}</> }
export default TenantContext
