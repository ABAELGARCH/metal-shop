'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

type Admin = { id: number; email: string; name: string }
type AuthCtx = {
  admin: Admin | null
  token: string | null
  login: (token: string, admin: Admin) => void
  logout: () => void
  authHeader: () => Record<string, string>
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('admin_token')
    if (!stored) {
      setChecked(true)
      if (!pathname.includes('/admin/login')) router.replace('/admin/login')
      return
    }

    fetch('/api/admin/auth/me', {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.admin) {
          setToken(stored)
          setAdmin(data.admin)
        } else {
          localStorage.removeItem('admin_token')
          router.replace('/admin/login')
        }
      })
      .catch(() => {
        localStorage.removeItem('admin_token')
        router.replace('/admin/login')
      })
      .finally(() => setChecked(true))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = (tok: string, adm: Admin) => {
    localStorage.setItem('admin_token', tok)
    setToken(tok)
    setAdmin(adm)
    router.replace('/admin')
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
    setAdmin(null)
    router.replace('/admin/login')
  }

  const authHeader = () =>
    token ? { Authorization: `Bearer ${token}` } : {}

  if (!checked) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, authHeader }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
