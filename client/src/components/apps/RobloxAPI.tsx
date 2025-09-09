// Roblox API Integration for WebOS
export interface RobloxUser {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  robux: number;
  level: number;
  joinDate: string;
}

export interface RobloxGame {
  id: string;
  name: string;
  description: string;
  creator: string;
  placeId: number;
  universeId: number;
  playing: number;
  visits: number;
  maxPlayers: number;
  genre: string;
  thumbnailUrl: string;
  isPlayable: boolean;
  price: number;
}

export interface RobloxFriend {
  id: number;
  username: string;
  displayName: string;
  isOnline: boolean;
  lastLocation?: string;
  avatar: string;
}

export class RobloxAPI {
  private static instance: RobloxAPI;
  private baseUrl = 'https://www.roblox.com';
  private gamesUrl = 'https://games.roblox.com';
  private friendsUrl = 'https://friends.roblox.com';
  
  public static getInstance(): RobloxAPI {
    if (!RobloxAPI.instance) {
      RobloxAPI.instance = new RobloxAPI();
    }
    return RobloxAPI.instance;
  }

  async getPopularGames(): Promise<RobloxGame[]> {
    try {
      // Call the real Roblox Games API
      const response = await fetch('/api/roblox/games/popular', {
        headers: {
          'Authorization': `Bearer ${process.env.ROBLOX_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.games || [];
      }
      
      // Fallback to sample games if API fails
      return [
        {
          id: '1818',
          name: 'MeepCity',
          description: 'The ultimate social hangout!',
          creator: 'alexnewtron',
          placeId: 370731277,
          universeId: 1818,
          playing: 15234,
          visits: 4500000000,
          maxPlayers: 100,
          genre: 'Town and City',
          thumbnailUrl: 'https://tr.rbxcdn.com/game-thumbnails/1818.jpg',
          isPlayable: true,
          price: 0
        },
        {
          id: '2753',
          name: 'Adopt Me!',
          description: 'Raise a family and collect amazing pets!',
          creator: 'DreamCraft',
          placeId: 920587237,
          universeId: 2753,
          playing: 425000,
          visits: 31000000000,
          maxPlayers: 48,
          genre: 'Town and City',
          thumbnailUrl: 'https://tr.rbxcdn.com/game-thumbnails/2753.jpg',
          isPlayable: true,
          price: 0
        },
        {
          id: '4924',
          name: 'Brookhaven 🏡RP',
          description: 'Welcome to Brookhaven, where you can live your dreams!',
          creator: 'Wolfpaq',
          placeId: 4924922222,
          universeId: 4924,
          playing: 312000,
          visits: 15000000000,
          maxPlayers: 12,
          genre: 'Town and City',
          thumbnailUrl: 'https://tr.rbxcdn.com/game-thumbnails/4924.jpg',
          isPlayable: true,
          price: 0
        }
      ];
    } catch (error) {
      console.error('Failed to fetch popular games:', error);
      return [];
    }
  }

  async getUserInfo(userId?: number): Promise<RobloxUser | null> {
    try {
      // This would normally call the Roblox Users API
      return {
        id: userId || 12345,
        username: 'WebOSPlayer',
        displayName: 'WebOS Player',
        avatar: 'https://www.roblox.com/avatar-thumbnail/image?userId=12345&width=420&height=420&format=png',
        robux: 1250,
        level: 42,
        joinDate: '2019-03-15'
      };
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return null;
    }
  }

  async getFriends(userId: number): Promise<RobloxFriend[]> {
    try {
      // This would call the Roblox Friends API
      return [
        {
          id: 67890,
          username: 'BuilderPro123',
          displayName: 'Builder Pro',
          isOnline: true,
          lastLocation: 'MeepCity',
          avatar: 'https://www.roblox.com/avatar-thumbnail/image?userId=67890&width=150&height=150&format=png'
        },
        {
          id: 54321,
          username: 'GameMaster99',
          displayName: 'Game Master',
          isOnline: false,
          avatar: 'https://www.roblox.com/avatar-thumbnail/image?userId=54321&width=150&height=150&format=png'
        }
      ];
    } catch (error) {
      console.error('Failed to fetch friends:', error);
      return [];
    }
  }

  async joinGame(placeId: number): Promise<boolean> {
    try {
      // This would normally launch the Roblox client
      console.log(`Attempting to join game with Place ID: ${placeId}`);
      
      // Show join dialog
      const shouldJoin = confirm(`Join this Roblox game?\n\nPlace ID: ${placeId}\n\nThis will attempt to open the Roblox client.`);
      
      if (shouldJoin) {
        // In a real implementation, this would use the Roblox protocol
        window.open(`roblox://placeId=${placeId}`, '_blank');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to join game:', error);
      return false;
    }
  }

  async searchGames(query: string): Promise<RobloxGame[]> {
    try {
      const allGames = await this.getPopularGames();
      return allGames.filter(game => 
        game.name.toLowerCase().includes(query.toLowerCase()) ||
        game.description.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Failed to search games:', error);
      return [];
    }
  }

  formatNumber(num: number): string {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}