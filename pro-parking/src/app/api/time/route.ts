import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"


export async function GET() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.rpc("get_server_time");

    if (error) {
      throw error;
    }
    return NextResponse.json(data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}