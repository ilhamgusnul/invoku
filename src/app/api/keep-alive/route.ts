import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Gunakan service role key untuk melewati RLS, karena ini dipanggil otomatis oleh Cron
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Lakukan query super ringan (hanya ambil 1 ID) agar tercatat sebagai "aktivitas"
    const { data, error } = await supabase
      .from('business_profiles')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Keep-alive cron error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Supabase is kept alive', timestamp: new Date().toISOString() })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
