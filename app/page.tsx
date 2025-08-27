"use client";
import { useMemo, useRef, useState } from "react";

// No quality picker; we'll choose best available automatically

type Result = { 
  link?: string; 
  filename?: string; 
  size?: number; 
  error?: string;
  links?: Array<{ label: string; url: string }>;
  title?: string;
  duration?: number | string;
  video?: Array<{ quality: string; url: string }>;
  music?: string;
  thumbnail?: string;
  media?: Array<{ url: string; type: string; thumbnail?: string }>;
  author?: string;
  caption?: string;
};

type Platform = "youtube" | "tiktok" | "facebook" | "instagram" | "twitter" | "spotify" | "other";

function detectPlatform(url: string): Platform {
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase();
    if (h.includes("youtube.com") || h.includes("youtu.be")) return "youtube";
    if (h.includes("tiktok.com")) return "tiktok";
    if (h.includes("facebook.com") || h.includes("fb.watch")) return "facebook";
    if (h.includes("x.com") || h.includes("twitter.com")) return "twitter";
    if (h.includes("instagram.com")) return "instagram";
    if (h.includes("open.spotify.com")) return "spotify";
    return "other";
  } catch {
    return "other";
  }

}

function prettyPlatform(p: Platform) {
  switch (p) {
    case "youtube": return "YouTube";
    case "tiktok": return "TikTok";
    case "facebook": return "Facebook";
    case "instagram": return "Instagram";
    case "twitter": return "X/Twitter";
    case "spotify": return "Spotify";
    default: return "Other";
  }
}

function platformColor(p: Platform) {
  // Simple brand-ish colors
  switch (p) {
    case "youtube": return "#ff3b30";
    case "tiktok": return "#25F4EE";
    case "facebook": return "#1877f2";
    case "instagram": return "#e1306c";
    case "twitter": return "#1DA1F2";
    case "spotify": return "#1db954";
    default: return "#7f8ea3";
  }
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [progress, setProgress] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const platform = useMemo(() => detectPlatform(url), [url]);

  async function handlePaste() {
    try {
      // Clipboard API works only on secure contexts (https) and with a user gesture
      if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          return;
        }
      }
      throw new Error("Clipboard not available");
    } catch {
      // Graceful fallback without alert: focus input and show a hint
      inputRef.current?.focus();
      setProgress("Tidak bisa akses clipboard. Tap input lalu Paste (tempel) secara manual.");
      setTimeout(() => setProgress(""), 2500);
    }
  }

  async function handleDownload() {
    setLoading(true); setResult(null); setProgress("");
    try {
      if (!url.trim()) throw new Error("Masukkan URL yang valid");
      if (platform === "spotify") {
        const res = await fetch("/api/spotify", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ url }) });
        if (!res.ok) throw new Error(`Gagal: ${res.status}`);
        const data = await res.json();
        if (data?.status === "success" && data?.download_url) {
          setResult({ link: data.download_url, filename: data.filename });
        } else {
          throw new Error(data?.error || "Response tidak dikenal");
        }
      } else if (platform === "youtube") {
        const res = await fetch("/api/youtube", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ url }) });
        if (!res.ok) throw new Error(`Gagal: ${res.status}`);
        const data = await res.json();
        if (data?.status === "success" && data?.download_url) {
          setResult({ link: data.download_url, filename: data.filename });
        } else {
          throw new Error(data?.error || "Response tidak dikenal");
        }
      } else if (platform === "tiktok") {
        const res = await fetch("/api/tiktok", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ url }) });
        if (!res.ok) throw new Error(`Gagal: ${res.status}`);
        const data = await res.json();
        if (data?.status === "success" && data?.links) {
          setResult({ 
            links: data.links, 
            filename: data.filename,
            title: data.title,
            duration: data.duration
          });
        } else {
          throw new Error(data?.error || "Response tidak dikenal");
        }
      } else if (platform === "facebook") {
        const res = await fetch("/api/facebook", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ url }) });
        if (!res.ok) throw new Error(`Gagal: ${res.status}`);
        const data = await res.json();
        if (data?.status === "success" && data?.video) {
          setResult({ 
            video: data.video, 
            filename: data.filename,
            title: data.title,
            duration: data.duration,
            music: data.music,
            thumbnail: data.thumbnail
          });
        } else {
          throw new Error(data?.error || "Response tidak dikenal");
        }
      } else if (platform === "instagram") {
        const res = await fetch("/api/instagram", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ url }) });
        if (!res.ok) throw new Error(`Gagal: ${res.status}`);
        const data = await res.json();
        if (data?.status === "success" && data?.media) {
          setResult({ 
            media: data.media, 
            filename: data.filename,
            author: data.author,
            caption: data.caption
          });
        } else {
          throw new Error(data?.error || "Response tidak dikenal");
        }
      } else {
        const res = await fetch("/api/dl", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ url, downloadMode: "auto" }) });
        if (!res.ok) throw new Error(`Gagal: ${res.status}`);
        const data = await res.json();
        if (data?.status === "tunnel" && data?.url) {
          setResult({ link: data.url, filename: data.filename });
        } else if (data?.url) {
          setResult({ link: data.url, filename: data.filename });
        } else {
          throw new Error("Response tidak dikenal");
        }
      }
    } catch (e:any) {
      setResult({ error: e?.message || "Terjadi kesalahan" });
    } finally {
      setLoading(false); setProgress("");
    }
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "20px 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #0b1220 0%, #0f172a 40%, #1e3a8a 120%)",
      }}
    >
      <div className="card"
        style={{
          width: "100%",
          maxWidth: 760,
          borderRadius: 14,
          padding: 22,
          background: "linear-gradient(180deg, rgba(18,24,54,0.9), rgba(12,16,40,0.9))",
          border: "1.5px solid #4fa3ff",
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.03)",
          backdropFilter: "blur(6px)",
        }}
      >
        <h1 style={{ fontSize: "clamp(20px, 4.5vw, 28px)", fontWeight: 800, marginBottom: 6, whiteSpace: "nowrap", textAlign: "center" }}>YogaxD Downloader</h1>
        <p style={{ opacity: 0.85, marginBottom: 22, textAlign: "center" }}>Unduh video tanpa watermark gratis!</p>

        <div style={{ display: "grid", gap: 14 }}>
          <div className="inputRow" style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
            <input className="urlInput"
              ref={inputRef}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Tempel URL video di sini"
              style={{
                flex: 1,
                minWidth: 0,
                maxWidth: "100%",
                boxSizing: "border-box",
                padding: "14px 16px",
                borderRadius: 12,
                border: "1px solid #2b3250",
                background: "#0f1530",
                color: "#e6e8ef",
                outline: "none",
              }}
            />
            <button className="pasteBtn"
              onClick={handlePaste}
              title="Paste dari clipboard"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${platformColor(platform)}55`,
                background: `${platformColor(platform)}22`,
                color: platformColor(platform),
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Paste
            </button>
          </div>

          <div className="controlsRow" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {platform !== "other" && (
              <span className="platformBadge"
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  background: `${platformColor(platform)}22`,
                  color: platformColor(platform),
                  border: `1px solid ${platformColor(platform)}55`,
                  whiteSpace: "nowrap",
                }}
              >
                {prettyPlatform(platform)}
              </span>
            )}
            <div style={{flex:1}} />
            <button className="getInfoBtn"
              onClick={handleDownload}
              disabled={loading}
              style={{
                marginLeft: "auto",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #5b8cff",
                background: loading ? "#2a3563" :
                  "linear-gradient(180deg, #4f86ff, #3774ff)",
                color: "white",
                fontWeight: 700,
                letterSpacing: 0.3,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading
                  ? "none"
                  : "0 8px 20px rgba(59,91,255,0.45)",
              }}
            >
              {loading ? "Memproses..." : "Get info"}
            </button>
          </div>

          {progress && (
            <div
              style={{
                marginTop: 4,
                padding: 10,
                borderRadius: 10,
                border: "1px dashed #39406a",
                background: "#101737",
                color: "#c7d2f0",
              }}
            >
              {progress}
            </div>
          )}

          {result && (
            <div
              className="resultBox"
              style={{
                marginTop: 4,
                padding: 13,
                border: "1.5px solid #4fa3ff",
                borderRadius: 10,
                background: "#0f1530",
              }}
            >
              {result.error ? (
                <p style={{ color: "#ff6b6b" }}>Error: {result.error}</p>
              ) : result.links ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {result.title && (
                    <div>
                      <p style={{ opacity: 0.9, marginBottom: 4 }}><strong>{result.title}</strong></p>
                      {result.duration && <p style={{ opacity: 0.7, fontSize: 14 }}>Durasi: {result.duration} detik</p>}
                    </div>
                  )}
                  <div style={{ display: "grid", gap: 8 }}>
                    <p style={{ opacity: 0.8, fontSize: 14, marginBottom: 4 }}>Pilih format download:</p>
                    {result.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: "1px solid #25F4EE",
                          background: link.label.includes("HD") 
                            ? "linear-gradient(180deg, #25F4EE, #1DB8B3)"
                            : link.label.includes("MP3")
                            ? "linear-gradient(180deg, #ff6b6b, #e55656)"
                            : "linear-gradient(180deg, #3db6ff, #1f8eff)",
                          color: "#fff",
                          fontWeight: 700,
                          letterSpacing: 0.3,
                          textDecoration: "none",
                          boxShadow: "0 6px 16px rgba(37,244,238,0.25)",
                          fontSize: 14,
                        }}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : result.video ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {result.title && (
                    <div>
                      <p style={{ opacity: 0.9, marginBottom: 4 }}><strong>{result.title}</strong></p>
                      {result.duration && <p style={{ opacity: 0.7, fontSize: 14 }}>Durasi: {result.duration}</p>}
                    </div>
                  )}
                  <div style={{ display: "grid", gap: 8 }}>
                    <p style={{ opacity: 0.8, fontSize: 14, marginBottom: 4 }}>Pilih kualitas video:</p>
                    {result.video.map((video, index) => (
                      <a
                        key={index}
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: "1px solid #1877f2",
                          background: video.quality.includes("1080p") || video.quality.includes("HD")
                            ? "linear-gradient(180deg, #1877f2, #166fe5)"
                            : video.quality.includes("720p")
                            ? "linear-gradient(180deg, #42a5f5, #1976d2)"
                            : "linear-gradient(180deg, #3db6ff, #1f8eff)",
                          color: "#fff",
                          fontWeight: 700,
                          letterSpacing: 0.3,
                          textDecoration: "none",
                          boxShadow: "0 6px 16px rgba(24,119,242,0.25)",
                          fontSize: 14,
                        }}
                      >
                        {video.quality}
                      </a>
                    ))}
                    {result.music && (
                      <a
                        href={result.music}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: "1px solid #ff6b6b",
                          background: "linear-gradient(180deg, #ff6b6b, #e55656)",
                          color: "#fff",
                          fontWeight: 700,
                          letterSpacing: 0.3,
                          textDecoration: "none",
                          boxShadow: "0 6px 16px rgba(255,107,107,0.25)",
                          fontSize: 14,
                        }}
                      >
                        Unduh Audio Only
                      </a>
                    )}
                  </div>
                </div>
              ) : result.media ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {result.author && (
                    <div>
                      <p style={{ opacity: 0.9, marginBottom: 4 }}><strong>@{result.author}</strong></p>
                      {result.caption && <p style={{ opacity: 0.7, fontSize: 14 }}>{result.caption}</p>}
                    </div>
                  )}
                  <div style={{ display: "grid", gap: 8 }}>
                    <p style={{ opacity: 0.8, fontSize: 14, marginBottom: 4 }}>
                      {result.media && result.media.length > 1 ? `${result.media.length} media items:` : "Media:"}
                    </p>
                    {result.media.map((media, index) => (
                      <a
                        key={index}
                        href={media.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: "1px solid #e1306c",
                          background: media.type === "video"
                            ? "linear-gradient(180deg, #e1306c, #c13584)"
                            : "linear-gradient(180deg, #f56040, #e1306c)",
                          color: "#fff",
                          fontWeight: 700,
                          letterSpacing: 0.3,
                          textDecoration: "none",
                          boxShadow: "0 6px 16px rgba(225,48,108,0.25)",
                          fontSize: 14,
                        }}
                      >
                        {media.type === "video" ? "📹" : "🖼️"} {media.type === "video" ? "Video" : "Image"} {result.media && result.media.length > 1 ? `#${index + 1}` : ""}
                      </a>
                    ))}
                  </div>
                </div>
              ) : result.link ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <p style={{ opacity: 0.9 }}>{result.filename ?? "File siap diunduh"}</p>
                  <a
                    href={result.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: "1px solid #3aa3ff",
                      background: "linear-gradient(180deg, #3db6ff, #1f8eff)",
                      color: "#fff",
                      fontWeight: 800,
                      letterSpacing: 0.3,
                      textDecoration: "none",
                      boxShadow: "0 8px 18px rgba(31,142,255,0.35)",
                      width: "max-content",
                    }}
                  >
                    Klik untuk download
                  </a>
                </div>
              ) : null}
            </div>
          )}

          {/* Status Layanan */}
          <section style={{ marginTop: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Status Layanan</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
              {[
                { key: "facebook", label: "Facebook Reels", status: "online" },
                { key: "tiktok", label: "TikTok Video", status: "online" },
                { key: "instagram", label: "Instagram Reels", status: "online" },
                { key: "twitter", label: "X/Twitter Video/Photo", status: "under maintenance" },
                { key: "spotify", label: "Spotify Music", status: "online" },
                { key: "youtube", label: "YouTube Video", status: "online" },
              ].map((s) => {
                const st = s.status.toLowerCase();
                const isOnline = ["run", "online", "up"].includes(st);
                const isMaintenance = st.includes("maintenance");
                const isOffline = !isOnline && !isMaintenance;
                const brand = platformColor(s.key as any);
                const color = isOffline ? "#ff6b6b" : isMaintenance ? "#f59e0b" : brand; // red / amber / brand
                const bg = isOffline ? "#3b1f24" : isMaintenance ? "#3b2a1a" : `${color}22`;
                const border = isOffline ? "#ff6b6b88" : isMaintenance ? "#f59e0b88" : `${color}55`;
                return (
                  <li
                    key={s.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1px solid ${border}`,
                      background: bg,
                      color: isOffline ? "#ffb3b3" : color,
                      fontWeight: 700,
                    }}
                  >
                    <span>{s.label}</span>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: isOffline ? "#ff6b6b" : isMaintenance ? "#f59e0b" : color,
                        color: "#fff",
                        fontSize: 12,
                      }}
                    >
                      {s.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <footer style={{ marginTop: 8, opacity: 0.6, fontSize: 12, textAlign: "center" }}>
            API by <span style={{ color: "#9ecbff" }}>dl.siputzx.my.id</span> & <span style={{ color: "#9ecbff" }}>sankavollerei.com</span>
          </footer>
          <style jsx>{`
            @media (max-width: 520px) {
              .card { 
                height: auto;
                max-width: 99vw;
                padding: 8px 4px 12px 4px !important;
                border-radius: 10px;
                border: 1.5px solid #6ec3ff;
                margin: 0 2px;
              }
              .inputRow { flex-direction: column; gap: 6px; }
              .urlInput { 
                width: 100%; 
                padding: 10px 10px !important;
                font-size: 15px;
                border-radius: 8px;
                box-sizing: border-box;
              }
              .pasteBtn { 
                width: 100%; 
                padding: 10px 10px;
                font-size: 15px;
                border-radius: 8px;
                box-sizing: border-box;
                margin-top: 5px;
              }
              .controlsRow { 
                gap: 5px; 
                padding-inline: 0; 
                margin-top: 6px;
              }
              .getInfoBtn {
                width: 100%;
                margin-left: 0 !important;
                box-sizing: border-box;
                box-shadow: none !important;
                border-width: 1.5px !important;
                border-radius: 8px;
                padding: 11px 10px !important;
                font-size: 15px;
              }
              .resultBox {
                padding: 10px 7px !important;
                border-radius: 8px !important;
                border: 1.5px solid #6ec3ff !important;
                font-size: 14px;
              }
              .platformBadge { display: none; }
              h1 { font-size: 21px !important; }
              p, label, span, .resultBox { font-size: 14px !important; }
            }
            @media (max-width: 380px) {
              h1 { font-size: 18px !important; }
              .card { padding: 6px 1px 8px 1px !important; margin: 0 1px; }
            }
          `}</style>
        </div>
      </div>
    </main>
  );
}
