import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate Pinterest URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    if (!hostname.includes('pinterest.com')) {
      return NextResponse.json({ error: 'Invalid Pinterest URL' }, { status: 400 });
    }

    // Call the Pinterest download API
    const apiUrl = `https://api.ferdev.my.id/downloader/pinterest?link=${encodeURIComponent(url)}&apikey=yogaxd-resitaapi`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Pinterest API' }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.success) {
      return NextResponse.json({ error: data.message || 'Failed to process Pinterest URL' }, { status: 400 });
    }

    // Return the download data
    return NextResponse.json({
      status: 'success',
      media: [{
        url: data.data.image || data.data.thumb,
        type: data.data.video ? 'video' : 'image',
        thumbnail: data.data.thumb
      }],
      filename: `Pinterest_${Date.now()}.${data.data.video ? 'mp4' : 'jpg'}`
    });

  } catch (error) {
    console.error('Pinterest API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
