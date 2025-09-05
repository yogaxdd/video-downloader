import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate Threads URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    if (!hostname.includes('threads.net')) {
      return NextResponse.json({ error: 'Invalid Threads URL' }, { status: 400 });
    }

    // Call the Threads download API
    const apiUrl = `https://api.ferdev.my.id/downloader/threads?link=${encodeURIComponent(url)}&apikey=yogaxd-resitaapi`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Threads API' }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.success) {
      return NextResponse.json({ error: data.message || 'Failed to process Threads URL' }, { status: 400 });
    }

    // Return the download data based on content type
    if (data.type === 'video' && data.result) {
      return NextResponse.json({
        status: 'success',
        link: data.result,
        filename: `Threads_${Date.now()}.mp4`
      });
    } else if (data.result) {
      // Handle image or other content types
      return NextResponse.json({
        status: 'success',
        link: data.result,
        filename: `Threads_${Date.now()}.${data.type === 'image' ? 'jpg' : 'mp4'}`
      });
    } else {
      return NextResponse.json({ error: 'No downloadable content found' }, { status: 400 });
    }

  } catch (error) {
    console.error('Threads API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
