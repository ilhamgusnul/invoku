import { getPlatformStats } from '@/lib/actions/admin'
import { Card } from '@/components/ui/card'
import { Users, Briefcase, FileText } from 'lucide-react'

export default async function AdminDashboardPage() {
  const stats = await getPlatformStats()

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">Platform Stats</h1>
        <p className="text-[#7a7a7a] mt-1">Ringkasan keseluruhan aktivitas di platform Invoku.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-[#e0e0e0]/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#7a7a7a]">Total Users</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-[#1d1d1f] tracking-tight">
              {stats.totalUsers}
            </span>
            <span className="text-xs text-[#7a7a7a]">Pengguna terdaftar (Auth)</span>
          </div>
        </Card>

        <Card className="p-6 border-[#e0e0e0]/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#7a7a7a]">Business Profiles</h3>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-[#1d1d1f] tracking-tight">
              {stats.totalProfiles}
            </span>
            <span className="text-xs text-[#7a7a7a]">Total profil bisnis dibuat</span>
          </div>
        </Card>

        <Card className="p-6 border-[#e0e0e0]/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#7a7a7a]">Total Invoices</h3>
            <div className="p-2 bg-green-50 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-[#1d1d1f] tracking-tight">
              {stats.totalInvoices}
            </span>
            <span className="text-xs text-[#7a7a7a]">Dokumen invoice digenerate</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
