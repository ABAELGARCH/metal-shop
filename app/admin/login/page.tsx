'use client'
import { useState } from 'react'
import { useAuth } from '@/components/admin/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function AdminLoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (res.ok) {
      login(data.token, data.admin)
    } else {
      setError(data.error || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-yellow rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-brand-black font-black text-3xl">F</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-widest">FORGE ADMIN</h1>
          <p className="text-brand-steel mt-1">Back-office access</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-8 flex flex-col gap-5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" loading={loading} className="w-full tracking-widest">
            SIGN IN
          </Button>
        </form>
      </div>
    </div>
  )
}
