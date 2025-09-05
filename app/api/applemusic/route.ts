import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate Apple Music URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    if (!hostname.includes('music.apple.com')) {
      return NextResponse.json({ error: 'Invalid Apple Music URL' }, { status: 400 });
    }

    // Call the Apple Music download API
    const apiUrl = `https://api.ferdev.my.id/downloader/applemusic?link=${encodeURIComponent(url)}&apikey=yogaxd-resitaapi`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Apple Music API' }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.success) {
      return NextResponse.json({ error: data.message || 'Failed to process Apple Music URL' }, { status: 400 });
    }

    // Return the download data
    return NextResponse.json({
      status: 'success',
      link: data.result.dlink,
      title: data.result.name,
      album: data.result.album,
      artist: data.result.artist,
      thumbnail: data.result.thumb,
      duration: data.result.duration,
      filename: `${data.result.artist} - ${data.result.name}.m4a`
    });

  } catch (error) {
    console.error('Apple Music API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
