import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate YouTube URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    if (!hostname.includes('youtube.com') && !hostname.includes('youtu.be')) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // Call the sankavollerei YouTube download API
    const apiUrl = `https://www.sankavollerei.com/download/aio?apikey=planaai&url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from YouTube API' }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.status) {
      return NextResponse.json({ error: data.message || 'Failed to process YouTube URL' }, { status: 400 });
    }

    // Return the download link and metadata
    return NextResponse.json({
      status: 'success',
      title: data.result.title,
      download_url: data.result.download_url,
      filename: `${data.result.title}.mp4`
    });

  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
