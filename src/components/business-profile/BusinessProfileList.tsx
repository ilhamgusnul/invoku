'use client'

import { useTransition } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { deleteBusinessProfile } from '@/lib/actions/business-profile'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import Link from 'next/link'
import Image from 'next/image'

interface Profile {
  id: string
  name: string
  logo_url: string | null
  email: string | null
  address: string | null
  default_currency: string
  invoice_prefix: string
}

interface Props {
  profiles: Profile[]
}

export function BusinessProfileList({ profiles }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteBusinessProfile(id)
    })
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#d2d2d7]">
        <h3 className="text-lg font-medium text-[#1d1d1f]">Belum ada Profil Bisnis</h3>
        <p className="text-sm text-[#86868b] mt-1 mb-6">Buat profil bisnis pertama Anda untuk mulai membuat invoice.</p>
        <Link href="/settings/business-profiles/new">
          <Button className="rounded-full bg-[#0066cc] hover:bg-[#0071e3]">
            Buat Profil Bisnis
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map((profile) => (
        <Card key={profile.id} className="shadow-sm border-[#e0e0e0] hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            {profile.logo_url ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#e0e0e0] flex-shrink-0">
                <Image src={profile.logo_url} alt={profile.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center border border-[#e0e0e0] text-[#1d1d1f] font-semibold text-lg flex-shrink-0">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <CardTitle className="text-[17px] font-semibold text-[#1d1d1f] truncate">
                {profile.name}
              </CardTitle>
              <CardDescription className="text-[13px] text-[#7a7a7a] truncate">
                {profile.email || 'Tanpa Email'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[13px] text-[#1d1d1f] space-y-1">
              <p><span className="text-[#86868b]">Mata Uang:</span> {profile.default_currency}</p>
              <p><span className="text-[#86868b]">Prefix:</span> {profile.invoice_prefix}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-[#e0e0e0] pt-4 bg-[#fafafa] rounded-b-xl">
            <Link href={`/settings/business-profiles/${profile.id}`}>
              <Button variant="outline" size="sm" className="rounded-full">Edit</Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger className={buttonVariants({ variant: "destructive", size: "sm", className: "rounded-full" })} disabled={isPending}>
                Hapus
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Profil bisnis ini dan semua invoice yang terkait dengannya mungkin akan terpengaruh.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(profile.id)} className="rounded-full bg-red-600 hover:bg-red-700">
                    Ya, Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
