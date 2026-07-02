'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Briefcase } from 'lucide-react'

export function SettingsNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Akun Pengguna',
      href: '/settings/account',
      icon: User
    },
    {
      name: 'Profil Bisnis',
      href: '/settings/business-profiles',
      icon: Briefcase
    }
  ]

  return (
    <nav className="flex flex-col space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              isActive
                ? 'bg-blue-50 text-primary-container'
                : 'text-[#7a7a7a] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]'
            }`}
          >
            <item.icon
              className={`mr-3 h-5 w-5 shrink-0 ${
                isActive ? 'text-primary-container' : 'text-[#7a7a7a]'
              }`}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
