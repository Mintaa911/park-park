import { getOrderByPaymentIntentId } from "@/lib/supabase/queries/order"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const paymentIntentId = searchParams.get('paymentIntentId')

  const supabase = await createClient()

  try {
    const { data, error } = await getOrderByPaymentIntentId(supabase, paymentIntentId || '')

    if(error) throw error

    return NextResponse.json(data)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}