import { FC, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Save, FolderOpen, Upload, Download, Settings, 
  Box, Circle, Move3D, RotateCcw, 
  Scale, Eye, EyeOff, Trash2, Copy, Layers, Code,
  Paintbrush, Zap, Globe, Users, TestTube
} from 'lucide-react';

interface GameObject {
  id: string;
  name: string;
  type: 'part' | 'model' | 'script' | 'gui';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: string;
  material: string;
  visible: boolean;
  children: GameObject[];
}

interface Script {
  id: string;
  name: string;
  content: string;
  type: 'server' | 'local' | 'module';
}

export const RobloxStudio: FC = () => {
  const [projectName, setProjectName] = useState('Untitled Place');
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [viewport3D, setViewport3D] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [gameObjects, setGameObjects] = useState<GameObject[]>([
    {
      id: '1',
      name: 'Workspace',
      type: 'model',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: '#ffffff',
      material: 'Plastic',
      visible: true,
      children: [
        {
          id: '2',
          name: 'SpawnLocation',
          type: 'part',
          position: { x: 0, y: -10, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 6, y: 1, z: 6 },
          color: '#00ff00',
          material: 'Neon',
          visible: true,
          children: []
        },
        {
          id: '3',
          name: 'Baseplate',
          type: 'part',
          position: { x: 0, y: -20, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 100, y: 1, z: 100 },
          color: '#808080',
          material: 'Concrete',
          visible: true,
          children: []
        }
      ]
    }
  ]);

  const [scripts, setScripts] = useState<Script[]>([
    {
      id: '1',
      name: 'PlayerSpawn',
      type: 'server',
      content: `-- Player Spawn Script
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

Players.PlayerAdded:Connect(function(player)
    player.CharacterAdded:Connect(function(character)
        local humanoid = character:WaitForChild("Humanoid")
        local spawnLocation = workspace.SpawnLocation
        
        character:SetPrimaryPartCFrame(spawnLocation.CFrame + Vector3.new(0, 10, 0))
        print(player.Name .. " has spawned!")
    end)
end)`
    },
    {
      id: '2',
      name: 'GameLogic',
      type: 'server',
      content: `-- Main Game Logic
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

-- Game settings
local GAME_DURATION = 300 -- 5 minutes
local MAX_PLAYERS = 12

-- Game state
local gameActive = false
local players = {}

function startGame()
    gameActive = true
    print("Game started!")
    
    -- Initialize player data
    for _, player in pairs(Players:GetPlayers()) do
        players[player.UserId] = {
            score = 0,
            coins = 0,
            level = 1
        }
    end
end

function endGame()
    gameActive = false
    print("Game ended!")
    -- Handle game end logic
end

-- Start the game when enough players join
Players.PlayerAdded:Connect(function(player)
    if #Players:GetPlayers() >= 2 and not gameActive then
        wait(5) -- Give time for more players
        startGame()
    end
end)`
    }
  ]);

  const [activeScript, setActiveScript] = useState<string | null>(scripts[0]?.id || null);

  const tools = [
    { id: 'select', icon: Move3D, name: 'Select' },
    { id: 'move', icon: Move3D, name: 'Move' },
    { id: 'rotate', icon: RotateCcw, name: 'Rotate' },
    { id: 'scale', icon: Scale, name: 'Scale' },
    { id: 'part', icon: Box, name: 'Part' },
    { id: 'sphere', icon: Circle, name: 'Sphere' },
    { id: 'cylinder', icon: Circle, name: 'Cylinder' },
    { id: 'cone', icon: Circle, name: 'Cone' }
  ];

  const materials = ['Plastic', 'Wood', 'Metal', 'Concrete', 'Brick', 'Granite', 'Glass', 'Neon', 'ForceField'];

  const addGameObject = (type: string) => {
    const newObject: GameObject = {
      id: Date.now().toString(),
      name: `New${type.charAt(0).toUpperCase()}${type.slice(1)}`,
      type: 'part',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 4, y: 4, z: 4 },
      color: '#4287f5',
      material: 'Plastic',
      visible: true,
      children: []
    };

    setGameObjects(prev => {
      const workspace = prev[0];
      return [{
        ...workspace,
        children: [...workspace.children, newObject]
      }];
    });
  };

  const deleteSelectedObject = () => {
    if (!selectedObject) return;
    
    setGameObjects(prev => {
      const workspace = prev[0];
      return [{
        ...workspace,
        children: workspace.children.filter(obj => obj.id !== selectedObject)
      }];
    });
    setSelectedObject(null);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      alert('Testing game...\n\nThis would start a local test server where you can play your game!');
    }
  };

  const publishGame = () => {
    alert(`Publishing "${projectName}"...\n\nThis would upload your game to the Roblox platform for others to play!`);
  };

  const saveProject = () => {
    const projectData = {
      name: projectName,
      objects: gameObjects,
      scripts: scripts,
      timestamp: new Date().toISOString()
    };
    console.log('Saving project:', projectData);
    alert('Project saved successfully!');
  };

  const renderHierarchy = (objects: GameObject[], depth = 0) => {
    return objects.map(obj => (
      <div key={obj.id} style={{ marginLeft: depth * 16 }}>
        <div 
          className={`flex items-center gap-2 p-1 hover:bg-gray-700 cursor-pointer ${
            selectedObject === obj.id ? 'bg-blue-600' : ''
          }`}
          onClick={() => setSelectedObject(obj.id)}
        >
          <div className="w-4 h-4 flex items-center justify-center">
            {obj.type === 'part' && <Box className="w-3 h-3" />}
            {obj.type === 'model' && <Layers className="w-3 h-3" />}
            {obj.type === 'script' && <Code className="w-3 h-3" />}
          </div>
          <span className="text-sm">{obj.name}</span>
          <div className="ml-auto flex gap-1">
            <button onClick={(e) => { e.stopPropagation(); /* toggle visibility */ }}>
              {obj.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
          </div>
        </div>
        {obj.children.length > 0 && renderHierarchy(obj.children, depth + 1)}
      </div>
    ));
  };

  const getSelectedObject = (): GameObject | null => {
    if (!selectedObject) return null;
    
    const findObject = (objects: GameObject[]): GameObject | null => {
      for (const obj of objects) {
        if (obj.id === selectedObject) return obj;
        const found = findObject(obj.children);
        if (found) return found;
      }
      return null;
    };
    
    return findObject(gameObjects);
  };

  const updateSelectedObject = (updates: Partial<GameObject>) => {
    if (!selectedObject) return;
    
    setGameObjects(prev => {
      const updateObject = (objects: GameObject[]): GameObject[] => {
        return objects.map(obj => {
          if (obj.id === selectedObject) {
            return { ...obj, ...updates };
          }
          if (obj.children.length > 0) {
            return { ...obj, children: updateObject(obj.children) };
          }
          return obj;
        });
      };
      
      return updateObject(prev);
    });
  };

  const selectedObj = getSelectedObject();

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-lg font-bold text-blue-400">Roblox Studio</div>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white w-48"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={saveProject}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button 
            onClick={togglePlay}
            className={isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
          >
            {isPlaying ? 'Stop' : <Play className="w-4 h-4 mr-1" />}
            {isPlaying ? 'Stop' : 'Test'}
          </Button>
          <Button onClick={publishGame} className="bg-blue-600 hover:bg-blue-700">
            <Upload className="w-4 h-4 mr-1" />
            Publish
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center gap-1">
        {tools.map(tool => (
          <Button
            key={tool.id}
            variant={selectedTool === tool.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTool(tool.id)}
            title={tool.name}
            className="w-10 h-10 p-0"
          >
            <tool.icon className="w-4 h-4" />
          </Button>
        ))}
        
        <div className="w-px h-6 bg-gray-600 mx-2" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addGameObject('part')}
          title="Add Part"
        >
          <Box className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={deleteSelectedObject}
          title="Delete"
          disabled={!selectedObject}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Explorer */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <Tabs defaultValue="explorer" className="flex-1">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="explorer">Explorer</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
            </TabsList>
            
            <TabsContent value="explorer" className="flex-1 p-2">
              <div className="space-y-1">
                {renderHierarchy(gameObjects)}
              </div>
            </TabsContent>
            
            <TabsContent value="properties" className="flex-1 p-3 space-y-3">
              {selectedObj ? (
                <>
                  <div>
                    <label className="text-xs text-gray-400">Name</label>
                    <Input
                      value={selectedObj.name}
                      onChange={(e) => updateSelectedObject({ name: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400">Material</label>
                    <select
                      value={selectedObj.material}
                      onChange={(e) => updateSelectedObject({ material: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                    >
                      {materials.map(material => (
                        <option key={material} value={material}>{material}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400">Color</label>
                    <input
                      type="color"
                      value={selectedObj.color}
                      onChange={(e) => updateSelectedObject({ color: e.target.value })}
                      className="w-full h-8 bg-gray-700 border border-gray-600 rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400">Position X</label>
                    <Slider
                      value={[selectedObj.position.x]}
                      onValueChange={(value) => updateSelectedObject({ 
                        position: { ...selectedObj.position, x: value[0] }
                      })}
                      min={-50}
                      max={50}
                      step={0.5}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400">Position Y</label>
                    <Slider
                      value={[selectedObj.position.y]}
                      onValueChange={(value) => updateSelectedObject({ 
                        position: { ...selectedObj.position, y: value[0] }
                      })}
                      min={-50}
                      max={50}
                      step={0.5}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400">Position Z</label>
                    <Slider
                      value={[selectedObj.position.z]}
                      onValueChange={(value) => updateSelectedObject({ 
                        position: { ...selectedObj.position, z: value[0] }
                      })}
                      min={-50}
                      max={50}
                      step={0.5}
                      className="mt-1"
                    />
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-sm">Select an object to edit properties</div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Center - 3D Viewport */}
        <div className="flex-1 bg-gray-900 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-gray-900 flex items-center justify-center">
            {/* 3D Viewport Simulation */}
            <div className="relative w-full h-full overflow-hidden">
              {/* Grid floor */}
              <div className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                <div className="w-96 h-96 bg-gray-700 opacity-30 border border-gray-600" 
                     style={{ 
                       background: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px), repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)' 
                     }}>
                </div>
              </div>
              
              {/* Render game objects */}
              {gameObjects[0]?.children.map(obj => (
                <div
                  key={obj.id}
                  className={`absolute border-2 cursor-pointer ${
                    selectedObject === obj.id ? 'border-blue-400' : 'border-white/30'
                  }`}
                  style={{
                    left: `${50 + obj.position.x}%`,
                    top: `${50 - obj.position.y}%`,
                    width: `${obj.scale.x * 4}px`,
                    height: `${obj.scale.y * 4}px`,
                    backgroundColor: obj.color,
                    opacity: 0.8,
                    transform: `translate(-50%, -50%) rotateZ(${obj.rotation.z}deg)`
                  }}
                  onClick={() => setSelectedObject(obj.id)}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/50 px-1 rounded">
                    {obj.name}
                  </div>
                </div>
              ))}
              
              {/* Viewport info */}
              <div className="absolute top-4 left-4 bg-black/50 px-2 py-1 rounded text-sm">
                Camera: Perspective | Tool: {tools.find(t => t.id === selectedTool)?.name}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Scripts */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Scripts</h3>
              <Button size="sm" variant="ghost">
                <Code className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {scripts.map(script => (
                <div
                  key={script.id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                    activeScript === script.id ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveScript(script.id)}
                >
                  <Code className="w-4 h-4" />
                  <span className="text-sm">{script.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{script.type}</span>
                </div>
              ))}
            </div>
          </div>
          
          {activeScript && (
            <div className="flex-1 flex flex-col">
              <div className="p-2 bg-gray-700 text-sm">
                {scripts.find(s => s.id === activeScript)?.name} - Lua Script
              </div>
              <div className="flex-1 p-3">
                <textarea
                  value={scripts.find(s => s.id === activeScript)?.content || ''}
                  onChange={(e) => {
                    setScripts(prev => prev.map(script => 
                      script.id === activeScript 
                        ? { ...script, content: e.target.value }
                        : script
                    ));
                  }}
                  className="w-full h-full bg-gray-900 border border-gray-600 text-green-400 font-mono text-sm p-2 resize-none"
                  placeholder="-- Write your Lua script here"
                  style={{ fontFamily: 'Monaco, Consolas, monospace' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 p-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span>Objects: {gameObjects[0]?.children.length || 0}</span>
          <span>Scripts: {scripts.length}</span>
          {selectedObject && <span>Selected: {selectedObj?.name}</span>}
        </div>
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            <span>Studio</span>
          </div>
        </div>
      </div>
    </div>
  );
};