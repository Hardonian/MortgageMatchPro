import React from 'react'
export function getSession() { return null }
export function requireAuth() { return { user: null } }
export function AuthProvider({ children }: { children: React.ReactNode }) { return <>{children}</> }
export default AuthProvider
