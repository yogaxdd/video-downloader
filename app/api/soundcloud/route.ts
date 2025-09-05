import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate SoundCloud URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    if (!hostname.includes('soundcloud.com')) {
      return NextResponse.json({ error: 'Invalid SoundCloud URL' }, { status: 400 });
    }

    // Call the SoundCloud download API
    const apiUrl = `https://api.ferdev.my.id/downloader/soundcloud?link=${encodeURIComponent(url)}&apikey=yogaxd-resitaapi`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from SoundCloud API' }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.success) {
      return NextResponse.json({ error: data.message || 'Failed to process SoundCloud URL' }, { status: 400 });
    }

    // Return the download data
    return NextResponse.json({
      status: 'success',
      link: data.result.downloadUrl,
      title: data.result.title,
      author: data.result.author,
      thumbnail: data.result.thumbnail,
      genre: data.result.genre,
      filename: `${data.result.author} - ${data.result.title}.mp3`
    });

  } catch (error) {
    console.error('SoundCloud API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
