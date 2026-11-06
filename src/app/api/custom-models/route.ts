import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { CUSTOM_MODELS_TABLE, type CustomModelRow } from "@/lib/customModels";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return NextResponse.json({ models: [] }, { status: 500 });
    }
    const admin = createAdminClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await admin
      .from(CUSTOM_MODELS_TABLE)
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ models: [], error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { models: (data || []) as CustomModelRow[] },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ models: [], error: String(err) }, { status: 500 });
  }
}

