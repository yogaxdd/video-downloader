import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate CapCut URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    if (!hostname.includes('capcut.com')) {
      return NextResponse.json({ error: 'Invalid CapCut URL' }, { status: 400 });
    }

    // Call the CapCut download API
    const apiUrl = `https://api.ferdev.my.id/downloader/capcut?link=${encodeURIComponent(url)}&apikey=yogaxd-resitaapi`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from CapCut API' }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.success) {
      return NextResponse.json({ error: data.message || 'Failed to process CapCut URL' }, { status: 400 });
    }

    // Return the download data
    return NextResponse.json({
      status: 'success',
      title: data.data.title,
      author: data.data.author?.name,
      video: [{
        quality: 'HD',
        url: data.data.videoUrl
      }],
      thumbnail: data.data.posterUrl,
      filename: `CapCut_${data.data.title?.replace(/[^a-zA-Z0-9]/g, '_') || Date.now()}.mp4`
    });

  } catch (error) {
    console.error('CapCut API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
