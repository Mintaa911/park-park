import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  const body = await request.json()
  const { recaptchaToken, action } = body


  try {
    // Verify with Google
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;
    const googleRes = await fetch(verificationURL, { method: "POST" });
    const googleData = await googleRes.json();

    if(action === 'checkout_submit' && googleData.success && googleData.score > 0.8) {
      return NextResponse.json({ success: googleData.success });  
    }

    if(action === 'page_load_lot' && googleData.success && googleData.score > 0.5) {
      return NextResponse.json({ success: googleData.success });  
    }

    return NextResponse.json({ success: false });  

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }


}