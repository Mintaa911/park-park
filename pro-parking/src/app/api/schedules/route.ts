import { getSchedulesByDay } from "@/lib/supabase/queries/schedule"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lotId = searchParams.get('lot_id')

  const supabase = await createClient()

  try {
    const data = await getSchedulesByDay(supabase, new Date, lotId || '')
    return NextResponse.json(data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}