import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Migrate old content statuses from 'idea' to 'draft'
    const { error: contentError } = await supabase
      .from('content')
      .update({ status: 'draft' })
      .eq('status', 'idea')

    if (contentError) throw contentError

    return NextResponse.json({ success: true, message: 'Database migrated successfully.' })
  } catch (error: any) {
    console.error('Migration Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
