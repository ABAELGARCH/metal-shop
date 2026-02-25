'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'

const navLinks = [
  {
    href: '/admin',
    label: 'Dashboard',
    exact: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/admin/products',
    label: 'Products',
    exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: '/admin/orders',
    label: 'Orders',
    exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/admin/designers',
    label: 'DXF Templates',
    exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { admin, logout } = useAuth()

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div className="flex h-screen bg-brand-black overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-charcoal border-r border-brand-steel-dark flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-brand-steel-dark">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-yellow rounded flex items-center justify-center">
              <span className="text-brand-black font-black text-sm">M</span>
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">FORGE</div>
              <div className="text-brand-steel text-xs">Metal Shop Admin</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors
                ${isActive(link.href, link.exact)
                  ? 'bg-brand-yellow text-brand-black'
                  : 'text-brand-steel hover:text-white hover:bg-brand-black'
                }
              `}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-brand-steel-dark">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-brand-steel-dark rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {admin?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{admin?.name}</p>
              <p className="text-brand-steel text-xs truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full mt-2 px-3 py-2 text-sm text-brand-steel hover:text-red-400 hover:bg-red-400/10 rounded transition-colors text-left"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
