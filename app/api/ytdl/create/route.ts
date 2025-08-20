import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, format_id = null } = body || {};
    if (!url) return NextResponse.json({ error: "url wajib" }, { status: 400 });
    const apiKey = process.env.YTDL_API_KEY || "";
    const res = await fetch(`https://ytdl.siputzx.my.id/create/job?apikey=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "x-api-key": apiKey } : {})
      },
      body: JSON.stringify({ url, format_id })
    });
    const data = await res.json().catch(()=>null);
    if (!res.ok) return NextResponse.json(data ?? { error: "gagal" }, { status: res.status });
    return NextResponse.json(data);
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "internal error" }, { status: 500 });
  }
}
