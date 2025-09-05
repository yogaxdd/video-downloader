import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, format } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate YouTube URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    if (!hostname.includes('youtube.com') && !hostname.includes('youtu.be')) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // Choose API based on format preference
    let apiUrl;
    if (format === 'mp3') {
      apiUrl = `https://api.ferdev.my.id/downloader/ytmp3?link=${encodeURIComponent(url)}&apikey=yogaxd-resitaapi`;
    } else {
      // Default to MP4 video
      apiUrl = `https://www.sankavollerei.com/download/aio?apikey=planaai&url=${encodeURIComponent(url)}`;
    }
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from YouTube API' }, { status: response.status });
    }

    const data = await response.json();
    
    if (format === 'mp3') {
      if (!data.success) {
        return NextResponse.json({ error: data.message || 'Failed to process YouTube URL' }, { status: 400 });
      }

      // Return MP3 download data
      return NextResponse.json({
        status: 'success',
        title: data.data.title,
        download_url: data.data.dlink,
        thumbnail: data.data.thumbnail,
        duration: data.data.duration,
        size: data.data.size,
        filename: `${data.data.title}.mp3`
      });
    } else {
      if (!data.status) {
        return NextResponse.json({ error: data.message || 'Failed to process YouTube URL' }, { status: 400 });
      }

      // Return MP4 download data
      return NextResponse.json({
        status: 'success',
        title: data.result.title,
        download_url: data.result.download_url,
        filename: `${data.result.title}.mp4`
      });
    }

  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
