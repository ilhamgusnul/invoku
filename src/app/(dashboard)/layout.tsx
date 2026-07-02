import { getBusinessProfiles } from '@/lib/actions/business-profile'
import { getActiveBusinessProfile } from '@/lib/actions/context'
import { ProfileSwitcher } from '@/components/layout/ProfileSwitcher'
import Link from 'next/link'
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/lib/actions/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profiles = await getBusinessProfiles()
  const activeProfileId = await getActiveBusinessProfile()

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#e0e0e0] bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-[#e0e0e0]">
          <h1 className="text-xl font-bold text-[#1d1d1f] tracking-tight mb-4 px-2">Invoku</h1>
          <ProfileSwitcher profiles={profiles} activeProfileId={activeProfileId} />
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start rounded-xl text-[#1d1d1f] hover:bg-[#f5f5f7]">
              <LayoutDashboard className="mr-3 h-5 w-5 text-[#7a7a7a]" />
              Dashboard
            </Button>
          </Link>
          <Link href="/clients">
            <Button variant="ghost" className="w-full justify-start rounded-xl text-[#1d1d1f] hover:bg-[#f5f5f7]">
              <Users className="mr-3 h-5 w-5 text-[#7a7a7a]" />
              Klien
            </Button>
          </Link>
          <Link href="/invoices">
            <Button variant="ghost" className="w-full justify-start rounded-xl text-[#1d1d1f] hover:bg-[#f5f5f7]">
              <FileText className="mr-3 h-5 w-5 text-[#7a7a7a]" />
              Invoice
            </Button>
          </Link>
          <Link href="/settings/account">
            <Button variant="ghost" className="w-full justify-start rounded-xl text-[#1d1d1f] hover:bg-[#f5f5f7]">
              <Settings className="mr-3 h-5 w-5 text-[#7a7a7a]" />
              Pengaturan
            </Button>
          </Link>
        </nav>

        <div className="p-4 border-t border-[#e0e0e0]">
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" className="w-full justify-start rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700">
              <LogOut className="mr-3 h-5 w-5" />
              Keluar
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
