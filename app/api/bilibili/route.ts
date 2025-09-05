import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate Bilibili URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    if (!hostname.includes('bilibili.tv') && !hostname.includes('bilibili.com')) {
      return NextResponse.json({ error: 'Invalid Bilibili URL' }, { status: 400 });
    }

    // Call the Bilibili download API
    const apiUrl = `https://api.ferdev.my.id/downloader/bilibili?link=${encodeURIComponent(url)}&apikey=yogaxd-resitaapi`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Bilibili API' }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.success) {
      return NextResponse.json({ error: data.message || 'Failed to process Bilibili URL' }, { status: 400 });
    }

    // Return the download data
    return NextResponse.json({
      status: 'success',
      title: data.data.title,
      description: data.data.description,
      link: data.data.videoUrl,
      thumbnail: data.data.cover,
      quality: data.data.usedQuality,
      views: data.data.views,
      likes: data.data.like,
      filename: `Bilibili_${data.data.title?.replace(/[^a-zA-Z0-9]/g, '_') || Date.now()}.mp4`
    });

  } catch (error) {
    console.error('Bilibili API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
