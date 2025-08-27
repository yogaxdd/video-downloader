import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate TikTok URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    if (!hostname.includes('tiktok.com')) {
      return NextResponse.json({ error: 'Invalid TikTok URL' }, { status: 400 });
    }

    // Call the sankavollerei TikTok download API
    const apiUrl = `https://www.sankavollerei.com/download/tiktok-hd?apikey=planaai&url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from TikTok API' }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.status) {
      return NextResponse.json({ error: data.message || 'Failed to process TikTok URL' }, { status: 400 });
    }

    // Return the download links with multiple options
    return NextResponse.json({
      status: 'success',
      title: data.result.title,
      region: data.result.region,
      duration: data.result.duration,
      links: data.result.links,
      filename: `TikTok_${Date.now()}.mp4`
    });

  } catch (error) {
    console.error('TikTok API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
