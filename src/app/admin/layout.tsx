import { checkIsAdmin } from '@/lib/actions/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Super Admin - Invoku',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) {
    redirect('/dashboard') // Redirect non-admins to normal dashboard
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      {/* Sidebar Admin */}
      <aside className="w-64 border-r border-[#e0e0e0] bg-[#1d1d1f] text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-tight">Invoku Admin</h1>
          <p className="text-xs text-white/50 mt-1">Superuser Area</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start rounded-xl text-white hover:bg-white/10 hover:text-white">
              <LayoutDashboard className="mr-3 h-5 w-5 text-white/50" />
              Platform Stats
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="ghost" className="w-full justify-start rounded-xl text-white hover:bg-white/10 hover:text-white">
              <Users className="mr-3 h-5 w-5 text-white/50" />
              Users
            </Button>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start rounded-xl text-white hover:bg-white/10 hover:text-white">
              <ArrowLeft className="mr-3 h-5 w-5" />
              Back to App
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
