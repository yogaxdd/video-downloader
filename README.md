# Video & Audio Downloader (Frontend + Proxy)

Frontend Next.js untuk download video+audio dari platform: YouTube (via ytdl.siputzx.my.id) dan lainnya (TikTok/IG/Twitter via dl.siputzx.my.id). UI menyediakan pilihan kualitas: 1080p, 720p, 480p, 360p, 240p, 144p. Mode dipaksa video+audio.

## Pengembangan Lokal

1. Install deps
```
npm i
```
2. Jalankan dev server
```
npm run dev
```
Buka http://localhost:3000

## Env (opsional)
- YTDL_API_KEY: jika Anda punya API key untuk endpoint YouTube, set di Vercel/locally.

## Deploy ke Vercel
1. Push repo ke GitHub
2. Import ke Vercel, pilih framework Next.js
3. Set env var (opsional): YTDL_API_KEY
4. Deploy

## Arsitektur
- UI: `app/page.tsx`
- Proxy API:
  - `app/api/dl/route.ts` -> POST ke https://dl.siputzx.my.id
  - `app/api/ytdl/info/route.ts` -> GET info video YouTube
  - `app/api/ytdl/create/route.ts` -> POST buat job
  - `app/api/ytdl/check/route.ts` -> GET status job
  - `app/api/ytdl/get/route.ts` -> GET hasil job (download_url)

Catatan: Untuk YouTube, frontend mencoba memilih format video+audio yang cocok dengan kualitas yang dipilih. Jika `format_id` tidak ditemukan, backend tetap akan membuat job dengan `format_id = null` dan server akan memilih yang terbaik yang tersedia.
