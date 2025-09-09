import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Scissors, 
  Download, Upload, Settings, Eye, Layers, Type, Image,
  Music, Video, Wand2, Undo, Redo, Save, FolderOpen
} from 'lucide-react';

interface VideoClip {
  id: string;
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  trimStart: number;
  trimEnd: number;
  volume: number;
  effects: string[];
  transitions: string[];
}

interface AudioTrack {
  id: string;
  name: string;
  duration: number;
  volume: number;
  startTime: number;
}

interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  style: {
    fontSize: number;
    color: string;
    position: { x: number; y: number };
    fontFamily: string;
  };
}

export const VideoEditor: FC = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300); // 5 minutes
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [selectedTool, setSelectedTool] = useState('select');
  const [videoClips, setVideoClips] = useState<VideoClip[]>([
    {
      id: '1',
      name: 'intro.mp4',
      duration: 30,
      startTime: 0,
      endTime: 30,
      trimStart: 0,
      trimEnd: 30,
      volume: 100,
      effects: [],
      transitions: []
    },
    {
      id: '2',
      name: 'main_content.mp4',
      duration: 120,
      startTime: 30,
      endTime: 150,
      trimStart: 0,
      trimEnd: 120,
      volume: 100,
      effects: ['color_correction'],
      transitions: ['fade_in']
    }
  ]);
  
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([
    {
      id: '1',
      name: 'background_music.mp3',
      duration: 180,
      volume: 60,
      startTime: 0
    }
  ]);

  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([
    {
      id: '1',
      text: 'Welcome to WebOS',
      startTime: 5,
      duration: 10,
      style: {
        fontSize: 48,
        color: '#ffffff',
        position: { x: 50, y: 20 },
        fontFamily: 'Arial'
      }
    }
  ]);

  const [projectName, setProjectName] = useState('Untitled Project');
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, duration)));
  };

  const exportProject = () => {
    // In a real implementation, this would render the video
    console.log('Exporting project:', {
      videoClips,
      audioTracks,
      textOverlays,
      duration,
      projectName
    });
  };

  const addVideoClip = () => {
    const newClip: VideoClip = {
      id: Date.now().toString(),
      name: `clip_${videoClips.length + 1}.mp4`,
      duration: 60,
      startTime: duration,
      endTime: duration + 60,
      trimStart: 0,
      trimEnd: 60,
      volume: 100,
      effects: [],
      transitions: []
    };
    setVideoClips([...videoClips, newClip]);
    setDuration(duration + 60);
  };

  const addAudioTrack = () => {
    const newTrack: AudioTrack = {
      id: Date.now().toString(),
      name: `audio_${audioTracks.length + 1}.mp3`,
      duration: 120,
      volume: 80,
      startTime: 0
    };
    setAudioTracks([...audioTracks, newTrack]);
  };

  const addTextOverlay = () => {
    const newText: TextOverlay = {
      id: Date.now().toString(),
      text: 'New Text',
      startTime: currentTime,
      duration: 5,
      style: {
        fontSize: 32,
        color: '#ffffff',
        position: { x: 50, y: 50 },
        fontFamily: 'Arial'
      }
    };
    setTextOverlays([...textOverlays, newText]);
  };

  // Playback simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const timelineScale = zoom / 100;
  const timelineWidth = duration * 10 * timelineScale;

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <Video className="w-6 h-6 text-blue-400" />
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white w-48"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-white border-gray-600">
            <FolderOpen className="w-4 h-4 mr-1" />
            Open
          </Button>
          <Button variant="outline" size="sm" className="text-white border-gray-600">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Toolbar */}
        <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 gap-2">
          {[
            { id: 'select', icon: Eye, label: 'Select' },
            { id: 'cut', icon: Scissors, label: 'Cut' },
            { id: 'text', icon: Type, label: 'Text' },
            { id: 'image', icon: Image, label: 'Image' },
            { id: 'effects', icon: Wand2, label: 'Effects' }
          ].map(tool => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? 'default' : 'ghost'}
              size="sm"
              className="w-10 h-10 p-0"
              onClick={() => setSelectedTool(tool.id)}
              title={tool.label}
            >
              <tool.icon className="w-4 h-4" />
            </Button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Preview Area */}
          <div className="flex-1 flex">
            {/* Video Preview */}
            <div className="flex-1 bg-black flex items-center justify-center relative">
              <div className="w-full max-w-2xl aspect-video bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Video placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-50"></div>
                
                {/* Text overlays */}
                {textOverlays.map(overlay => {
                  const isVisible = currentTime >= overlay.startTime && currentTime <= overlay.startTime + overlay.duration;
                  return isVisible ? (
                    <div
                      key={overlay.id}
                      className="absolute text-white font-bold pointer-events-none"
                      style={{
                        left: `${overlay.style.position.x}%`,
                        top: `${overlay.style.position.y}%`,
                        fontSize: `${overlay.style.fontSize}px`,
                        color: overlay.style.color,
                        fontFamily: overlay.style.fontFamily,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      {overlay.text}
                    </div>
                  ) : null;
                })}
                
                {/* Playback indicator */}
                <div className="absolute bottom-4 left-4 bg-black/70 px-2 py-1 rounded text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
            </div>

            {/* Properties Panel */}
            <div className="w-80 bg-gray-800 border-l border-gray-700">
              <Tabs defaultValue="video" className="h-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-700">
                  <TabsTrigger value="video">Video</TabsTrigger>
                  <TabsTrigger value="audio">Audio</TabsTrigger>
                  <TabsTrigger value="effects">Effects</TabsTrigger>
                </TabsList>
                
                <TabsContent value="video" className="p-4 space-y-4">
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Video Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-400">Resolution</label>
                        <select className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm">
                          <option>1920x1080 (Full HD)</option>
                          <option>1280x720 (HD)</option>
                          <option>3840x2160 (4K)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Frame Rate</label>
                        <select className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm">
                          <option>30 fps</option>
                          <option>60 fps</option>
                          <option>24 fps</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Brightness</label>
                        <Slider defaultValue={[0]} min={-100} max={100} step={1} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Contrast</label>
                        <Slider defaultValue={[0]} min={-100} max={100} step={1} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Saturation</label>
                        <Slider defaultValue={[0]} min={-100} max={100} step={1} className="mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="audio" className="p-4 space-y-4">
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Audio Mixer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-400">Master Volume</label>
                        <Slider defaultValue={[100]} min={0} max={100} step={1} className="mt-1" />
                      </div>
                      {audioTracks.map(track => (
                        <div key={track.id} className="p-2 bg-gray-600 rounded">
                          <div className="text-xs font-medium mb-1">{track.name}</div>
                          <Slider defaultValue={[track.volume]} min={0} max={100} step={1} />
                        </div>
                      ))}
                      <Button size="sm" className="w-full" onClick={addAudioTrack}>
                        <Music className="w-4 h-4 mr-1" />
                        Add Audio Track
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="effects" className="p-4 space-y-4">
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Effects Library</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        'Blur', 'Sharpen', 'Color Grade', 'Film Grain', 
                        'Vignette', 'Chromatic Aberration', 'Lens Flare', 'Glow'
                      ].map(effect => (
                        <Button
                          key={effect}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-white border-gray-600"
                        >
                          {effect}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Transitions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        'Cut', 'Fade', 'Dissolve', 'Wipe', 'Slide', 'Zoom'
                      ].map(transition => (
                        <Button
                          key={transition}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-white border-gray-600"
                        >
                          {transition}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Timeline */}
          <div className="h-64 bg-gray-800 border-t border-gray-700 flex flex-col">
            {/* Timeline Controls */}
            <div className="flex items-center justify-between p-2 bg-gray-700 border-b border-gray-600">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={togglePlayback}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => seekTo(0)}>
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => seekTo(duration)}>
                  <SkipForward className="w-4 h-4" />
                </Button>
                <div className="text-sm font-mono">
                  {formatTime(currentTime)}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={addVideoClip}>
                  <Upload className="w-4 h-4 mr-1" />
                  Add Media
                </Button>
                <Button size="sm" variant="ghost" onClick={addTextOverlay}>
                  <Type className="w-4 h-4 mr-1" />
                  Add Text
                </Button>
                <div className="flex items-center gap-1">
                  <label className="text-xs">Zoom:</label>
                  <Slider
                    value={[zoom]}
                    onValueChange={(value) => setZoom(value[0])}
                    min={25}
                    max={400}
                    step={25}
                    className="w-16"
                  />
                  <span className="text-xs w-8">{zoom}%</span>
                </div>
              </div>
            </div>

            {/* Timeline Tracks */}
            <div className="flex-1 overflow-auto" ref={timelineRef}>
              <div className="relative" style={{ width: Math.max(800, timelineWidth) }}>
                {/* Time ruler */}
                <div className="h-6 bg-gray-600 border-b border-gray-500 relative">
                  {Array.from({ length: Math.ceil(duration / 10) + 1 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-l border-gray-400"
                      style={{ left: i * 100 * timelineScale }}
                    >
                      <span className="text-xs text-gray-300 ml-1">{i * 10}s</span>
                    </div>
                  ))}
                  
                  {/* Playhead */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: currentTime * 10 * timelineScale }}
                  />
                </div>

                {/* Video Track */}
                <div className="h-12 bg-gray-700 border-b border-gray-600 relative">
                  <div className="absolute left-0 top-0 h-full flex items-center px-2 text-xs font-medium bg-gray-600 border-r border-gray-500 w-16">
                    Video 1
                  </div>
                  {videoClips.map(clip => (
                    <div
                      key={clip.id}
                      className="absolute top-1 bottom-1 bg-blue-600 rounded border border-blue-400 cursor-pointer hover:bg-blue-500"
                      style={{
                        left: clip.startTime * 10 * timelineScale + 64,
                        width: (clip.endTime - clip.startTime) * 10 * timelineScale
                      }}
                    >
                      <div className="p-1 text-xs text-white truncate">{clip.name}</div>
                    </div>
                  ))}
                </div>

                {/* Audio Track */}
                <div className="h-12 bg-gray-700 border-b border-gray-600 relative">
                  <div className="absolute left-0 top-0 h-full flex items-center px-2 text-xs font-medium bg-gray-600 border-r border-gray-500 w-16">
                    Audio 1
                  </div>
                  {audioTracks.map(track => (
                    <div
                      key={track.id}
                      className="absolute top-1 bottom-1 bg-green-600 rounded border border-green-400 cursor-pointer hover:bg-green-500"
                      style={{
                        left: track.startTime * 10 * timelineScale + 64,
                        width: track.duration * 10 * timelineScale
                      }}
                    >
                      <div className="p-1 text-xs text-white truncate">{track.name}</div>
                    </div>
                  ))}
                </div>

                {/* Text Track */}
                <div className="h-12 bg-gray-700 border-b border-gray-600 relative">
                  <div className="absolute left-0 top-0 h-full flex items-center px-2 text-xs font-medium bg-gray-600 border-r border-gray-500 w-16">
                    Text
                  </div>
                  {textOverlays.map(overlay => (
                    <div
                      key={overlay.id}
                      className="absolute top-1 bottom-1 bg-yellow-600 rounded border border-yellow-400 cursor-pointer hover:bg-yellow-500"
                      style={{
                        left: overlay.startTime * 10 * timelineScale + 64,
                        width: overlay.duration * 10 * timelineScale
                      }}
                    >
                      <div className="p-1 text-xs text-white truncate">{overlay.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};