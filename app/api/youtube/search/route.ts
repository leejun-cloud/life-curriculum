import { NextResponse } from 'next/server';
import ytsr from 'ytsr';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const level = searchParams.get('level'); // beginner, intermediate, advanced, etc.
  
  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  // Inject level into query
  let finalQuery = query;
  if (level) {
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
    const filters = await ytsr.getFilters(finalQuery);
    const filterVideo = filters.get('Type')?.get('Video');
    const searchUrl = filterVideo?.url || finalQuery;

    const results = await ytsr(searchUrl, { limit: 20 });
    
    // Transform items
    const videos = results.items
      .filter((item): item is ytsr.Video => item.type === 'video')
      .map(item => {
        // Simple recommendation score: (views / 10000)
        // Ideally we would parse view string "1.2M views" -> number, but ytsr gives text.
        // For MVP we just pass raw data.
        
        return {
          id: item.id,
          title: item.title,
          thumbnail: item.bestThumbnail?.url,
          url: item.url,
          duration: item.duration,
          views: item.views, // e.g. "1.2M views" (number in newer ytsr versions? need to check)
          channel: {
             name: item.author?.name,
             avatar: item.author?.bestAvatar?.url
          },
          uploadedAt: item.uploadedAt 
        };
      });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('YouTube Search Error:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}
