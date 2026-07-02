import { SettingsNav } from '@/components/settings/SettingsNav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pengaturan',
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">Pengaturan</h1>
        <p className="text-[#7a7a7a] mt-1">Kelola preferensi akun dan profil bisnis Anda.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <SettingsNav />
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-white p-6 md:p-8 rounded-2xl border border-[#e0e0e0] shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
