import { FC, useState, useEffect } from 'react';
import { Play, Upload, Search, ThumbsUp, ThumbsDown, Share, MessageCircle, Bell, User, Settings, Home, TrendingUp, Users, Library, Heart, Eye, Clock, Loader2, RefreshCw, PlaySquare, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  subscribers: number;
  verified: boolean;
  joinDate: string;
}

interface Comment {
  id: string;
  videoId: string;
  author: User;
  text: string;
  timestamp: string;
  likes: number;
  replies: Comment[];
}

interface Playlist {
  id: string;
  title: string;
  description: string;
  creator: string;
  creatorId: string;
  thumbnail: string;
  videoCount: number;
  totalDuration: string;
  createdAt: string;
  videos: YouTubeVideo[];
  isPublic: boolean;
}

const sampleUsers: User[] = [
  {
    id: 'user1',
    username: 'techguru',
    displayName: 'Tech Guru',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech',
    subscribers: 1250000,
    verified: true,
    joinDate: '2019-03-15'
  },
  {
    id: 'user2',
    username: 'gamemaster',
    displayName: 'Game Master',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=game',
    subscribers: 850000,
    verified: true,
    joinDate: '2020-07-22'
  },
  {
    id: 'user3',
    username: 'cookingwithsarah',
    displayName: 'Cooking with Sarah',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cooking',
    subscribers: 2100000,
    verified: true,
    joinDate: '2018-11-08'
  },
  {
    id: 'user4',
    username: 'fitnessjoe',
    displayName: 'Fitness Joe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fitness',
    subscribers: 675000,
    verified: true,
    joinDate: '2021-01-10'
  }
];

// Diverse video content categories
const fallbackVideos: YouTubeVideo[] = [
  // Gaming Content - GeekaWhat & Bog
  {
    id: 'geeka1',
    title: 'GeekaWhat: The Evolution of Gaming Graphics - 1980 to 2024',
    description: 'An incredible journey through gaming graphics evolution, showcasing how far we have come from pixels to photorealism.',
    thumbnail: 'https://i.ytimg.com/vi/ROjZy1WbCIA/maxresdefault.jpg',
    duration: '25:45',
    views: 3200000,
    publishedAt: '2024-03-15T00:00:00Z',
    channelTitle: 'GeekaWhat',
    channelId: 'geekawhat'
  },
  {
    id: 'bog1',
    title: 'Bog: Speedrunning Elden Ring in Under 2 Hours',
    description: 'Watch Bog attempt to speedrun Elden Ring using the most optimized strategies and routing techniques.',
    thumbnail: 'https://i.ytimg.com/vi/NCwa_xi0Uuc/maxresdefault.jpg',
    duration: '1:58:30',
    views: 1800000,
    publishedAt: '2024-03-12T00:00:00Z',
    channelTitle: 'Bog',
    channelId: 'bog_speedruns'
  },
  // Tech Content - Linus Tech Tips
  {
    id: 'ltt1',
    title: 'Linus Tech Tips: Building a $5000 Gaming PC - Ultimate Performance',
    description: 'We build the ultimate gaming PC with top-tier components. Does more money really mean better performance?',
    thumbnail: 'https://i.ytimg.com/vi/BwuLxPH8IDs/maxresdefault.jpg',
    duration: '18:22',
    views: 4500000,
    publishedAt: '2024-03-10T00:00:00Z',
    channelTitle: 'Linus Tech Tips',
    channelId: 'linustechtips'
  },
  {
    id: 'ltt2',
    title: 'Linus Tech Tips: RTX 4090 vs RTX 4080 - Is the Price Worth It?',
    description: 'Comprehensive testing of NVIDIA RTX 4090 vs 4080 across games, productivity, and value metrics.',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '15:45',
    views: 6200000,
    publishedAt: '2024-03-08T00:00:00Z',
    channelTitle: 'Linus Tech Tips',
    channelId: 'linustechtips'
  },
  // SFM Content
  {
    id: 'sfm1',
    title: 'Team Fortress 2 SFM: The Ultimate Spy vs Engineer Battle',
    description: 'An epic Source Filmmaker animation featuring an intense battle between Spy and Engineer with cinematic quality.',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '8:30',
    views: 2100000,
    publishedAt: '2024-03-14T00:00:00Z',
    channelTitle: 'SFM Cinema',
    channelId: 'sfm_cinema'
  },
  {
    id: 'sfm2',
    title: 'Half-Life SFM: Gordon Freeman vs G-Man - Epic Confrontation',
    description: 'A stunning Source Filmmaker short film depicting the ultimate confrontation between Gordon Freeman and G-Man.',
    thumbnail: 'https://i.ytimg.com/vi/BwuLxPH8IDs/maxresdefault.jpg',
    duration: '12:15',
    views: 1750000,
    publishedAt: '2024-03-11T00:00:00Z',
    channelTitle: 'Valve Animations',
    channelId: 'valve_animations'
  },
  // Programming Content
  {
    id: 'prog1',
    title: 'JavaScript: Build a Full-Stack App in 1 Hour',
    description: 'Complete tutorial covering React frontend, Node.js backend, and MongoDB database integration.',
    thumbnail: 'https://i.ytimg.com/vi/ROjZy1WbCIA/maxresdefault.jpg',
    duration: '1:02:30',
    views: 890000,
    publishedAt: '2024-03-13T00:00:00Z',
    channelTitle: 'Code Academy Pro',
    channelId: 'code_academy_pro'
  },
  {
    id: 'prog2',
    title: 'Python: Machine Learning for Beginners - Complete Course',
    description: 'Learn machine learning fundamentals with Python, covering scikit-learn, pandas, and real-world projects.',
    thumbnail: 'https://i.ytimg.com/vi/NCwa_xi0Uuc/maxresdefault.jpg',
    duration: '3:15:45',
    views: 1320000,
    publishedAt: '2024-03-09T00:00:00Z',
    channelTitle: 'Python Mastery',
    channelId: 'python_mastery'
  },
  {
    id: 'prog3',
    title: 'React vs Vue vs Angular: 2024 Framework Comparison',
    description: 'Comprehensive comparison of the top JavaScript frameworks with performance tests and real-world examples.',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '28:45',
    views: 567000,
    publishedAt: '2024-03-07T00:00:00Z',
    channelTitle: 'Frontend Masters',
    channelId: 'frontend_masters'
  },
  // More Gaming
  {
    id: 'gaming1',
    title: 'Minecraft: Building a Functional Computer Inside the Game',
    description: 'Watch as we build a working computer using redstone circuits in Minecraft - it actually runs programs!',
    thumbnail: 'https://i.ytimg.com/vi/BwuLxPH8IDs/maxresdefault.jpg',
    duration: '42:20',
    views: 5800000,
    publishedAt: '2024-03-06T00:00:00Z',
    channelTitle: 'Redstone Engineers',
    channelId: 'redstone_engineers'
  },
  {
    id: 'gaming2',
    title: 'Counter-Strike 2: Professional Movement Guide',
    description: 'Learn advanced movement techniques used by professional CS2 players to gain competitive advantage.',
    thumbnail: 'https://i.ytimg.com/vi/ROjZy1WbCIA/maxresdefault.jpg',
    duration: '22:35',
    views: 1450000,
    publishedAt: '2024-03-05T00:00:00Z',
    channelTitle: 'CS Pro Guide',
    channelId: 'cs_pro_guide'
  },
  // DanTDM Content
  {
    id: 'dantdm1',
    title: 'DanTDM: Minecraft Hardcore Survival - Episode 200 FINALE!',
    description: 'The epic conclusion to DanTDM hardcore survival series! After 200 episodes, will he finally defeat the Ender Dragon?',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '35:42',
    views: 8500000,
    publishedAt: '2024-03-14T00:00:00Z',
    channelTitle: 'DanTDM',
    channelId: 'dantdm'
  },
  {
    id: 'dantdm2',
    title: 'DanTDM: I Built the BIGGEST Minecraft Castle Ever!',
    description: 'DanTDM spends 10 hours building an absolutely massive castle in Minecraft with incredible detail and secret rooms.',
    thumbnail: 'https://i.ytimg.com/vi/BwuLxPH8IDs/maxresdefault.jpg',
    duration: '28:15',
    views: 12300000,
    publishedAt: '2024-03-12T00:00:00Z',
    channelTitle: 'DanTDM',
    channelId: 'dantdm'
  },
  {
    id: 'dantdm3',
    title: 'DanTDM: Reacting to My First Ever Minecraft Video!',
    description: 'DanTDM reacts to his very first Minecraft video from 10 years ago and reflects on his YouTube journey.',
    thumbnail: 'https://i.ytimg.com/vi/NCwa_xi0Uuc/maxresdefault.jpg',
    duration: '18:30',
    views: 6700000,
    publishedAt: '2024-03-10T00:00:00Z',
    channelTitle: 'DanTDM',
    channelId: 'dantdm'
  },
  {
    id: 'dantdm4',
    title: 'DanTDM: Testing Viral Minecraft Tricks - Do They Actually Work?',
    description: 'DanTDM tests the most popular Minecraft tricks and hacks from TikTok and YouTube to see if they really work.',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '24:45',
    views: 9800000,
    publishedAt: '2024-03-08T00:00:00Z',
    channelTitle: 'DanTDM',
    channelId: 'dantdm'
  },
  {
    id: 'dantdm5',
    title: 'DanTDM: Among Us But Its Actually Minecraft!',
    description: 'DanTDM plays a custom Among Us map built entirely in Minecraft with his friends - chaos ensues!',
    thumbnail: 'https://i.ytimg.com/vi/ROjZy1WbCIA/maxresdefault.jpg',
    duration: '32:20',
    views: 15400000,
    publishedAt: '2024-03-06T00:00:00Z',
    channelTitle: 'DanTDM',
    channelId: 'dantdm'
  },
  // More Programming
  {
    id: 'prog4',
    title: 'Rust Programming: Building a Web Server from Scratch',
    description: 'Learn Rust by building a high-performance web server with async/await and advanced error handling.',
    thumbnail: 'https://i.ytimg.com/vi/NCwa_xi0Uuc/maxresdefault.jpg',
    duration: '1:18:20',
    views: 425000,
    publishedAt: '2024-03-04T00:00:00Z',
    channelTitle: 'Rust Systems',
    channelId: 'rust_systems'
  },
  {
    id: 'prog5',
    title: 'TypeScript: Advanced Patterns and Best Practices',
    description: 'Deep dive into TypeScript advanced features including generics, decorators, and type manipulation.',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '45:15',
    views: 680000,
    publishedAt: '2024-03-03T00:00:00Z',
    channelTitle: 'TypeScript Guru',
    channelId: 'typescript_guru'
  },
  // More DanTDM Content
  {
    id: 'dantdm6',
    title: 'DanTDM: I Spent 24 Hours in a Minecraft Horror Map',
    description: 'DanTDM attempts to survive 24 hours in the scariest Minecraft horror map ever created. Will he make it through the night?',
    thumbnail: 'https://i.ytimg.com/vi/BwuLxPH8IDs/maxresdefault.jpg',
    duration: '41:30',
    views: 18700000,
    publishedAt: '2024-03-04T00:00:00Z',
    channelTitle: 'DanTDM',
    channelId: 'dantdm'
  },
  {
    id: 'dantdm7',
    title: 'DanTDM: Minecraft But Every Block is Different',
    description: 'DanTDM plays Minecraft with a crazy mod where every single block behaves completely differently. Chaos ensues!',
    thumbnail: 'https://i.ytimg.com/vi/NCwa_xi0Uuc/maxresdefault.jpg',
    duration: '26:45',
    views: 14200000,
    publishedAt: '2024-03-02T00:00:00Z',
    channelTitle: 'DanTDM',
    channelId: 'dantdm'
  },
  {
    id: 'dantdm8',
    title: 'DanTDM: Building the Most Secure Minecraft Base Ever',
    description: 'DanTDM creates the ultimate secure base in Minecraft with redstone traps, hidden entrances, and unbreakable defenses.',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '33:15',
    views: 11800000,
    publishedAt: '2024-02-28T00:00:00Z',
    channelTitle: 'DanTDM',
    channelId: 'dantdm'
  },
  {
    id: 'proglang1',
    title: 'I Created My Own Programming Language!',
    description: 'Building a custom programming language from scratch using Rust. Complete lexer, parser, and interpreter implementation.',
    thumbnail: 'https://i.ytimg.com/vi/Cz2gO51bD4g/maxresdefault.jpg',
    duration: '28:45',
    views: 750000,
    publishedAt: '2024-02-10T00:00:00Z',
    channelTitle: 'CodeCrafters',
    channelId: 'codecrafters'
  },
  
  // Gaming Content - Sampey Style
  {
    id: 'sampey1',
    title: 'GTA San Andreas Multiplayer - Epic Gang War!',
    description: 'Join me for an intense gang war battle in SA:MP with crazy stunts and epic moments!',
    thumbnail: 'https://i.ytimg.com/vi/qI6yQwh3A78/maxresdefault.jpg',
    duration: '15:32',
    views: 3200000,
    publishedAt: '2024-02-05T00:00:00Z',
    channelTitle: 'Sampey',
    channelId: 'sampey_official'
  },
  
  // DanTDM Style Gaming
  {
    id: 'dantdm1',
    title: 'Minecraft: Testing CRAZY New Mods!',
    description: 'Today we are testing some absolutely insane Minecraft mods that completely change the game!',
    thumbnail: 'https://i.ytimg.com/vi/F0eYU1XvL4E/maxresdefault.jpg',
    duration: '20:15',
    views: 5400000,
    publishedAt: '2024-02-12T00:00:00Z',
    channelTitle: 'DanTDM',
    channelId: 'dantdm_official'
  },
  
  // Roblox Content
  {
    id: 'roblox1',
    title: 'Building the ULTIMATE Roblox Obby!',
    description: 'Creating the most challenging obby course in Roblox Studio with impossible jumps and secret areas!',
    thumbnail: 'https://i.ytimg.com/vi/pRpeEdMmmQ0/maxresdefault.jpg',
    duration: '18:47',
    views: 2800000,
    publishedAt: '2024-02-08T00:00:00Z',
    channelTitle: 'RobloxMaster',
    channelId: 'robloxmaster'
  },
  {
    id: 'roblox2',
    title: 'Roblox Brookhaven RP - Family Roleplay!',
    description: 'Living my best life in Brookhaven with crazy family adventures and roleplaying scenarios!',
    thumbnail: 'https://i.ytimg.com/vi/x8VYWazR5mE/maxresdefault.jpg',
    duration: '22:33',
    views: 4100000,
    publishedAt: '2024-02-14T00:00:00Z',
    channelTitle: 'BrookhavenQueen',
    channelId: 'brookhavenqueen'
  },
  
  // TF2 SFM Content
  {
    id: 'tf2sfm1',
    title: 'TF2 SFM: Heavy vs Scout Epic Battle',
    description: 'An epic Source Filmmaker animation featuring Heavy and Scout in an intense battle with amazing cinematics!',
    thumbnail: 'https://i.ytimg.com/vi/junBCVaJYkA/maxresdefault.jpg',
    duration: '8:15',
    views: 1200000,
    publishedAt: '2024-01-28T00:00:00Z',
    channelTitle: 'SFM Animator',
    channelId: 'sfmanimator'
  },
  {
    id: 'tf2sfm2',
    title: 'Team Fortress 2 - Meet the Pyro Remake SFM',
    description: 'A complete remake of the classic "Meet the Pyro" video using advanced Source Filmmaker techniques.',
    thumbnail: 'https://i.ytimg.com/vi/WUhOnX8qt3I/maxresdefault.jpg',
    duration: '4:32',
    views: 890000,
    publishedAt: '2024-02-03T00:00:00Z',
    channelTitle: 'TF2 Remastered',
    channelId: 'tf2remastered'
  },
  
  // More Gaming & Entertainment
  {
    id: 'minecraft1',
    title: 'Minecraft but Everything is BACKWARDS!',
    description: 'What happens when you play Minecraft completely backwards? This experiment will blow your mind!',
    thumbnail: 'https://i.ytimg.com/vi/hFZFjoX2cGg/maxresdefault.jpg',
    duration: '16:28',
    views: 3500000,
    publishedAt: '2024-02-16T00:00:00Z',
    channelTitle: 'PopularMMOs',
    channelId: 'popularmmos'
  },
  {
    id: 'L_jWHffIx5E',
    title: 'Smash Mouth - All Star (Official Music Video)',
    description: 'Official music video for All Star by Smash Mouth from the album Astro Lounge.',
    thumbnail: 'https://i.ytimg.com/vi/L_jWHffIx5E/maxresdefault.jpg',
    duration: '3:21',
    views: 800000000,
    publishedAt: '2009-06-16T00:00:00Z',
    channelTitle: 'Smash Mouth',
    channelId: 'UCLp3yEOdE6Cwe1D3xqKiPBw'
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Despacito ft. Daddy Yankee',
    description: '"Despacito" available on iTunes: http://smarturl.it/DespacitoiTunes Listen on Spotify: http://smarturl.it/DespacitoSpotify',
    thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
    duration: '4:42',
    views: 8100000000,
    publishedAt: '2017-01-12T00:00:00Z',
    channelTitle: 'Luis Fonsi',
    channelId: 'UCmT5bgI_8Ux3qE88L-o2bOQ'
  },
  {
    id: 'YQHsXMglC9A',
    title: 'Adele - Hello (Official Music Video)',
    description: 'Official music video for Hello by Adele from the album 25.',
    thumbnail: 'https://i.ytimg.com/vi/YQHsXMglC9A/maxresdefault.jpg',
    duration: '6:07',
    views: 3200000000,
    publishedAt: '2015-10-22T00:00:00Z',
    channelTitle: 'Adele',
    channelId: 'UCsRM0YB_dabtEPGPTKo-gcw'
  },
  {
    id: '9bZkp7q19f0',
    title: 'PSY - GANGNAM STYLE(강남스타일) M/V',
    description: 'PSY - GANGNAM STYLE(강남스타일) M/V @ https://youtu.be/9bZkp7q19f0',
    thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/maxresdefault.jpg',
    duration: '4:13',
    views: 4800000000,
    publishedAt: '2012-07-15T00:00:00Z',
    channelTitle: 'officialpsy',
    channelId: 'UCrDkAvF9ZWdo5OukAhI7H3Q'
  },
  {
    id: 'JGwWNGJdvx8',
    title: 'Ed Sheeran - Shape of You (Official Video)',
    description: 'Ed Sheeran - Shape of You (Official Video)',
    thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/maxresdefault.jpg',
    duration: '3:54',
    views: 5700000000,
    publishedAt: '2017-01-30T00:00:00Z',
    channelTitle: 'Ed Sheeran',
    channelId: 'UC0C-w0YjGpqDXGB8IHb662A'
  },
  {
    id: 'CevxZvSJLk8',
    title: 'Katy Perry - Roar (Official)',
    description: 'Katy Perry - Roar (Official) from Prism',
    thumbnail: 'https://i.ytimg.com/vi/CevxZvSJLk8/maxresdefault.jpg',
    duration: '3:43',
    views: 3500000000,
    publishedAt: '2013-09-05T00:00:00Z',
    channelTitle: 'Katy Perry',
    channelId: 'UC347FC-2Zj5MTtMfsTc97xQ'
  },
  {
    id: 'RgKAFK5djSk',
    title: 'Wiz Khalifa - See You Again ft. Charlie Puth [Official Video]',
    description: 'From "Furious 7" Original Motion Picture Soundtrack',
    thumbnail: 'https://i.ytimg.com/vi/RgKAFK5djSk/maxresdefault.jpg',
    duration: '3:57',
    views: 5300000000,
    publishedAt: '2015-04-06T00:00:00Z',
    channelTitle: 'Wiz Khalifa',
    channelId: 'UCGwegR-rWjYETlrwNzJTNFQ'
  },
  {
    id: 'hT_nvWreIhg',
    title: 'Mark Ronson - Uptown Funk (Official Video) ft. Bruno Mars',
    description: 'Mark Ronson - Uptown Funk (Official Video) ft. Bruno Mars',
    thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/maxresdefault.jpg',
    duration: '4:30',
    views: 4500000000,
    publishedAt: '2014-11-19T00:00:00Z',
    channelTitle: 'Mark Ronson',
    channelId: 'UCBnxxPnWlJjdTvnxIh6M14Q'
  },
  {
    id: 'lp-EO5I60KA',
    title: 'Thinking Out Loud - Ed Sheeran (Official Video)',
    description: 'Ed Sheeran - Thinking Out Loud (Official Video)',
    thumbnail: 'https://i.ytimg.com/vi/lp-EO5I60KA/maxresdefault.jpg',
    duration: '4:41',
    views: 3100000000,
    publishedAt: '2014-10-07T00:00:00Z',
    channelTitle: 'Ed Sheeran',
    channelId: 'UC0C-w0YjGpqDXGB8IHb662A'
  },
  {
    id: 'pt8VYOfr8To',
    title: 'Taylor Swift - We Are Never Ever Getting Back Together',
    description: 'Music video by Taylor Swift performing We Are Never Ever Getting Back Together.',
    thumbnail: 'https://i.ytimg.com/vi/pt8VYOfr8To/maxresdefault.jpg',
    duration: '3:13',
    views: 1200000000,
    publishedAt: '2012-08-30T00:00:00Z',
    channelTitle: 'Taylor Swift',
    channelId: 'UCqECaJ8Gagnn7YCbPEzWH6g'
  },
  {
    id: 'M11SvDtPBhA',
    title: 'Maroon 5 - Sugar (Official Music Video)',
    description: 'Maroon 5 - Sugar (Official Music Video)',
    thumbnail: 'https://i.ytimg.com/vi/M11SvDtPBhA/maxresdefault.jpg',
    duration: '3:55',
    views: 3400000000,
    publishedAt: '2015-01-14T00:00:00Z',
    channelTitle: 'Maroon 5',
    channelId: 'UC78fGeRSClyf9g0IqI9vJlA'
  },
  {
    id: 'QcIy9NiNbmo',
    title: 'Taylor Swift - Bad Blood ft. Kendrick Lamar',
    description: 'Taylor Swift - Bad Blood ft. Kendrick Lamar (Official Music Video)',
    thumbnail: 'https://i.ytimg.com/vi/QcIy9NiNbmo/maxresdefault.jpg',
    duration: '4:04',
    views: 1600000000,
    publishedAt: '2015-05-17T00:00:00Z',
    channelTitle: 'Taylor Swift',
    channelId: 'UCqECaJ8Gagnn7YCbPEzWH6g'
  },
  {
    id: 'OPf0YbXqDm0',
    title: 'Mark Ronson - Uptown Funk ft. Bruno Mars',
    description: 'Mark Ronson - Uptown Funk ft. Bruno Mars (Official Video)',
    thumbnail: 'https://i.ytimg.com/vi/OPf0YbXqDm0/maxresdefault.jpg',
    duration: '4:30',
    views: 4500000000,
    publishedAt: '2014-11-19T00:00:00Z',
    channelTitle: 'Mark Ronson',
    channelId: 'UCBnxxPnWlJjdTvnxIh6M14Q'
  },
  {
    id: 'nfWlot6h_JM',
    title: 'Taylor Swift - Shake It Off',
    description: 'Get the song on iTunes: http://smarturl.it/1989deluxe',
    thumbnail: 'https://i.ytimg.com/vi/nfWlot6h_JM/maxresdefault.jpg',
    duration: '3:39',
    views: 3200000000,
    publishedAt: '2014-08-18T00:00:00Z',
    channelTitle: 'Taylor Swift',
    channelId: 'UCqECaJ8Gagnn7YCbPEzWH6g'
  },
  {
    id: 'FlsCjmMhFmw',
    title: 'Baby Shark Dance | #babyshark Most Viewed Video on YouTube',
    description: 'Baby Shark Dance | #babyshark Most Viewed Video on YouTube | PINKFONG Songs for Children',
    thumbnail: 'https://i.ytimg.com/vi/FlsCjmMhFmw/maxresdefault.jpg',
    duration: '2:17',
    views: 13000000000,
    publishedAt: '2016-06-17T00:00:00Z',
    channelTitle: 'Pinkfong Baby Shark - Kids\' Songs & Stories',
    channelId: 'UCcdwLMPsaU2ezNSJU1nFoBQ'
  },
  {
    id: 'uelHwf8o7_U',
    title: 'Eminem - Love The Way You Lie ft. Rihanna',
    description: 'Music video by Eminem performing Love The Way You Lie featuring Rihanna.',
    thumbnail: 'https://i.ytimg.com/vi/uelHwf8o7_U/maxresdefault.jpg',
    duration: '4:23',
    views: 2200000000,
    publishedAt: '2010-08-05T00:00:00Z',
    channelTitle: 'Eminem',
    channelId: 'UCedvOgsKFzcK3hA5taf3KoQ'
  },
  {
    id: 'mWRsgZuwf_8',
    title: 'Gangnam Style - Behind the Scenes',
    description: 'Behind the scenes of PSY - GANGNAM STYLE M/V',
    thumbnail: 'https://i.ytimg.com/vi/mWRsgZuwf_8/maxresdefault.jpg',
    duration: '3:45',
    views: 450000000,
    publishedAt: '2012-08-15T00:00:00Z',
    channelTitle: 'officialpsy',
    channelId: 'UCrDkAvF9ZWdo5OukAhI7H3Q'
  },
  {
    id: 'rYEDA3JcQqw',
    title: 'Adele - Rolling in the Deep (Official Music Video)',
    description: 'Adele - Rolling in the Deep (Official Music Video)',
    thumbnail: 'https://i.ytimg.com/vi/rYEDA3JcQqw/maxresdefault.jpg',
    duration: '3:48',
    views: 2100000000,
    publishedAt: '2010-11-29T00:00:00Z',
    channelTitle: 'Adele',
    channelId: 'UCsRM0YB_dabtEPGPTKo-gcw'
  },
  // Tech and Programming Videos
  {
    id: 'Mus_vwhTCq0',
    title: 'JavaScript in 100 Seconds',
    description: 'Learn the basics of JavaScript in 100 seconds. From variables to functions, this video covers the essential concepts every developer should know.',
    thumbnail: 'https://i.ytimg.com/vi/Mus_vwhTCq0/maxresdefault.jpg',
    duration: '2:44',
    views: 2800000,
    publishedAt: '2021-04-20T00:00:00Z',
    channelTitle: 'Fireship',
    channelId: 'UCsBjURrPoezykLs9EqgamOA'
  },
  {
    id: 'SqcY0GlETPk',
    title: 'React in 100 Seconds',
    description: 'Learn React.js fundamentals in 100 seconds. Understand components, JSX, state, and props in this quick tutorial.',
    thumbnail: 'https://i.ytimg.com/vi/SqcY0GlETPk/maxresdefault.jpg',
    duration: '2:31',
    views: 1900000,
    publishedAt: '2020-08-11T00:00:00Z',
    channelTitle: 'Fireship',
    channelId: 'UCsBjURrPoezykLs9EqgamOA'
  },
  {
    id: 'zOjov-2OZ0E',
    title: 'Docker Explained in 100 Seconds',
    description: 'Docker containers explained for beginners. Learn containerization, images, and why Docker revolutionized software deployment.',
    thumbnail: 'https://i.ytimg.com/vi/zOjov-2OZ0E/maxresdefault.jpg',
    duration: '2:07',
    views: 2200000,
    publishedAt: '2021-03-15T00:00:00Z',
    channelTitle: 'Fireship',
    channelId: 'UCsBjURrPoezykLs9EqgamOA'
  },
  {
    id: 'y8OnoxKotPQ',
    title: 'The Complete Linux Course: Beginner to Power User!',
    description: 'Master Linux from scratch! This comprehensive course covers command line, file systems, networking, and system administration.',
    thumbnail: 'https://i.ytimg.com/vi/y8OnoxKotPQ/maxresdefault.jpg',
    duration: '7:23:42',
    views: 1400000,
    publishedAt: '2022-01-10T00:00:00Z',
    channelTitle: 'freeCodeCamp.org',
    channelId: 'UC8butISFwT-Wl7EV0hUK0BQ'
  },
  {
    id: 'ROjZy1WbCIA',
    title: 'Vim Basics in 8 Minutes',
    description: 'Learn Vim text editor basics in 8 minutes. Essential commands, modes, and tips to become productive with Vim.',
    thumbnail: 'https://i.ytimg.com/vi/ROjZy1WbCIA/maxresdefault.jpg',
    duration: '8:12',
    views: 890000,
    publishedAt: '2021-09-22T00:00:00Z',
    channelTitle: 'tutoriaLinux',
    channelId: 'UCvA_wgsX6eFAOXI8Rbg_WiQ'
  },
  {
    id: 'SPTfmiYiuok',
    title: 'Learn Python - Full Course for Beginners [Tutorial]',
    description: 'Complete Python tutorial for beginners. Learn programming fundamentals, data types, functions, and object-oriented programming.',
    thumbnail: 'https://i.ytimg.com/vi/SPTfmiYiuok/maxresdefault.jpg',
    duration: '4:26:52',
    views: 25000000,
    publishedAt: '2018-07-11T00:00:00Z',
    channelTitle: 'freeCodeCamp.org',
    channelId: 'UC8butISFwT-Wl7EV0hUK0BQ'
  },
  {
    id: 'PkZNo7MFNFg',
    title: 'Learn JavaScript - Full Course for Beginners',
    description: 'Complete JavaScript course covering ES6+, DOM manipulation, async programming, and modern development practices.',
    thumbnail: 'https://i.ytimg.com/vi/PkZNo7MFNFg/maxresdefault.jpg',
    duration: '3:26:41',
    views: 18000000,
    publishedAt: '2018-12-18T00:00:00Z',
    channelTitle: 'freeCodeCamp.org',
    channelId: 'UC8butISFwT-Wl7EV0hUK0BQ'
  },
  {
    id: 'ZtqBQ68cfJc',
    title: 'Node.js Tutorial for Beginners: Learn Node in 1 Hour',
    description: 'Complete Node.js tutorial covering modules, npm, Express.js, and building REST APIs. Perfect for backend development.',
    thumbnail: 'https://i.ytimg.com/vi/ZtqBQ68cfJc/maxresdefault.jpg',
    duration: '1:08:35',
    views: 3200000,
    publishedAt: '2018-01-16T00:00:00Z',
    channelTitle: 'Programming with Mosh',
    channelId: 'UCWv7vMbMWH4-V0ZXdmDpPBA'
  },
  // Gaming Videos
  {
    id: 'XHrskkHf958',
    title: 'Minecraft but I survive in ONLY the Nether for 100 Days',
    description: 'Surviving 100 days in Minecraft Nether-only challenge. Building, farming, and exploring the dangerous Nether dimension.',
    thumbnail: 'https://i.ytimg.com/vi/XHrskkHf958/maxresdefault.jpg',
    duration: '36:42',
    views: 15000000,
    publishedAt: '2021-05-15T00:00:00Z',
    channelTitle: 'Luke TheNotable',
    channelId: 'UC6JKng_wYLO9H_LYFGUOqKQ'
  },
  {
    id: 'qmRe0fdt7Ag',
    title: 'The History of Speedrunning',
    description: 'Complete history of video game speedrunning from arcade era to modern world records. Featuring legendary runs and runners.',
    thumbnail: 'https://i.ytimg.com/vi/qmRe0fdt7Ag/maxresdefault.jpg',
    duration: '1:23:17',
    views: 4200000,
    publishedAt: '2020-11-03T00:00:00Z',
    channelTitle: 'Summoning Salt',
    channelId: 'UCtUbO6rBht0daVIOGML3c8w'
  },
  {
    id: 'AjGXn249Fc0',
    title: 'Getting Over It with Bennett Foddy - Complete Analysis',
    description: 'Deep dive into the philosophy and design of Getting Over It. How frustration became art in this climbing simulator.',
    thumbnail: 'https://i.ytimg.com/vi/AjGXn249Fc0/maxresdefault.jpg',
    duration: '27:43',
    views: 8900000,
    publishedAt: '2017-12-08T00:00:00Z',
    channelTitle: 'Joseph Anderson',
    channelId: 'UCyhnYIvIKK_--PiJXCMKxQQ'
  },
  {
    id: 'kpk2tdsPh0A',
    title: 'Portal 2 - The Perpetual Testing Initiative',
    description: 'Portal 2 level editor and community maps showcase. Creating impossible puzzles with advanced portal mechanics.',
    thumbnail: 'https://i.ytimg.com/vi/kpk2tdsPh0A/maxresdefault.jpg',
    duration: '19:32',
    views: 2100000,
    publishedAt: '2012-04-26T00:00:00Z',
    channelTitle: 'Valve',
    channelId: 'UCKaOkELCp-5juVQB1qKDhng'
  },
  // Linux and System Administration
  {
    id: 'V1y-mbWM3B8',
    title: 'Linux Server Setup and Hardening',
    description: 'Complete guide to setting up and securing a Linux server. Firewall configuration, SSH hardening, and security best practices.',
    thumbnail: 'https://i.ytimg.com/vi/V1y-mbWM3B8/maxresdefault.jpg',
    duration: '42:17',
    views: 567000,
    publishedAt: '2022-03-12T00:00:00Z',
    channelTitle: 'NetworkChuck',
    channelId: 'UC9x0AN7BWHpCDHSm9NiJFJQ'
  },
  {
    id: 'gMsAS-mGQ_4',
    title: 'Bash Scripting Tutorial for Beginners',
    description: 'Learn Bash scripting from basics to advanced topics. Automation, system administration, and shell programming essentials.',
    thumbnail: 'https://i.ytimg.com/vi/gMsAS-mGQ_4/maxresdefault.jpg',
    duration: '1:32:45',
    views: 890000,
    publishedAt: '2021-08-15T00:00:00Z',
    channelTitle: 'tutoriaLinux',
    channelId: 'UCvA_wgsX6eFAOXI8Rbg_WiQ'
  },
  {
    id: 'mBykDHjVOgU',
    title: 'Arch Linux Installation Guide 2024',
    description: 'Complete Arch Linux installation guide with UEFI, encryption, and desktop environment setup. From bootable USB to full system.',
    thumbnail: 'https://i.ytimg.com/vi/mBykDHjVOgU/maxresdefault.jpg',
    duration: '52:33',
    views: 423000,
    publishedAt: '2024-01-08T00:00:00Z',
    channelTitle: 'Mental Outlaw',
    channelId: 'UC7YOGHUfC1Tb6E4pudI9STA'
  },
  {
    id: 'rOpo6CQtAuE',
    title: 'Docker Compose Tutorial - Multi-Container Applications',
    description: 'Master Docker Compose for multi-container applications. Microservices, databases, and orchestration made simple.',
    thumbnail: 'https://i.ytimg.com/vi/rOpo6CQtAuE/maxresdefault.jpg',
    duration: '28:19',
    views: 1200000,
    publishedAt: '2022-06-20T00:00:00Z',
    channelTitle: 'TechWorld with Nana',
    channelId: 'UCdngmbVKX1Tgre699-XLlUA'
  },
  // Additional Programming and Web Development
  {
    id: 'rfscVS0vtbw',
    title: 'Learn CSS Grid in 20 Minutes',
    description: 'Complete CSS Grid tutorial covering grid containers, grid items, responsive layouts, and advanced grid techniques.',
    thumbnail: 'https://i.ytimg.com/vi/rfscVS0vtbw/maxresdefault.jpg',
    duration: '21:45',
    views: 1800000,
    publishedAt: '2019-03-14T00:00:00Z',
    channelTitle: 'Web Dev Simplified',
    channelId: 'UCFbNIlppjAuEX4znoulh0Cw'
  },
  {
    id: 'SqcY0GlETPk',
    title: 'TypeScript in 100 Seconds',
    description: 'Learn TypeScript fundamentals in 100 seconds. Static typing, interfaces, and why TypeScript is essential for large applications.',
    thumbnail: 'https://i.ytimg.com/vi/zQnBQ4tB3ZA/maxresdefault.jpg',
    duration: '2:15',
    views: 3200000,
    publishedAt: '2020-10-05T00:00:00Z',
    channelTitle: 'Fireship',
    channelId: 'UCsBjURrPoezykLs9EqgamOA'
  },
  {
    id: 'SzJ46YA_RaA',
    title: 'Rust Programming Course - Tutorial for Beginners',
    description: 'Complete Rust programming tutorial covering ownership, borrowing, structs, enums, and building safe systems programming.',
    thumbnail: 'https://i.ytimg.com/vi/SzJ46YA_RaA/maxresdefault.jpg',
    duration: '5:59:58',
    views: 2400000,
    publishedAt: '2021-11-30T00:00:00Z',
    channelTitle: 'freeCodeCamp.org',
    channelId: 'UC8butISFwT-Wl7EV0hUK0BQ'
  },
  {
    id: '2JYT5f2isg4',
    title: 'API Design Best Practices',
    description: 'Learn REST API design principles, HTTP methods, status codes, authentication, and building scalable web APIs.',
    thumbnail: 'https://i.ytimg.com/vi/2JYT5f2isg4/maxresdefault.jpg',
    duration: '35:42',
    views: 1600000,
    publishedAt: '2021-05-18T00:00:00Z',
    channelTitle: 'Programming with Mosh',
    channelId: 'UCWv7vMbMWH4-V0ZXdmDpPBA'
  },
  // Cybersecurity and Networking
  {
    id: 'hxI8NfHFdtc',
    title: 'Ethical Hacking Full Course - Learn Penetration Testing!',
    description: 'Complete ethical hacking course covering network scanning, vulnerability assessment, exploitation, and security fundamentals.',
    thumbnail: 'https://i.ytimg.com/vi/hxI8NfHFdtc/maxresdefault.jpg',
    duration: '15:25:36',
    views: 3500000,
    publishedAt: '2020-08-12T00:00:00Z',
    channelTitle: 'freeCodeCamp.org',
    channelId: 'UC8butISFwT-Wl7EV0hUK0BQ'
  },
  {
    id: 'qmRe0fdt7Ag',
    title: 'Network Security Essentials',
    description: 'Learn network security fundamentals including firewalls, VPNs, intrusion detection, and securing network infrastructure.',
    thumbnail: 'https://i.ytimg.com/vi/qmRe0fdt7Ag/maxresdefault.jpg',
    duration: '45:23',
    views: 890000,
    publishedAt: '2022-09-15T00:00:00Z',
    channelTitle: 'NetworkChuck',
    channelId: 'UC9x0AN7BWHpCDHSm9NiJFJQ'
  },
  // Gaming and Entertainment
  {
    id: 'PDNZX2nql2Y',
    title: 'The Last of Us Part II - Story Analysis and Review',
    description: 'Deep dive into The Last of Us Part II narrative structure, character development, and controversial story decisions.',
    thumbnail: 'https://i.ytimg.com/vi/PDNZX2nql2Y/maxresdefault.jpg',
    duration: '2:15:45',
    views: 8700000,
    publishedAt: '2020-07-15T00:00:00Z',
    channelTitle: 'Joseph Anderson',
    channelId: 'UCyhnYIvIKK_--PiJXCMKxQQ'
  },
  {
    id: 'BxV14h0kFs0',
    title: 'Super Mario 64 Speedrun World Record History',
    description: 'Complete history of Super Mario 64 120 star world record progression from 1996 to present day.',
    thumbnail: 'https://i.ytimg.com/vi/BxV14h0kFs0/maxresdefault.jpg',
    duration: '52:38',
    views: 6200000,
    publishedAt: '2018-05-22T00:00:00Z',
    channelTitle: 'Summoning Salt',
    channelId: 'UCtUbO6rBht0daVIOGML3c8w'
  },
  {
    id: 'VjXTddVwFmw',
    title: 'Building the Perfect Minecraft Castle',
    description: 'Step-by-step guide to building an epic medieval castle in Minecraft with advanced building techniques and design principles.',
    thumbnail: 'https://i.ytimg.com/vi/VjXTddVwFmw/maxresdefault.jpg',
    duration: '28:17',
    views: 4500000,
    publishedAt: '2021-12-03T00:00:00Z',
    channelTitle: 'Grian',
    channelId: 'UCR9Gcq0CMm6YgTzsDxIoVFg'
  },
  // AI and Machine Learning
  {
    id: 'aircAruvnKk',
    title: 'Neural Networks Explained - Machine Learning Tutorial',
    description: 'Visual introduction to neural networks, deep learning fundamentals, and how artificial intelligence actually works.',
    thumbnail: 'https://i.ytimg.com/vi/aircAruvnKk/maxresdefault.jpg',
    duration: '19:13',
    views: 9200000,
    publishedAt: '2017-10-05T00:00:00Z',
    channelTitle: '3Blue1Brown',
    channelId: 'UCYO_jab_esuFRV4b17AJtAw'
  },
  {
    id: 'tPYj3fFJGjk',
    title: 'Machine Learning Full Course - Learn ML in 12 Hours',
    description: 'Complete machine learning course covering supervised learning, unsupervised learning, neural networks, and practical projects.',
    thumbnail: 'https://i.ytimg.com/vi/tPYj3fFJGjk/maxresdefault.jpg',
    duration: '12:14:33',
    views: 4800000,
    publishedAt: '2019-11-18T00:00:00Z',
    channelTitle: 'freeCodeCamp.org',
    channelId: 'UC8butISFwT-Wl7EV0hUK0BQ'
  },
  // Mobile Development
  {
    id: 'VPvVD8t02Z8',
    title: 'Flutter Course for Beginners – 37-hour Cross Platform App Development Tutorial',
    description: 'Complete Flutter development course for building cross-platform mobile apps with Dart programming language.',
    thumbnail: 'https://i.ytimg.com/vi/VPvVD8t02Z8/maxresdefault.jpg',
    duration: '37:15:20',
    views: 3600000,
    publishedAt: '2020-09-30T00:00:00Z',
    channelTitle: 'freeCodeCamp.org',
    channelId: 'UC8butISFwT-Wl7EV0hUK0BQ'
  },
  {
    id: 'fq4N0hgOWzU',
    title: 'React Native Tutorial for Beginners - Build a React Native App',
    description: 'Learn React Native development from scratch. Build cross-platform mobile apps using JavaScript and React concepts.',
    thumbnail: 'https://i.ytimg.com/vi/fq4N0hgOWzU/maxresdefault.jpg',
    duration: '6:11:54',
    views: 2800000,
    publishedAt: '2021-01-20T00:00:00Z',
    channelTitle: 'Programming with Mosh',
    channelId: 'UCWv7vMbMWH4-V0ZXdmDpPBA'
  },
  // DevOps and Cloud Computing
  {
    id: 'Ge6Udbqp23s',
    title: 'AWS Tutorial for Beginners - Amazon Web Services Full Course',
    description: 'Complete AWS tutorial covering EC2, S3, RDS, Lambda, and cloud architecture fundamentals for beginners.',
    thumbnail: 'https://i.ytimg.com/vi/Ge6Udbqp23s/maxresdefault.jpg',
    duration: '10:26:30',
    views: 5200000,
    publishedAt: '2020-04-25T00:00:00Z',
    channelTitle: 'Edureka!',
    channelId: 'UCkw4JCwteGrDHIsyIIKo4tQ'
  },
  {
    id: 'YFl2mCHdv24',
    title: 'Kubernetes Tutorial for Beginners [FULL COURSE in 4 Hours]',
    description: 'Complete Kubernetes tutorial covering pods, services, deployments, and container orchestration fundamentals.',
    thumbnail: 'https://i.ytimg.com/vi/YFl2mCHdv24/maxresdefault.jpg',
    duration: '3:51:18',
    views: 3900000,
    publishedAt: '2021-07-14T00:00:00Z',
    channelTitle: 'TechWorld with Nana',
    channelId: 'UCdngmbVKX1Tgre699-XLlUA'
  },
  // Data Science and Analytics
  {
    id: 'ua-CiDNNj30',
    title: 'Data Science Full Course - Learn Data Science in 12 Hours',
    description: 'Complete data science course covering Python, pandas, matplotlib, machine learning, and data visualization.',
    thumbnail: 'https://i.ytimg.com/vi/ua-CiDNNj30/maxresdefault.jpg',
    duration: '12:08:42',
    views: 7300000,
    publishedAt: '2019-05-08T00:00:00Z',
    channelTitle: 'freeCodeCamp.org',
    channelId: 'UC8butISFwT-Wl7EV0hUK0BQ'
  },
  {
    id: 'GPVsHOlRBBI',
    title: 'SQL Tutorial - Full Database Course for Beginners',
    description: 'Complete SQL course covering database design, queries, joins, stored procedures, and database management.',
    thumbnail: 'https://i.ytimg.com/vi/GPVsHOlRBBI/maxresdefault.jpg',
    duration: '4:20:33',
    views: 9800000,
    publishedAt: '2018-12-18T00:00:00Z',
    channelTitle: 'freeCodeCamp.org',
    channelId: 'UC8butISFwT-Wl7EV0hUK0BQ'
  }
];

// Sample playlists with gaming series
const samplePlaylists: Playlist[] = [
  // Keeping minimal playlists for navigation only
  {
    id: 'playlist1',
    title: 'DanTDM Minecraft Hardcore Series',
    description: 'Follow DanTDM\'s epic Minecraft Hardcore journey from the beginning! Watch as he builds, explores, and survives in the most challenging Minecraft mode.',
    creator: 'DanTDM',
    creatorId: 'UC4rqhyiTs7XyuODcECvuiiQ',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoCount: 25,
    totalDuration: '8:45:30',
    createdAt: '2023-01-15T00:00:00Z',
    isPublic: true,
    videos: [
      {
        id: 'hardcore1',
        title: 'Starting My HARDCORE Minecraft World!',
        description: 'Welcome to my new Minecraft Hardcore series! One life, no respawning - let\'s see how far we can go!',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '20:45',
        views: 3200000,
        publishedAt: '2023-01-15T00:00:00Z',
        channelTitle: 'DanTDM',
        channelId: 'UC4rqhyiTs7XyuODcECvuiiQ'
      },
      {
        id: 'hardcore2',
        title: 'Building My First Base in Hardcore!',
        description: 'Setting up my starter base and gathering essential resources for survival in this hardcore world.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '18:32',
        views: 2800000,
        publishedAt: '2023-01-18T00:00:00Z',
        channelTitle: 'DanTDM',
        channelId: 'UC4rqhyiTs7XyuODcECvuiiQ'
      },
      {
        id: 'hardcore3',
        title: 'First Nether Trip in Hardcore Mode!',
        description: 'Taking my first dangerous trip to the Nether in hardcore mode - will I make it back alive?',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '25:17',
        views: 3500000,
        publishedAt: '2023-01-22T00:00:00Z',
        channelTitle: 'DanTDM',
        channelId: 'UC4rqhyiTs7XyuODcECvuiiQ'
      }
    ]
  },
  {
    id: 'playlist2',
    title: 'Team Fortress 2 SFM Masterpieces',
    description: 'The best Source Filmmaker animations featuring Team Fortress 2 characters in epic adventures and comedic situations.',
    creator: 'SFM Community',
    creatorId: 'community',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoCount: 15,
    totalDuration: '2:30:45',
    createdAt: '2023-02-01T00:00:00Z',
    isPublic: true,
    videos: [
      {
        id: 'sfm1',
        title: 'Heavy\'s Sandwich Adventure [SFM]',
        description: 'Heavy goes on an epic quest to find the perfect sandwich ingredients in this hilarious SFM animation.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '8:24',
        views: 1200000,
        publishedAt: '2023-02-01T00:00:00Z',
        channelTitle: 'SFM Animator',
        channelId: 'sfm_channel'
      },
      {
        id: 'sfm2',
        title: 'Spy vs Engineer: The Ultimate Battle [SFM]',
        description: 'An intense showdown between Spy and Engineer featuring amazing action sequences and plot twists.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '12:15',
        views: 2100000,
        publishedAt: '2023-02-05T00:00:00Z',
        channelTitle: 'TF2 SFM Pro',
        channelId: 'tf2_sfm_channel'
      }
    ]
  },
  {
    id: 'playlist3',
    title: 'Programming Tutorial Marathon',
    description: 'Complete programming courses from beginner to advanced. Master JavaScript, Python, and web development.',
    creator: 'freeCodeCamp.org',
    creatorId: 'UC8butISFwT-Wl7EV0hUK0BQ',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoCount: 20,
    totalDuration: '45:30:00',
    createdAt: '2023-03-01T00:00:00Z',
    isPublic: true,
    videos: [
      {
        id: 'prog1',
        title: 'JavaScript Full Course for Beginners',
        description: 'Learn JavaScript from scratch with this comprehensive tutorial covering all the fundamentals.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '3:26:41',
        views: 8900000,
        publishedAt: '2023-03-01T00:00:00Z',
        channelTitle: 'freeCodeCamp.org',
        channelId: 'UC8butISFwT-Wl7EV0hUK0BQ'
      },
      {
        id: 'prog2',
        title: 'Python for Everybody - Complete Course',
        description: 'Master Python programming with this complete course covering data structures, web scraping, and databases.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '4:20:17',
        views: 6700000,
        publishedAt: '2023-03-05T00:00:00Z',
        channelTitle: 'freeCodeCamp.org',
        channelId: 'UC8butISFwT-Wl7EV0hUK0BQ'
      }
    ]
  },
  {
    id: 'playlist4',
    title: 'Roblox Adventures Collection',
    description: 'Epic Roblox gameplay featuring the most popular games including Adopt Me, Arsenal, and Jailbreak adventures.',
    creator: 'Roblox Gamer',
    creatorId: 'roblox_gamer',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoCount: 30,
    totalDuration: '12:15:30',
    createdAt: '2023-04-01T00:00:00Z',
    isPublic: true,
    videos: [
      {
        id: 'roblox1',
        title: 'GETTING THE RAREST PET IN ADOPT ME!',
        description: 'Spending 24 hours trying to get the legendary diamond pet in Adopt Me - will I succeed?',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '15:42',
        views: 4200000,
        publishedAt: '2023-04-01T00:00:00Z',
        channelTitle: 'Roblox Gamer',
        channelId: 'roblox_gamer'
      },
      {
        id: 'roblox2',
        title: 'ESCAPING PRISON IN JAILBREAK!',
        description: 'The ultimate jailbreak challenge - can I escape the maximum security prison and pull off the biggest heist?',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '22:18',
        views: 3800000,
        publishedAt: '2023-04-05T00:00:00Z',
        channelTitle: 'Roblox Gamer',
        channelId: 'roblox_gamer'
      }
    ]
  },
  {
    id: 'playlist6',
    title: 'Ultimate Gaming Collection',
    description: 'The best gaming content across all genres - from epic gameplay moments to pro strategies, speedruns, and gaming culture.',
    creator: 'Gaming Central',
    creatorId: 'gaming_central',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoCount: 50,
    totalDuration: '18:45:30',
    createdAt: '2024-01-15T00:00:00Z',
    isPublic: true,
    videos: [
      {
        id: 'game1',
        title: 'Minecraft: Building the Ultimate Castle - 24 Hour Build',
        description: 'Watch as we construct an incredible medieval castle in Minecraft, complete with working mechanisms, hidden rooms, and epic detail.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '45:20',
        views: 8500000,
        publishedAt: '2024-03-15T00:00:00Z',
        channelTitle: 'BuildCraft Masters',
        channelId: 'buildcraft_masters'
      },
      {
        id: 'game2',
        title: 'Elden Ring: No Death Challenge - World Record Attempt',
        description: 'Attempting the impossible - completing Elden Ring without dying once. Watch every boss fight and strategy unfold.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '3:42:15',
        views: 12300000,
        publishedAt: '2024-02-20T00:00:00Z',
        channelTitle: 'Challenge Gamers',
        channelId: 'challenge_gamers'
      },
      {
        id: 'game3',
        title: 'Valorant: From Bronze to Radiant - Complete Guide',
        description: 'A comprehensive guide covering everything you need to know to climb from Bronze to Radiant rank in Valorant.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '28:45',
        views: 5600000,
        publishedAt: '2024-04-10T00:00:00Z',
        channelTitle: 'Tactical FPS Pro',
        channelId: 'tactical_fps'
      },
      {
        id: 'game4',
        title: 'Cyberpunk 2077: Hidden Secrets and Easter Eggs',
        description: 'Discover the most amazing hidden secrets, easter eggs, and details you missed in Cyberpunk 2077.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '35:30',
        views: 7200000,
        publishedAt: '2024-01-25T00:00:00Z',
        channelTitle: 'Game Mysteries',
        channelId: 'game_mysteries'
      },
      {
        id: 'game5',
        title: 'Among Us: 200 IQ Impostor Plays Compilation',
        description: 'The most genius, creative, and mind-blowing impostor plays ever seen in Among Us. These strategies will amaze you.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '22:15',
        views: 15800000,
        publishedAt: '2024-03-05T00:00:00Z',
        channelTitle: 'Social Gaming Hub',
        channelId: 'social_gaming'
      },
      {
        id: 'game6',
        title: 'Fortnite: Zero Build Victory Royale Strategies',
        description: 'Master the art of winning in Fortnite Zero Build mode with positioning, weapon choice, and rotation strategies.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '16:45',
        views: 4200000,
        publishedAt: '2024-04-01T00:00:00Z',
        channelTitle: 'Battle Royale Pro',
        channelId: 'br_pro'
      },
      {
        id: 'game7',
        title: 'Apex Legends: Movement Tech That Pros Use',
        description: 'Advanced movement techniques including wall-bouncing, tap-strafing, and momentum conservation in Apex Legends.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '24:30',
        views: 6800000,
        publishedAt: '2024-03-28T00:00:00Z',
        channelTitle: 'Apex Movement Guide',
        channelId: 'apex_movement'
      },
      {
        id: 'game8',
        title: 'Genshin Impact: Free-to-Play Team Building Guide',
        description: 'Build powerful teams using only free characters and weapons in Genshin Impact. Perfect for F2P players.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '33:20',
        views: 8900000,
        publishedAt: '2024-02-14T00:00:00Z',
        channelTitle: 'Genshin F2P Guide',
        channelId: 'genshin_f2p'
      },
      {
        id: 'game9',
        title: 'Rocket League: From Gold to Champion Mechanics',
        description: 'Essential mechanical skills to master for climbing from Gold to Champion rank in Rocket League.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '28:15',
        views: 5600000,
        publishedAt: '2024-04-08T00:00:00Z',
        channelTitle: 'Rocket League Academy',
        channelId: 'rl_academy'
      },
      {
        id: 'game10',
        title: 'The Witcher 3: Hidden Quests and Secrets',
        description: 'Discover the most obscure and rewarding hidden quests, easter eggs, and secrets in The Witcher 3.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '41:50',
        views: 12700000,
        publishedAt: '2024-01-18T00:00:00Z',
        channelTitle: 'RPG Secrets',
        channelId: 'rpg_secrets'
      }
    ]
  },
  {
    id: 'playlist7',
    title: 'PC Building & Tech Mastery',
    description: 'Everything you need to know about building, upgrading, and optimizing PCs. From budget builds to extreme gaming rigs.',
    creator: 'Tech Builder Pro',
    creatorId: 'tech_builder_pro',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoCount: 35,
    totalDuration: '12:30:45',
    createdAt: '2024-01-10T00:00:00Z',
    isPublic: true,
    videos: [
      {
        id: 'pc1',
        title: 'Building a $500 Gaming PC That Beats Consoles',
        description: 'Step-by-step guide to building an incredible budget gaming PC that outperforms PS5 and Xbox Series X.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '32:45',
        views: 9800000,
        publishedAt: '2024-02-15T00:00:00Z',
        channelTitle: 'Budget PC Builds',
        channelId: 'budget_pc'
      },
      {
        id: 'pc2',
        title: 'RTX 4090 vs RTX 4080: Ultimate Comparison',
        description: 'Comprehensive testing and comparison between RTX 4090 and RTX 4080 across 50+ games and applications.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '25:30',
        views: 6700000,
        publishedAt: '2024-03-20T00:00:00Z',
        channelTitle: 'GPU Reviews Pro',
        channelId: 'gpu_reviews'
      },
      {
        id: 'pc3',
        title: 'Custom Water Cooling Loop - Complete Build Guide',
        description: 'Learn how to build a custom water cooling loop from scratch. Covering planning, installation, and troubleshooting.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '48:20',
        views: 4200000,
        publishedAt: '2024-01-30T00:00:00Z',
        channelTitle: 'Cooling Solutions',
        channelId: 'cooling_tech'
      },
      {
        id: 'pc4',
        title: 'Cable Management: From Mess to Masterpiece',
        description: 'Transform your messy PC build into a clean, professional-looking masterpiece with proper cable management techniques.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '18:45',
        views: 3800000,
        publishedAt: '2024-04-05T00:00:00Z',
        channelTitle: 'Clean Build Guide',
        channelId: 'clean_builds'
      },
      {
        id: 'pc5',
        title: 'AMD vs Intel: 2024 CPU Battle Royale',
        description: 'The ultimate showdown between AMD and Intel CPUs across gaming, productivity, and value metrics.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '35:15',
        views: 8900000,
        publishedAt: '2024-02-28T00:00:00Z',
        channelTitle: 'CPU Benchmark Lab',
        channelId: 'cpu_lab'
      },
      {
        id: 'pc6',
        title: 'DDR5 vs DDR4: Is the Upgrade Worth It?',
        description: 'Comprehensive testing of DDR5 vs DDR4 memory across gaming, productivity, and synthetic benchmarks.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '22:30',
        views: 5400000,
        publishedAt: '2024-03-18T00:00:00Z',
        channelTitle: 'Memory Tech Reviews',
        channelId: 'memory_tech'
      },
      {
        id: 'pc7',
        title: 'First Time PC Builder? Avoid These 10 Mistakes',
        description: 'Common mistakes new PC builders make and how to avoid them. Save money and prevent headaches.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '19:45',
        views: 11200000,
        publishedAt: '2024-01-22T00:00:00Z',
        channelTitle: 'PC Building 101',
        channelId: 'pc_building_101'
      },
      {
        id: 'pc8',
        title: 'PSU Calculator: How Much Power Do You Really Need?',
        description: 'Learn how to properly calculate PSU requirements and choose the right power supply for your build.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '16:20',
        views: 3800000,
        publishedAt: '2024-04-12T00:00:00Z',
        channelTitle: 'Power Supply Guide',
        channelId: 'psu_guide'
      },
      {
        id: 'pc9',
        title: 'Motherboard Features Explained: What You Need to Know',
        description: 'Decode motherboard specifications and features to choose the perfect board for your needs.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '27:10',
        views: 6700000,
        publishedAt: '2024-02-08T00:00:00Z',
        channelTitle: 'Motherboard Masters',
        channelId: 'mobo_masters'
      },
      {
        id: 'pc10',
        title: 'SSD vs HDD vs NVMe: Storage Showdown 2024',
        description: 'Complete comparison of storage technologies including speed tests, capacity, and value analysis.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '24:55',
        views: 8100000,
        publishedAt: '2024-03-22T00:00:00Z',
        channelTitle: 'Storage Solutions',
        channelId: 'storage_solutions'
      }
    ]
  },
  {
    id: 'playlist8',
    title: 'Indie Gaming Gems',
    description: 'Discover amazing indie games that deserve more attention. Hidden gems, innovative gameplay, and artistic masterpieces.',
    creator: 'Indie Explorer',
    creatorId: 'indie_explorer',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoCount: 25,
    totalDuration: '8:15:30',
    createdAt: '2024-02-01T00:00:00Z',
    isPublic: true,
    videos: [
      {
        id: 'indie1',
        title: 'Hollow Knight: Why This Indie Game Is Perfect',
        description: 'Deep dive into what makes Hollow Knight one of the greatest indie games ever created. Exploring mechanics, art, and design.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '28:30',
        views: 5400000,
        publishedAt: '2024-02-15T00:00:00Z',
        channelTitle: 'Indie Game Analysis',
        channelId: 'indie_analysis'
      },
      {
        id: 'indie2',
        title: 'Celeste: How Difficulty Creates Meaning',
        description: 'An exploration of how Celeste uses challenging gameplay to tell a powerful story about mental health and perseverance.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '22:45',
        views: 3200000,
        publishedAt: '2024-03-01T00:00:00Z',
        channelTitle: 'Games as Art',
        channelId: 'games_art'
      },
      {
        id: 'indie3',
        title: 'Hades: The Perfect Roguelike Formula',
        description: 'Breaking down what makes Hades the gold standard for roguelike games and narrative design.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '26:15',
        views: 4800000,
        publishedAt: '2024-02-20T00:00:00Z',
        channelTitle: 'Roguelike Reviews',
        channelId: 'roguelike_reviews'
      },
      {
        id: 'indie4',
        title: 'Stardew Valley: The Ultimate Relaxation Game',
        description: 'Why Stardew Valley became the perfect escape game and how it revolutionized farming simulators.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '31:20',
        views: 6100000,
        publishedAt: '2024-03-10T00:00:00Z',
        channelTitle: 'Cozy Gaming',
        channelId: 'cozy_gaming'
      }
    ]
  },
  {
    id: 'playlist9',
    title: 'Esports & Competitive Gaming',
    description: 'Professional gaming highlights, tournament coverage, and competitive strategy guides from the biggest esports titles.',
    creator: 'Esports Central',
    creatorId: 'esports_central',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoCount: 40,
    totalDuration: '15:20:15',
    createdAt: '2024-01-20T00:00:00Z',
    isPublic: true,
    videos: [
      {
        id: 'esport1',
        title: 'League of Legends Worlds 2024: Most Epic Plays',
        description: 'The most incredible, game-changing plays from the League of Legends World Championship 2024.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '42:30',
        views: 18500000,
        publishedAt: '2024-04-15T00:00:00Z',
        channelTitle: 'LoL Esports',
        channelId: 'lol_esports'
      },
      {
        id: 'esport2',
        title: 'CS2: Pro Movement and Aim Training Guide',
        description: 'Learn movement techniques and aim training routines used by professional Counter-Strike 2 players.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '38:45',
        views: 7800000,
        publishedAt: '2024-03-25T00:00:00Z',
        channelTitle: 'CS Pro Tips',
        channelId: 'cs_pro'
      },
      {
        id: 'esport3',
        title: 'Dota 2: The International 2024 Grand Finals',
        description: 'Complete coverage of the most intense Dota 2 International grand finals match ever played.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '2:15:20',
        views: 12300000,
        publishedAt: '2024-04-20T00:00:00Z',
        channelTitle: 'Dota Pro Scene',
        channelId: 'dota_pro'
      }
    ]
  },
  {
    id: 'playlist10',
    title: 'Advanced PC Building & Overclocking',
    description: 'Master-level PC building techniques, extreme overclocking, and custom modifications for enthusiasts.',
    creator: 'Extreme PC Builds',
    creatorId: 'extreme_pc',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoCount: 30,
    totalDuration: '14:45:30',
    createdAt: '2024-02-05T00:00:00Z',
    isPublic: true,
    videos: [
      {
        id: 'extremepc1',
        title: 'Building a $10,000 Dream Gaming Setup',
        description: 'Complete build process for the ultimate gaming setup with custom desk, lighting, and top-tier components.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '58:30',
        views: 14200000,
        publishedAt: '2024-03-30T00:00:00Z',
        channelTitle: 'Dream Builds',
        channelId: 'dream_builds'
      },
      {
        id: 'extremepc2',
        title: 'Liquid Nitrogen Overclocking: Breaking World Records',
        description: 'Watch extreme overclocking with liquid nitrogen cooling, pushing hardware beyond its limits.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '35:45',
        views: 5600000,
        publishedAt: '2024-02-18T00:00:00Z',
        channelTitle: 'Extreme OC',
        channelId: 'extreme_oc'
      },
      {
        id: 'extremepc3',
        title: 'Silent PC Build: Zero Noise Gaming Machine',
        description: 'Building the quietest gaming PC possible while maintaining maximum performance.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '41:20',
        views: 7300000,
        publishedAt: '2024-03-12T00:00:00Z',
        channelTitle: 'Silent Computing',
        channelId: 'silent_pc'
      },
      {
        id: 'extremepc4',
        title: 'Mini-ITX Beast: Max Power in Minimum Space',
        description: 'Cramming flagship performance into the smallest possible form factor with innovative cooling solutions.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '44:15',
        views: 9100000,
        publishedAt: '2024-02-25T00:00:00Z',
        channelTitle: 'Small Form Factor',
        channelId: 'sff_builds'
      }
    ]
  },
  {
    id: 'playlist11',
    title: 'Retro Gaming Revival',
    description: 'Celebrating classic games, retro hardware, and gaming history. From arcade classics to console generations.',
    creator: 'Retro Gaming Hub',
    creatorId: 'retro_gaming',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoCount: 45,
    totalDuration: '16:30:45',
    createdAt: '2024-01-25T00:00:00Z',
    isPublic: true,
    videos: [
      {
        id: 'retro1',
        title: 'Nintendo 64: The Console That Changed Gaming Forever',
        description: 'Exploring how the Nintendo 64 revolutionized 3D gaming and influenced an entire generation.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '38:20',
        views: 8900000,
        publishedAt: '2024-02-10T00:00:00Z',
        channelTitle: 'Console History',
        channelId: 'console_history'
      },
      {
        id: 'retro2',
        title: 'Arcade Perfect: Recreating Classic Arcade Cabinets',
        description: 'Building authentic arcade cabinets and restoring classic arcade machines to their original glory.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '52:15',
        views: 4700000,
        publishedAt: '2024-03-05T00:00:00Z',
        channelTitle: 'Arcade Revival',
        channelId: 'arcade_revival'
      },
      {
        id: 'retro3',
        title: 'PlayStation vs Saturn vs N64: The Console War of 1996',
        description: 'Deep dive into the epic console battle that shaped modern gaming.',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        duration: '46:30',
        views: 6200000,
        publishedAt: '2024-01-30T00:00:00Z',
        channelTitle: 'Gaming History',
        channelId: 'gaming_history'
      }
    ]
  }
];

export const VideoTube: FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'watch' | 'upload' | 'profile' | 'playlists' | 'playlist'>('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(sampleUsers[0]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newComment, setNewComment] = useState('');
  const [subscribedChannels, setSubscribedChannels] = useState<Set<string>>(new Set());
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [dislikedVideos, setDislikedVideos] = useState<Set<string>>(new Set());
  const [likeAnimation, setLikeAnimation] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Try to fetch YouTube videos, fallback to sample data
  const { data: youtubeVideos, isLoading, error } = useQuery({
    queryKey: ['/api/youtube/popular'],
    queryFn: async () => {
      const response = await fetch('/api/youtube/popular?maxResults=30');
      if (!response.ok) {
        throw new Error('Failed to fetch YouTube videos');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: false
  });

  // Use YouTube videos if available, otherwise use fallback
  const videos: YouTubeVideo[] = youtubeVideos || fallbackVideos;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/youtube/popular'] });
  };

  // Generate sample comments for selected video
  useEffect(() => {
    if (selectedVideo) {
      const sampleComments: Comment[] = [
        {
          id: 'comment1',
          videoId: selectedVideo.id,
          author: sampleUsers[1],
          text: 'Great video! Really helpful content.',
          timestamp: '2 hours ago',
          likes: 15,
          replies: []
        },
        {
          id: 'comment2',
          videoId: selectedVideo.id,
          author: sampleUsers[2],
          text: 'Thanks for sharing this!',
          timestamp: '5 hours ago',
          likes: 8,
          replies: []
        }
      ];
      setComments(sampleComments);
    }
  }, [selectedVideo]);

  const formatViews = (views: number) => {
    if (views >= 1000000000) return `${(views / 1000000000).toFixed(1)}B`;
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleVideoClick = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setCurrentView('watch');
  };

  const handleLike = (videoId: string) => {
    if (dislikedVideos.has(videoId)) {
      setDislikedVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    }
    
    if (likedVideos.has(videoId)) {
      setLikedVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    } else {
      setLikedVideos(prev => new Set(prev).add(videoId));
      setLikeAnimation(videoId);
      setTimeout(() => setLikeAnimation(null), 1000);
    }
  };

  const handleDislike = (videoId: string) => {
    if (likedVideos.has(videoId)) {
      setLikedVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    }
    
    if (dislikedVideos.has(videoId)) {
      setDislikedVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    } else {
      setDislikedVideos(prev => new Set(prev).add(videoId));
    }
  };

  const handleSubscribe = (channelId: string) => {
    if (subscribedChannels.has(channelId)) {
      setSubscribedChannels(prev => {
        const newSet = new Set(prev);
        newSet.delete(channelId);
        return newSet;
      });
    } else {
      setSubscribedChannels(prev => new Set(prev).add(channelId));
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() && selectedVideo) {
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        videoId: selectedVideo.id,
        author: currentUser,
        text: newComment,
        timestamp: 'Just now',
        likes: 0,
        replies: []
      };
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    }
  };

  const handleUserSwitch = (user: User) => {
    setCurrentUser(user);
  };

  const getChannelAvatar = (channelId: string, channelTitle: string) => {
    const avatarMap: { [key: string]: string } = {
      // Programming and Tech Channels
      'UCsBjURrPoezykLs9EqgamOA': 'https://yt3.ggpht.com/ytc/AIdro_mNKzQhPnbKVAJ7_h1B2gBRpkOCQYbJHGQotFqKGGXTrA=s176-c-k-c0x00ffffff-no-rj', // Fireship
      'UC8butISFwT-Wl7EV0hUK0BQ': 'https://yt3.ggpht.com/ytc/AIdro_n8vw7YcXiNWqBKFJBRayR_A3BI-Gh04AGSdPMjUJHikg=s176-c-k-c0x00ffffff-no-rj', // freeCodeCamp
      'UCWv7vMbMWH4-V0ZXdmDpPBA': 'https://yt3.ggpht.com/ytc/AIdro_lB1xeDWG0JgNaLOBhppKnHDc_Sn8s_7A0RM1t7RyMtfw=s176-c-k-c0x00ffffff-no-rj', // Programming with Mosh
      'UC9x0AN7BWHpCDHSm9NiJFJQ': 'https://yt3.ggpht.com/ytc/AIdro_mQdkW-TM5K34AhT2JQ9MnZOGY8Kj-bfD4LyPGQ9LpTtw=s176-c-k-c0x00ffffff-no-rj', // NetworkChuck
      'UCvA_wgsX6eFAOXI8Rbg_WiQ': 'https://yt3.ggpht.com/ytc/AIdro_l9rCVAI8ZQPjCnTqvzGtDj5vG-8_dH6zQQ9XrS9Q9c1Q=s176-c-k-c0x00ffffff-no-rj', // tutoriaLinux
      'UC7YOGHUfC1Tb6E4pudI9STA': 'https://yt3.ggpht.com/ytc/AIdro_kAqJ_rJsNL5xpvXsJ3hF6XJ8Qg4w_K1yV6cBmSm_dB7A=s176-c-k-c0x00ffffff-no-rj', // Mental Outlaw
      'UCdngmbVKX1Tgre699-XLlUA': 'https://yt3.ggpht.com/ytc/AIdro_mF6vGpBgHY8QH8jGtJ4wQF2L3m9K8pJk6qW5VxEr6TdA=s176-c-k-c0x00ffffff-no-rj', // TechWorld with Nana
      'UCFbNIlppjAuEX4znoulh0Cw': 'https://yt3.ggpht.com/ytc/AIdro_kF8vH9mNpzGHJ4R2L3bQ9tP1xVzC6nT8YrF7dQ5w=s176-c-k-c0x00ffffff-no-rj', // Web Dev Simplified
      'UCYO_jab_esuFRV4b17AJtAw': 'https://yt3.ggpht.com/ytc/AIdro_mG7K8Q4wV6pJ2tS8L1RhN3qG7bP0xVzC5mT4YrF6dQ1w=s176-c-k-c0x00ffffff-no-rj', // 3Blue1Brown
      'UCkw4JCwteGrDHIsyIIKo4tQ': 'https://yt3.ggpht.com/ytc/AIdro_nH9L8Q6wV8pJ4tS0L3RhG5qN9bP2xVzC8mT6YrF8dQ3w=s176-c-k-c0x00ffffff-no-rj', // Edureka!
      
      // Gaming Channels
      'UC6JKng_wYLO9H_LYFGUOqKQ': 'https://yt3.ggpht.com/ytc/AIdro_nG8hJ3dK6V8qMpS4FxQ2L7vB9tN1cQzR8kP5YxF9mXwA=s176-c-k-c0x00ffffff-no-rj', // Luke TheNotable
      'UCtUbO6rBht0daVIOGML3c8w': 'https://yt3.ggpht.com/ytc/AIdro_lQ5M8vJ2kF7wPqJ8R6QhG4tN9bL1xVzC8mS9KpT5dA2w=s176-c-k-c0x00ffffff-no-rj', // Summoning Salt
      'UCyhnYIvIKK_--PiJXCMKxQQ': 'https://yt3.ggpht.com/ytc/AIdro_mB9K5L8wQ6vF3pS7J1RhN4qG8tP2xVzC9nT6YrF8dQ3w=s176-c-k-c0x00ffffff-no-rj', // Joseph Anderson
      'UCKaOkELCp-5juVQB1qKDhng': 'https://yt3.ggpht.com/ytc/AIdro_nF6K8Q5wV7pJ3tS9L2RhG4qN8bP1xVzC7mT5YrF9dQ2w=s176-c-k-c0x00ffffff-no-rj', // Valve
      'UCR9Gcq0CMm6YgTzsDxIoVFg': 'https://yt3.ggpht.com/ytc/AIdro_mJ0L8Q7wV9pJ5tS2L4RhG6qN0bP3xVzC9mT7YrF0dQ4w=s176-c-k-c0x00ffffff-no-rj', // Grian
      
      // Music Artists
      'UCuAXFkgsw1L7xaCfnd5JJOw': 'https://yt3.ggpht.com/ytc/AIdro_lK1M8Q8wV0pJ6tS3L5RhG7qN1bP4xVzC0mT8YrF1dQ5w=s176-c-k-c0x00ffffff-no-rj', // Rick Astley
      'UCiMhD4jzUqG-IgPzUmmytRQ': 'https://yt3.ggpht.com/ytc/AIdro_mL2N8Q9wV1pJ7tS4L6RhG8qN2bP5xVzC1mT9YrF2dQ6w=s176-c-k-c0x00ffffff-no-rj', // Queen Official
      'UCLp3yEOdE6Cwe1D3xqKiPBw': 'https://yt3.ggpht.com/ytc/AIdro_nM3O8Q0wV2pJ8tS5L7RhG9qN3bP6xVzC2mT0YrF3dQ7w=s176-c-k-c0x00ffffff-no-rj', // Smash Mouth
      'UCmT5bgI_8Ux3qE88L-o2bOQ': 'https://yt3.ggpht.com/ytc/AIdro_oN4P8Q1wV3pJ9tS6L8RhG0qN4bP7xVzC3mT1YrF4dQ8w=s176-c-k-c0x00ffffff-no-rj', // Luis Fonsi
      'UCsRM0YB_dabtEPGPTKo-gcw': 'https://yt3.ggpht.com/ytc/AIdro_pO5Q8Q2wV4pJ0tS7L9RhG1qN5bP8xVzC4mT2YrF5dQ9w=s176-c-k-c0x00ffffff-no-rj', // Adele
      'UCrDkAvF9ZWdo5OukAhI7H3Q': 'https://yt3.ggpht.com/ytc/AIdro_qP6R8Q3wV5pJ1tS8L0RhG2qN6bP9xVzC5mT3YrF6dQ0w=s176-c-k-c0x00ffffff-no-rj', // officialpsy
      'UC0C-w0YjGpqDXGB8IHb662A': 'https://yt3.ggpht.com/ytc/AIdro_rQ7S8Q4wV6pJ2tS9L1RhG3qN7bP0xVzC6mT4YrF7dQ1w=s176-c-k-c0x00ffffff-no-rj', // Ed Sheeran
      'UC347FC-2Zj5MTtMfsTc97xQ': 'https://yt3.ggpht.com/ytc/AIdro_sR8T8Q5wV7pJ3tS0L2RhG4qN8bP1xVzC7mT5YrF8dQ2w=s176-c-k-c0x00ffffff-no-rj', // Katy Perry
      'UCGwegR-rWjYETlrwNzJTNFQ': 'https://yt3.ggpht.com/ytc/AIdro_tS9U8Q6wV8pJ4tS1L3RhG5qN9bP2xVzC8mT6YrF9dQ3w=s176-c-k-c0x00ffffff-no-rj', // Wiz Khalifa
      'UCBnxxPnWlJjdTvnxIh6M14Q': 'https://yt3.ggpht.com/ytc/AIdro_uT0V8Q7wV9pJ5tS2L4RhG6qN0bP3xVzC9mT7YrF0dQ4w=s176-c-k-c0x00ffffff-no-rj', // Mark Ronson
      'UCqECaJ8Gagnn7YCbPEzWH6g': 'https://yt3.ggpht.com/ytc/AIdro_vU1W8Q8wV0pJ6tS3L5RhG7qN1bP4xVzC0mT8YrF1dQ5w=s176-c-k-c0x00ffffff-no-rj', // Taylor Swift
      'UC78fGeRSClyf9g0IqI9vJlA': 'https://yt3.ggpht.com/ytc/AIdro_wV2X8Q9wV1pJ7tS4L6RhG8qN2bP5xVzC1mT9YrF2dQ6w=s176-c-k-c0x00ffffff-no-rj', // Maroon 5
      'UCcdwLMPsaU2ezNSJU1nFoBQ': 'https://yt3.ggpht.com/ytc/AIdro_xW3Y8Q0wV2pJ8tS5L7RhG9qN3bP6xVzC2mT0YrF3dQ7w=s176-c-k-c0x00ffffff-no-rj', // Pinkfong Baby Shark
      'UCedvOgsKFzcK3hA5taf3KoQ': 'https://yt3.ggpht.com/ytc/AIdro_yX4Z8Q1wV3pJ9tS6L8RhG0qN4bP7xVzC3mT1YrF4dQ8w=s176-c-k-c0x00ffffff-no-rj'  // Eminem
    };
    
    return avatarMap[channelId] || `https://api.dicebear.com/7.x/initials/svg?seed=${channelTitle}&backgroundColor=random`;
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.channelTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">VideoTube</span>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="space-y-2">
            <Button
              variant={currentView === 'home' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('home')}
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <TrendingUp className="w-5 h-5 mr-3" />
              Trending
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="w-5 h-5 mr-3" />
              Subscriptions
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Library className="w-5 h-5 mr-3" />
              Library
            </Button>
            <Button
              variant={currentView === 'playlists' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentView('playlists')}
            >
              <List className="w-5 h-5 mr-3" />
              Playlists
            </Button>
          </div>

          <div className="border-t border-gray-700 mt-6 pt-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">SUBSCRIPTIONS</h3>
            <div className="space-y-2">
              {sampleUsers.map(user => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                  <img src={user.avatar} alt={user.displayName} className="w-6 h-6 rounded-full" />
                  <span className="text-sm">{user.displayName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <img src={currentUser.avatar} alt={currentUser.displayName} className="w-8 h-8 rounded-full" />
            <div>
              <div className="text-sm font-medium">{currentUser.displayName}</div>
              <div className="text-xs text-gray-400">{formatViews(currentUser.subscribers)} subscribers</div>
            </div>
          </div>
          <div className="space-y-1">
            {sampleUsers.map(user => (
              <Button
                key={user.id}
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-xs ${currentUser.id === user.id ? 'bg-gray-700' : ''}`}
                onClick={() => handleUserSwitch(user)}
              >
                <img src={user.avatar} alt={user.displayName} className="w-4 h-4 rounded-full mr-2" />
                {user.displayName}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                <Button size="sm" className="absolute right-1 top-1 bg-gray-600 hover:bg-gray-500">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {currentView === 'home' && (
            <div className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    YouTube API temporarily unavailable. Showing sample content.
                  </p>
                </div>
              )}
              
              <h2 className="text-2xl font-bold mb-6">Popular Videos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map(video => (
                  <div key={video.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer" onClick={() => handleVideoClick(video)}>
                    <div className="relative">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-2 line-clamp-2">{video.title}</h3>
                      <p className="text-gray-400 text-sm mb-1">{video.channelTitle}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatViews(video.views)} views</span>
                        <span>•</span>
                        <span>{formatDate(video.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'watch' && selectedVideo && (
            <div className="p-6">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-black rounded-lg overflow-hidden mb-4">
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedVideo.id}`}
                        title={selectedVideo.title}
                        className="w-full h-96"
                        allowFullScreen
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h1 className="text-2xl font-bold">{selectedVideo.title}</h1>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>{formatViews(selectedVideo.views)} views</span>
                          <span>•</span>
                          <span>{formatDate(selectedVideo.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={likedVideos.has(selectedVideo.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleLike(selectedVideo.id)}
                            className={`relative ${likeAnimation === selectedVideo.id ? 'animate-pulse bg-green-500 text-white' : ''} ${likedVideos.has(selectedVideo.id) ? 'bg-blue-600 text-white' : ''}`}
                          >
                            <ThumbsUp className={`w-4 h-4 mr-1 ${likeAnimation === selectedVideo.id ? 'animate-bounce' : ''}`} />
                            Like
                            {likeAnimation === selectedVideo.id && (
                              <Heart className="absolute -top-2 -right-2 w-4 h-4 text-red-500 animate-ping" />
                            )}
                          </Button>
                          <Button
                            variant={dislikedVideos.has(selectedVideo.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleDislike(selectedVideo.id)}
                            className={dislikedVideos.has(selectedVideo.id) ? 'bg-red-600 text-white' : ''}
                          >
                            <ThumbsDown className="w-4 h-4 mr-1" />
                            Dislike
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <img 
                            src={getChannelAvatar(selectedVideo.channelId, selectedVideo.channelTitle)} 
                            alt={selectedVideo.channelTitle}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-semibold">{selectedVideo.channelTitle}</h3>
                            <p className="text-sm text-gray-400">Creator on VideoTube</p>
                          </div>
                        </div>
                        <Button
                          variant={subscribedChannels.has(selectedVideo.channelId) ? "outline" : "default"}
                          onClick={() => handleSubscribe(selectedVideo.channelId)}
                          className={subscribedChannels.has(selectedVideo.channelId) ? 'text-gray-400' : 'bg-red-600 hover:bg-red-700'}
                        >
                          {subscribedChannels.has(selectedVideo.channelId) ? 'Subscribed' : 'Subscribe'}
                        </Button>
                      </div>

                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {selectedVideo.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-semibold mb-4">Comments</h3>
                      
                      <div className="mb-4">
                        <div className="flex gap-3">
                          <img src={currentUser.avatar} alt={currentUser.displayName} className="w-8 h-8 rounded-full" />
                          <div className="flex-1">
                            <Input
                              placeholder="Add a comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                                Comment
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setNewComment('')}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {comments.map(comment => (
                          <div key={comment.id} className="flex gap-3">
                            <img src={comment.author.avatar} alt={comment.author.displayName} className="w-8 h-8 rounded-full" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{comment.author.displayName}</span>
                                <span className="text-xs text-gray-400">{comment.timestamp}</span>
                              </div>
                              <p className="text-sm text-gray-300">{comment.text}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <Button variant="ghost" size="sm" className="text-xs">
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  {comment.likes}
                                </Button>
                                <Button variant="ghost" size="sm" className="text-xs">
                                  <ThumbsDown className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-xs">
                                  Reply
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">Related Videos</h3>
                      <div className="space-y-3">
                        {videos.slice(0, 5).map(video => (
                          <div key={video.id} className="flex gap-3 cursor-pointer hover:bg-gray-800 p-2 rounded" onClick={() => handleVideoClick(video)}>
                            <img src={video.thumbnail} alt={video.title} className="w-24 h-16 object-cover rounded" />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium line-clamp-2 mb-1">{video.title}</h4>
                              <p className="text-xs text-gray-400">{video.channelTitle}</p>
                              <p className="text-xs text-gray-500">{formatViews(video.views)} views</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'playlists' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Curated Playlists</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {samplePlaylists.map(playlist => (
                  <div 
                    key={playlist.id} 
                    className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedPlaylist(playlist);
                      setCurrentView('playlist');
                    }}
                  >
                    <div className="relative">
                      <img src={playlist.thumbnail} alt={playlist.title} className="w-full h-48 object-cover" />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <PlaySquare className="w-3 h-3" />
                        {playlist.videoCount} videos
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                        {playlist.totalDuration}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-2 line-clamp-2">{playlist.title}</h3>
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">{playlist.description}</p>
                      <p className="text-gray-500 text-xs">By {playlist.creator}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'playlist' && selectedPlaylist && (
            <div className="p-6">
              <div className="mb-6">
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentView('playlists')}
                  className="mb-4"
                >
                  ← Back to Playlists
                </Button>
                
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <div className="flex gap-6">
                    <img 
                      src={selectedPlaylist.thumbnail} 
                      alt={selectedPlaylist.title}
                      className="w-48 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">{selectedPlaylist.title}</h1>
                      <p className="text-gray-400 mb-4">{selectedPlaylist.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>By {selectedPlaylist.creator}</span>
                        <span>•</span>
                        <span>{selectedPlaylist.videoCount} videos</span>
                        <span>•</span>
                        <span>{selectedPlaylist.totalDuration} total</span>
                        <span>•</span>
                        <span>{formatDate(selectedPlaylist.createdAt)}</span>
                      </div>
                      <div className="mt-4">
                        <Button 
                          className="bg-red-600 hover:bg-red-700 mr-3"
                          onClick={() => {
                            if (selectedPlaylist.videos.length > 0) {
                              setSelectedVideo(selectedPlaylist.videos[0]);
                              setCurrentView('watch');
                            }
                          }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Play All
                        </Button>
                        <Button variant="outline">
                          <Heart className="w-4 h-4 mr-2" />
                          Save Playlist
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {selectedPlaylist.videos.map((video, index) => (
                  <div 
                    key={video.id}
                    className="flex gap-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedVideo(video);
                      setCurrentView('watch');
                    }}
                  >
                    <div className="flex-shrink-0 w-8 text-center text-gray-400 font-mono">
                      {index + 1}
                    </div>
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-32 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1 line-clamp-2">{video.title}</h3>
                      <p className="text-gray-400 text-sm mb-1">{video.channelTitle}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatViews(video.views)} views</span>
                        <span>•</span>
                        <span>{video.duration}</span>
                        <span>•</span>
                        <span>{formatDate(video.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};