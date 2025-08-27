import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate Spotify URL
    if (!url.includes('open.spotify.com')) {
      return NextResponse.json({ error: 'Invalid Spotify URL' }, { status: 400 });
    }

    // Call the Spotify download API
    const apiUrl = `https://www.sankavollerei.com/download/spotify?apikey=planaai&url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Spotify API' }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.status) {
      return NextResponse.json({ error: data.message || 'Failed to process Spotify URL' }, { status: 400 });
    }

    // Return the download link and metadata
    return NextResponse.json({
      status: 'success',
      title: data.data.title,
      artist: data.data.artis,
      image: data.data.image,
      download_url: data.data.download,
      filename: `${data.data.artis} - ${data.data.title}.mp3`
    });

  } catch (error) {
    console.error('Spotify API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
