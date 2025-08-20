import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, videoQuality = "1080", downloadMode = "auto" } = body || {};
    if (!url) return NextResponse.json({ error: "url wajib" }, { status: 400 });
    // Force video+audio by using downloadMode auto (per docs: auto = video+audio)
    const resp = await fetch("https://dl.siputzx.my.id/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url,
        videoQuality: String(videoQuality),
        downloadMode: downloadMode === "auto" ? "auto" : "auto",
        allowH265: false,
        alwaysProxy: false,
        convertGif: true
      })
    });
    const data = await resp.json().catch(()=>null);
    if (!resp.ok) return NextResponse.json(data ?? { error: "gagal" }, { status: resp.status });
    return NextResponse.json(data);
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "internal error" }, { status: 500 });
  }
}
