import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate Twitter/X URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    if (!hostname.includes('twitter.com') && !hostname.includes('x.com')) {
      return NextResponse.json({ error: 'Invalid Twitter/X URL' }, { status: 400 });
    }

    // Call the Twitter download API
    const apiUrl = `https://api.ferdev.my.id/downloader/twitter?link=${encodeURIComponent(url)}&apikey=yogaxd-resitaapi`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Twitter API' }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.success) {
      return NextResponse.json({ error: data.message || 'Failed to process Twitter URL' }, { status: 400 });
    }

    // Handle the API response - the example shows basic success, but we'll structure it
    // to handle media data when available
    if (data.data && (data.data.video || data.data.images)) {
      // If media data is available
      const media = [];
      
      if (data.data.video) {
        media.push({
          url: data.data.video,
          type: 'video'
        });
      }
      
      if (data.data.images && Array.isArray(data.data.images)) {
        data.data.images.forEach((img: string) => {
          media.push({
            url: img,
            type: 'image'
          });
        });
      }
      
      return NextResponse.json({
        status: 'success',
        media: media,
        author: data.data.author || 'Twitter User',
        caption: data.data.text || '',
        filename: `Twitter_${Date.now()}.${media[0]?.type === 'video' ? 'mp4' : 'jpg'}`
      });
    } else {
      // Basic success response when no media data is provided
      return NextResponse.json({
        status: 'success',
        message: 'Twitter content processed successfully',
        filename: `Twitter_${Date.now()}.mp4`
      });
    }

  } catch (error) {
    console.error('Twitter API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
