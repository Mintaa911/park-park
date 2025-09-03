import { getPriceTierById } from "@/lib/supabase/queries/price-tier";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";


export async function POST(request: NextResponse) {
  const body = await request.json()
  const { recaptchaToken } = body


  try {
    // Verify with Google
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
    const googleRes = await fetch(verificationURL, { method: "POST" });
    const googleData = await googleRes.json();

    return NextResponse.json({ success: googleData.success, score: googleData.score });  

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }


}