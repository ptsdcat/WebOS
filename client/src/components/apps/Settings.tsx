import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Monitor, Palette, Volume2, User, Power, Settings as SettingsIcon, RotateCcw, LogOut, Moon, Upload, Heart } from 'lucide-react';
import { soundManager, playSounds } from '@/lib/soundManager';
import { colorPaletteManager } from '@/lib/colorPalette';

interface SettingsCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const categories: SettingsCategory[] = [
  { id: 'display', name: 'Display', icon: <Monitor className="w-4 h-4" /> },
  { id: 'themes', name: 'Themes', icon: <Palette className="w-4 h-4" /> },
  { id: 'audio', name: 'Audio', icon: <Volume2 className="w-4 h-4" /> },
  { id: 'account', name: 'Account', icon: <User className="w-4 h-4" /> },
  { id: 'power', name: 'Power', icon: <Power className="w-4 h-4" /> }
];

const wallpapers = [
  { id: 'default', name: 'Arch Dark', preview: 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900' },
  { id: 'terminal', name: 'Terminal Green', preview: 'bg-gradient-to-br from-green-900 to-black' },
  { id: 'code', name: 'Code Blue', preview: 'bg-gradient-to-br from-blue-900 to-indigo-900' },
  { id: 'matrix', name: 'Matrix Black', preview: 'bg-gradient-to-br from-black to-green-800' },
  { id: 'cyber', name: 'Cyber Purple', preview: 'bg-gradient-to-br from-purple-900 to-black' },
  { id: 'sunset', name: 'Sunset Orange', preview: 'bg-gradient-to-br from-orange-600 to-red-800' },
  { id: 'ocean', name: 'Ocean Blue', preview: 'bg-gradient-to-br from-blue-400 to-blue-800' },
  { id: 'forest', name: 'Forest Green', preview: 'bg-gradient-to-br from-green-600 to-green-900' },
  { id: 'fire', name: 'Fire Red', preview: 'bg-gradient-to-br from-red-500 to-orange-700' },
  { id: 'cosmic', name: 'Cosmic Purple', preview: 'bg-gradient-to-br from-indigo-600 to-purple-800' },
  { id: 'dawn', name: 'Dawn Pink', preview: 'bg-gradient-to-br from-pink-400 to-purple-600' },
  { id: 'midnight', name: 'Midnight Blue', preview: 'bg-gradient-to-br from-gray-900 to-blue-900' }
];

interface SettingsProps {
  onShutdown?: () => void;
  onRestart?: () => void;
  onLogout?: () => void;
}

export const Settings: FC<SettingsProps> = ({ onShutdown, onRestart, onLogout }) => {
  const [activeCategory, setActiveCategory] = useState('display');
  const [currentPalette, setCurrentPalette] = useState(colorPaletteManager.getCurrentPalette());
  const [allPalettes, setAllPalettes] = useState(colorPaletteManager.getAllPalettes());
  const [settings, setSettings] = useState(() => ({
    theme: 'dark',
    wallpaper: 'default',
    showDesktopIcons: true,
    soundEffects: soundManager.isEnabled(),
    soundVolume: soundManager.getVolume() * 100,
    notificationsEnabled: true,
    username: 'html@javascriptiso',
    autoLogin: false,
    autoSleep: false,
    sleepTimer: '30',
    colorPalette: currentPalette.id
  }));


  useEffect(() => {
    const unsubscribe = colorPaletteManager.onChange((palette) => {
      setCurrentPalette(palette);
      setAllPalettes(colorPaletteManager.getAllPalettes());
      setSettings(prev => ({
        ...prev,
        colorPalette: palette.id
      }));
    });

    return unsubscribe;
  }, []);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Apply wallpaper change immediately
    if (key === 'wallpaper') {
      const wallpaper = wallpapers.find(w => w.id === value);
      if (wallpaper) {
        localStorage.setItem('webos-wallpaper', value);
        // Dispatch custom event to update desktop background
        window.dispatchEvent(new CustomEvent('wallpaper-change', { 
          detail: { wallpaper: value } 
        }));
      }
    }

    // Handle sound settings
    if (key === 'soundEffects') {
      soundManager.setEnabled(value);
      if (value) playSounds.buttonClick();
    } else if (key === 'soundVolume') {
      soundManager.setVolume(value / 100);
      playSounds.buttonClick();
    } else {
      playSounds.buttonClick();
    }
    
    // Apply theme change
    if (key === 'theme') {
      localStorage.setItem('webos-theme', value);
      document.documentElement.classList.toggle('dark', value === 'dark');
    }
    
    // Apply desktop icons setting
    if (key === 'showDesktopIcons') {
      localStorage.setItem('webos-show-icons', value.toString());
      window.dispatchEvent(new CustomEvent('desktop-icons-toggle', { 
        detail: { show: value } 
      }));
    }
    
    
    // Handle color palette change
    if (key === 'colorPalette') {
      colorPaletteManager.setPalette(value);
    }
  };

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'display':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Theme</Label>
              <p className="text-sm text-gray-600 mb-3">Choose your preferred theme</p>
              <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark (Arch)</SelectItem>
                  <SelectItem value="auto">Auto (System)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium">Wallpaper</Label>
              <p className="text-sm text-gray-600 mb-3">Select your desktop background</p>
              
              {/* Custom Image Upload */}
              <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const imageData = event.target?.result as string;
                          localStorage.setItem('webos-custom-wallpaper', imageData);
                          localStorage.setItem('webos-wallpaper', 'custom');
                          setSettings(prev => ({ ...prev, wallpaper: 'custom' }));
                          
                          // Dispatch wallpaper change event
                          window.dispatchEvent(new CustomEvent('wallpaper-change', { 
                            detail: { wallpaper: 'custom' } 
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="wallpaper-upload"
                  />
                  <label 
                    htmlFor="wallpaper-upload" 
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Custom Image
                  </label>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF up to 10MB</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Custom wallpaper option */}
                {localStorage.getItem('webos-custom-wallpaper') && (
                  <button
                    onClick={() => updateSetting('wallpaper', 'custom')}
                    className={`w-full h-16 rounded-lg border-2 transition-all bg-cover bg-center ${
                      settings.wallpaper === 'custom'
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      backgroundImage: `url(${localStorage.getItem('webos-custom-wallpaper')})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                    title="Custom Image"
                  >
                    <div className="w-full h-full bg-black bg-opacity-30 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Custom</span>
                    </div>
                  </button>
                )}
                
                {wallpapers.map((wallpaper) => (
                  <button
                    key={wallpaper.id}
                    onClick={() => updateSetting('wallpaper', wallpaper.id)}
                    className={`w-full h-16 rounded-lg border-2 transition-all ${
                      settings.wallpaper === wallpaper.id
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${wallpaper.preview}`}
                    title={wallpaper.name}
                  >
                    <span className="sr-only">{wallpaper.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Show Desktop Icons</Label>
                <p className="text-sm text-gray-600">Display application icons on desktop</p>
              </div>
              <Switch
                checked={settings.showDesktopIcons}
                onCheckedChange={(checked) => updateSetting('showDesktopIcons', checked)}
              />
            </div>
          </div>
        );

      case 'themes':
        return (
          <div className="space-y-6">

            <div>
              <Label className="text-base font-medium">Color Palette</Label>
              <p className="text-sm text-gray-600 mb-3">Choose your interface color scheme</p>
              <Select value={settings.colorPalette} onValueChange={(value) => updateSetting('colorPalette', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allPalettes.map((palette) => (
                    <SelectItem key={palette.id} value={palette.id}>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: palette.primary }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: palette.accent }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: palette.success }}
                          />
                        </div>
                        <span>{palette.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => window.dispatchEvent(new CustomEvent('open-app', { detail: 'color-palette-selector' }))}
              >
                <Palette className="w-4 h-4 mr-2" />
                Advanced Color Editor
              </Button>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Audio Settings</h3>
              <p className="text-sm text-gray-600 mb-6">
                Configure system sounds and audio preferences.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Sound Effects</Label>
                <p className="text-sm text-gray-600">Play sounds for system events</p>
              </div>
              <Switch
                checked={settings.soundEffects}
                onCheckedChange={(checked) => updateSetting('soundEffects', checked)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">System Volume</Label>
              <div className="px-3">
                <Slider
                  value={[settings.soundVolume]}
                  onValueChange={([value]) => updateSetting('soundVolume', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                  disabled={!settings.soundEffects}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Silent</span>
                  <span>{settings.soundVolume}%</span>
                  <span>Loud</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Notifications</Label>
                <p className="text-sm text-gray-600">Enable notification sounds</p>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => updateSetting('notificationsEnabled', checked)}
              />
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Test Sounds</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => playSounds.buttonClick()}
                  disabled={!settings.soundEffects}
                >
                  Click
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => playSounds.notification()}
                  disabled={!settings.soundEffects}
                >
                  Notification
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => playSounds.achievement()}
                  disabled={!settings.soundEffects}
                >
                  Achievement
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => playSounds.error()}
                  disabled={!settings.soundEffects}
                >
                  Error
                </Button>
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Username</Label>
              <p className="text-sm text-gray-600 mb-3">Your display name</p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium">{settings.username}</p>
                  <p className="text-sm text-gray-600">Local Account</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Auto Login</Label>
                <p className="text-sm text-gray-600">Sign in automatically at startup</p>
              </div>
              <Switch
                checked={settings.autoLogin}
                onCheckedChange={(checked) => updateSetting('autoLogin', checked)}
              />
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={async () => {
                  if (confirm('Factory Reset Warning\n\nThis will delete ALL data including:\n- User accounts and settings\n- Installed apps and achievements\n- Database records and files\n- All personal data\n\nOnly the core system will remain. This action cannot be undone.\n\nAre you sure you want to proceed?')) {
                    try {
                      // Clear database data
                      await fetch('/api/factory-reset', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      });
                    } catch (error) {
                      console.log('Database reset completed or not available');
                    }
                    
                    // Clear all localStorage except installation state
                    const keysToKeep = [
                      'archInstalled', // Keep installation state
                      'webos-setup-complete' // Keep setup completion
                    ];
                    
                    // Get all localStorage keys
                    const allKeys = Object.keys(localStorage);
                    
                    // Remove all keys except the ones we want to keep
                    allKeys.forEach(key => {
                      if (!keysToKeep.includes(key)) {
                        localStorage.removeItem(key);
                      }
                    });
                    
                    // Clear session storage
                    sessionStorage.clear();
                    
                    // Clear IndexedDB if available
                    if ('indexedDB' in window) {
                      try {
                        const databases = await indexedDB.databases();
                        databases.forEach(db => {
                          if (db.name) {
                            indexedDB.deleteDatabase(db.name);
                          }
                        });
                      } catch (e) {
                        console.log('IndexedDB cleanup completed');
                      }
                    }
                    
                    // Redirect to terminal for reinstallation
                    window.location.href = '/?terminal=true';
                  }
                }}
              >
                Factory Reset WebOS
              </Button>
            </div>
          </div>
        );

      case 'power':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Power Management</h3>
              <p className="text-sm text-gray-600 mb-6">
                Manage system power options and shutdown settings.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">System Actions</h4>
                <div className="space-y-3">
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={() => {
                      if (confirm('Shutdown the system? This will close all applications and shut down WebOS.')) {
                        onShutdown?.();
                      }
                    }}
                  >
                    <Power className="w-4 h-4 mr-2" />
                    Shutdown System
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      if (confirm('Restart the system? This will close all applications and restart WebOS.')) {
                        onRestart?.();
                      }
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restart System
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      if (confirm('Log out of your account? This will close all applications and return to the login screen.')) {
                        onLogout?.();
                      }
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      alert('Sleep mode activated. Click anywhere to wake up.');
                      document.body.style.filter = 'brightness(0.1)';
                      const wakeUp = () => {
                        document.body.style.filter = '';
                        document.removeEventListener('click', wakeUp);
                      };
                      document.addEventListener('click', wakeUp);
                    }}
                  >
                    <Moon className="w-4 h-4 mr-2" />
                    Shutdown Options
                  </Button>

                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={() => {
                      const confirmed = confirm(
                        '⚠️ FORCE SHUTDOWN WARNING ⚠️\n\n' +
                        'This will immediately terminate WebOS without saving:\n' +
                        '• All unsaved work will be lost\n' +
                        '• Running applications will be force-closed\n' +
                        '• System state will not be preserved\n\n' +
                        'Are you absolutely sure you want to kill this operating system?'
                      );
                      
                      if (confirmed) {
                        const finalConfirm = confirm(
                          'FINAL CONFIRMATION\n\n' +
                          'This action cannot be undone.\n' +
                          'WebOS will be terminated immediately.\n\n' +
                          'Proceed with force shutdown?'
                        );
                        
                        if (finalConfirm) {
                          window.close();
                          // If window.close() doesn't work, redirect to a blank page
                          setTimeout(() => {
                            window.location.href = 'about:blank';
                          }, 100);
                        }
                      }
                    }}
                  >
                    <Power className="w-4 h-4 mr-2" />
                    Force Shutdown
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Sleep Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Auto Sleep</Label>
                      <p className="text-sm text-gray-600">Automatically sleep after inactivity</p>
                    </div>
                    <Switch
                      checked={settings.autoSleep || false}
                      onCheckedChange={(checked) => updateSetting('autoSleep', checked)}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Sleep Timer</Label>
                    <Select value={settings.sleepTimer || '30'} onValueChange={(value) => updateSetting('sleepTimer', value)}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 pr-4">
        <div className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                activeCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {category.icon}
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="w-2/3 pl-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5" />
            <span>{categories.find(c => c.id === activeCategory)?.name} Settings</span>
          </h3>
        </div>
        
        {renderCategoryContent()}
      </div>
    </div>
  );
};
