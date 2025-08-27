import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate Instagram URL
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    if (!hostname.includes('instagram.com')) {
      return NextResponse.json({ error: 'Invalid Instagram URL' }, { status: 400 });
    }

    // Call the sankavollerei Instagram download API
    const apiUrl = `https://www.sankavollerei.com/download/instagram?apikey=planaai&url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Instagram API' }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.status) {
      return NextResponse.json({ error: data.message || 'Failed to process Instagram URL' }, { status: 400 });
    }

    // Fix type detection for reels - if URL contains /reels/ and has .mp4, it's a video
    const processedMedia = data.result.media.map((item: any) => {
      let correctedType = item.type;
      
      // If URL contains /reels/ or the media URL contains .mp4, it's likely a video
      if (url.includes('/reels/') || item.url.includes('.mp4')) {
        correctedType = 'video';
      }
      
      return {
        ...item,
        type: correctedType
      };
    });

    // Return the media array with corrected type detection
    return NextResponse.json({
      status: 'success',
      author: data.result.author,
      caption: data.result.caption,
      media: processedMedia,
      filename: `Instagram_${Date.now()}`
    });

  } catch (error) {
    console.error('Instagram API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
