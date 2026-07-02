import { listAllUsers, toggleSuspendUser } from '@/lib/actions/admin'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ban, ShieldCheck, User } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function AdminUsersPage() {
  const users = await listAllUsers()

  async function suspendAction(formData: FormData) {
    'use server'
    const userId = formData.get('userId') as string
    if (userId) {
      await toggleSuspendUser(userId)
      revalidatePath('/admin/users')
    }
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">User Management</h1>
        <p className="text-[#7a7a7a] mt-1">Kelola akses pengguna terdaftar di platform.</p>
      </div>

      <Card className="border-[#e0e0e0]/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f5f5f7] border-b border-[#e0e0e0]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#1d1d1f]">User ID</th>
                <th className="px-6 py-4 font-semibold text-[#1d1d1f]">Email</th>
                <th className="px-6 py-4 font-semibold text-[#1d1d1f]">Tgl Daftar</th>
                <th className="px-6 py-4 font-semibold text-[#1d1d1f]">Login Terakhir</th>
                <th className="px-6 py-4 font-semibold text-[#1d1d1f]">Status</th>
                <th className="px-6 py-4 font-semibold text-[#1d1d1f] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e0e0]/50">
              {users.map((user) => {
                const isBanned = !!user.banned_until

                return (
                  <tr key={user.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-[#7a7a7a] truncate max-w-[150px]">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#1d1d1f]">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#7a7a7a]" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#7a7a7a]">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-[#7a7a7a]">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {isBanned ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <Ban className="w-3.5 h-3.5" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <ShieldCheck className="w-3.5 h-3.5" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={suspendAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <Button 
                          type="submit" 
                          variant={isBanned ? "outline" : "destructive"} 
                          size="sm" 
                          className="text-xs h-8"
                        >
                          {isBanned ? 'Unsuspend' : 'Suspend'}
                        </Button>
                      </form>
                    </td>
                  </tr>
                )
              })}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#7a7a7a]">
                    Belum ada data pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
