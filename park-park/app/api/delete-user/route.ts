import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    const supabase = await createClient();

    // Delete from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;

    // Optional: delete/clean related rows in your own tables
    await supabase.from("employees").delete().eq("user_id", userId);
    await supabase.from("users").delete().eq("user_id", userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete user" },
      { status: 500 }
    );
  }
} 