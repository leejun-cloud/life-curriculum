import { NextResponse } from 'next/server';
import YouTube from 'youtube-sr';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const level = searchParams.get('level'); // beginner, intermediate, advanced, etc.
  
  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  // Inject level into query
  let finalQuery = query;
  if (level && level !== 'all') {
    switch (level) {
      case 'wangchobo':
        finalQuery += ' 왕초보 기초';
        break;
      case 'beginner':
        finalQuery += ' 초급 기초 강좌';
        break;
      case 'intermediate':
        finalQuery += ' 중급 실무';
        break;
      case 'advanced':
        finalQuery += ' 고급 활용';
        break;
      case 'expert':
        finalQuery += ' 전문가 마스터';
        break;
    }
  }

  try {
    // youtube-sr is often more stable for simple searching
    const videos = await YouTube.search(finalQuery, { limit: 20 });
    
    // Transform items to match our schema
    const results = videos.map(item => {
        return {
          id: item.id,
          title: item.title,
          thumbnail: item.thumbnail?.url || item.thumbnail?.url, // youtube-sr structure
          url: item.url,
          duration: item.durationFormatted,
          views: item.views, 
          channel: {
             name: item.channel?.name,
             avatar: item.channel?.icon?.url
          },
          uploadedAt: item.uploadedAt 
        };
      });

    return NextResponse.json({ videos: results });
  } catch (error) {
    console.error('YouTube Search Error:', error);
    // Return mock data fallback if real search fails during demo/dev to avoid broken UI
    // Or strictly error out.
    // Let's enable a fallback for "demo" purposes if critical, but for now just error.
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}
