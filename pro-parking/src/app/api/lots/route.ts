import { getLotBySlug, getLotById, searchParkingLots } from "@/lib/supabase/queries/lot";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";




export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const slug = searchParams.get('slug')
  const searchQuery = searchParams.get('search_query')

  const supabase = await createClient();

  try {
    if (id) {
      const { data, error } = await getLotById(supabase, id)

      if (error) throw error

      return NextResponse.json(data)
    }

    if (slug) {
      const { data, error } = await getLotBySlug(supabase, slug)

      if (error) throw error

      return NextResponse.json(data)
    }

    if (searchQuery) {
      const { data, error } = await searchParkingLots(supabase, searchQuery)

      if (error) throw error

      return NextResponse.json(data)

    }

    return NextResponse.json({ success: true })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }

}