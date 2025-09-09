interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  views: number;
  publishedAt: string;
  channelTitle: string;
  channelId: string;
}

interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: number;
}

class YouTubeService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
  }

  private async makeRequest(endpoint: string, params: Record<string, string>) {
    if (!this.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    const url = new URL(`${this.baseUrl}/${endpoint}`);
    url.searchParams.append('key', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`YouTube API error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    return response.json();
  }

  private parseDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  async getPopularVideos(maxResults: number = 25): Promise<YouTubeVideo[]> {
    try {
      const data = await this.makeRequest('videos', {
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        regionCode: 'US',
        maxResults: maxResults.toString()
      });

      return data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        duration: this.parseDuration(item.contentDetails.duration),
        views: parseInt(item.statistics.viewCount || '0'),
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId
      }));
    } catch (error) {
      console.error('Error fetching popular videos:', error);
      throw error;
    }
  }

  async searchVideos(query: string, maxResults: number = 25): Promise<YouTubeVideo[]> {
    try {
      const searchData = await this.makeRequest('search', {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: maxResults.toString(),
        order: 'relevance'
      });

      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
      
      const videoData = await this.makeRequest('videos', {
        part: 'snippet,statistics,contentDetails',
        id: videoIds
      });

      return videoData.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        duration: this.parseDuration(item.contentDetails.duration),
        views: parseInt(item.statistics.viewCount || '0'),
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId
      }));
    } catch (error) {
      console.error('Error searching videos:', error);
      throw error;
    }
  }

  async getVideosByCategory(categoryId: string, maxResults: number = 25): Promise<YouTubeVideo[]> {
    try {
      const data = await this.makeRequest('videos', {
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        videoCategoryId: categoryId,
        regionCode: 'US',
        maxResults: maxResults.toString()
      });

      return data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        duration: this.parseDuration(item.contentDetails.duration),
        views: parseInt(item.statistics.viewCount || '0'),
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId
      }));
    } catch (error) {
      console.error('Error fetching category videos:', error);
      throw error;
    }
  }

  async getChannelInfo(channelId: string): Promise<YouTubeChannel> {
    try {
      const data = await this.makeRequest('channels', {
        part: 'snippet,statistics',
        id: channelId
      });

      const channel = data.items[0];
      return {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnail: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.medium?.url,
        subscriberCount: parseInt(channel.statistics.subscriberCount || '0')
      };
    } catch (error) {
      console.error('Error fetching channel info:', error);
      throw error;
    }
  }

  getVideoEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  getVideoWatchUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
}

export const youtubeService = new YouTubeService();
export type { YouTubeVideo, YouTubeChannel };