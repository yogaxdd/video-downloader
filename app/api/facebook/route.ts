import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate Facebook URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    if (!hostname.includes('facebook.com') && !hostname.includes('fb.watch')) {
      return NextResponse.json({ error: 'Invalid Facebook URL' }, { status: 400 });
    }

    // Call the sankavollerei Facebook download API
    const apiUrl = `https://www.sankavollerei.com/download/facebook?apikey=planaai&url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Facebook API' }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.status) {
      return NextResponse.json({ error: data.message || 'Failed to process Facebook URL' }, { status: 400 });
    }

    // Return the download links with multiple quality options
    return NextResponse.json({
      status: 'success',
      title: data.result.title,
      duration: data.result.duration,
      thumbnail: data.result.thumbnail,
      video: data.result.video,
      music: data.result.music,
      filename: `Facebook_${Date.now()}.mp4`
    });

  } catch (error) {
    console.error('Facebook API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
