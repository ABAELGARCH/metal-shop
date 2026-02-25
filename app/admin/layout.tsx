import { AuthProvider } from '@/components/admin/AuthProvider'
import { AdminLayout } from '@/components/admin/AdminLayout'

export const metadata = { title: 'FORGE Admin' }

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AuthProvider>
  )
}
