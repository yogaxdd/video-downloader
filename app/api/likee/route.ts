import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate Likee URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    if (!hostname.includes('likee.video') && !hostname.includes('l.likee.video')) {
      return NextResponse.json({ error: 'Invalid Likee URL' }, { status: 400 });
    }

    // Call the Likee download API
    const apiUrl = `https://api.ferdev.my.id/downloader/likee?link=${encodeURIComponent(url)}&apikey=yogaxd-resitaapi`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Likee API' }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.success) {
      return NextResponse.json({ error: data.message || 'Failed to process Likee URL' }, { status: 400 });
    }

    // Return the download data with multiple quality options
    const links = [];
    
    if (data.downloads.nowm) {
      links.push({
        label: 'No Watermark',
        url: data.downloads.nowm
      });
    }
    
    if (data.downloads.wm) {
      links.push({
        label: 'With Watermark',
        url: data.downloads.wm
      });
    }

    return NextResponse.json({
      status: 'success',
      links: links,
      info: data.info,
      filename: `Likee_${Date.now()}.mp4`
    });

  } catch (error) {
    console.error('Likee API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
