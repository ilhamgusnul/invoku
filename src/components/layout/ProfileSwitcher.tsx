'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { setActiveBusinessProfile } from '@/lib/actions/context'
import Link from 'next/link'

interface Profile {
  id: string
  name: string
  logo_url: string | null
}

interface Props {
  profiles: Profile[]
  activeProfileId: string | null
}

export function ProfileSwitcher({ profiles, activeProfileId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Local state for immediate UI update while server action runs
  const [activeId, setActiveId] = useState<string | null>(activeProfileId)

  useEffect(() => {
    // If no active profile is set but we have profiles, default to the first one
    if (!activeId && profiles.length > 0) {
      handleSelect(profiles[0].id)
    }
  }, [activeId, profiles])

  const handleSelect = (id: string) => {
    setActiveId(id)
    startTransition(async () => {
      await setActiveBusinessProfile(id)
      router.refresh()
    })
  }

  const activeProfile = profiles.find((p) => p.id === activeId) || profiles[0]

  if (profiles.length === 0) {
    return (
      <Link href="/settings/business-profiles/new">
        <Button variant="outline" className="w-full justify-start rounded-xl h-12 shadow-none border-[#e0e0e0]">
          <PlusCircle className="mr-2 h-4 w-4" />
          Buat Profil Bisnis
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className={buttonVariants({ variant: "outline", className: "w-full justify-between rounded-xl h-12 px-3 shadow-none border-[#e0e0e0] hover:bg-[#f5f5f7] transition-colors" })}
        disabled={isPending}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-6 h-6 rounded-md bg-[#e0e0e0] flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
            {activeProfile?.name.charAt(0).toUpperCase()}
          </div>
          <span className="truncate font-medium text-[14px] text-[#1d1d1f]">
            {activeProfile?.name}
          </span>
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-[#7a7a7a]">Pilih Bisnis</DropdownMenuLabel>
          {profiles.map((profile) => (
            <DropdownMenuItem
              key={profile.id}
              onSelect={() => handleSelect(profile.id)}
              className="rounded-lg cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="truncate">{profile.name}</span>
              </div>
              {activeId === profile.id && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <Link href="/settings/business-profiles/new">
          <DropdownMenuItem className="rounded-lg cursor-pointer text-[#0066cc]">
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Buat Profil Baru</span>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
