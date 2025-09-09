import { FC, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface WelcomeDialogProps {
  isOpen: boolean;
  onComplete: (userInfo: UserSetupInfo) => void;
}

interface UserSetupInfo {
  username: string;
  theme: string;
  wallpaper: string;
  showTutorial: boolean;
}

export const WelcomeDialog: FC<WelcomeDialogProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(0);
  const [userInfo, setUserInfo] = useState<UserSetupInfo>({
    username: 'user',
    theme: 'dark',
    wallpaper: 'default',
    showTutorial: true
  });

  const steps = [
    {
      title: 'Welcome to WebOS!',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-lg text-muted-foreground">
              Installation completed successfully! WebOS is now ready to use.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Let's set up your system preferences to get you started.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'User Setup',
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Choose a username</Label>
            <Input
              id="username"
              value={userInfo.username}
              onChange={(e) => setUserInfo(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter your username"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This will be displayed in the terminal and system
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Appearance',
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="theme">Theme</Label>
            <Select 
              value={userInfo.theme} 
              onValueChange={(value) => setUserInfo(prev => ({ ...prev, theme: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark (Recommended)</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="auto">Auto (System)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="wallpaper">Wallpaper</Label>
            <Select 
              value={userInfo.wallpaper} 
              onValueChange={(value) => setUserInfo(prev => ({ ...prev, wallpaper: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Arch Dark</SelectItem>
                <SelectItem value="terminal">Terminal Green</SelectItem>
                <SelectItem value="code">Code Blue</SelectItem>
                <SelectItem value="matrix">Matrix Black</SelectItem>
                <SelectItem value="cyber">Cyber Purple</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: 'Getting Started',
      content: (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tutorial"
              checked={userInfo.showTutorial}
              onCheckedChange={(checked) => setUserInfo(prev => ({ ...prev, showTutorial: !!checked }))}
            />
            <Label htmlFor="tutorial">Show tutorial on first launch</Label>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Quick Tips:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Double-click desktop icons to open applications</li>
              <li>• Use the start menu for quick access to all apps</li>
              <li>• Terminal supports many Linux commands</li>
              <li>• Package manager lets you install new software</li>
              <li>• Settings app allows customization</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('webos-user-setup', JSON.stringify(userInfo));
    localStorage.setItem('webos-setup-complete', 'true');
    onComplete(userInfo);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {steps[step].title}
            <span className="text-sm text-muted-foreground">
              {step + 1} of {steps.length}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {steps[step].content}
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={step === 0}
          >
            Previous
          </Button>
          
          <Button onClick={handleNext}>
            {step === steps.length - 1 ? 'Complete Setup' : 'Next'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};