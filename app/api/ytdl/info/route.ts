import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url wajib" }, { status: 400 });
  const apiKey = process.env.YTDL_API_KEY || "";
  const res = await fetch(`https://ytdl.siputzx.my.id/get/info?url=${encodeURIComponent(url)}&apikey=${apiKey}`, {
    headers: apiKey ? { "x-api-key": apiKey } : {}
  });
  const data = await res.json().catch(()=>null);
  if (!res.ok) return NextResponse.json(data ?? { error: "gagal" }, { status: res.status });
  return NextResponse.json(data);
}
