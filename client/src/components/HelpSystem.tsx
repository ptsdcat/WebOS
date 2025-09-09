import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  HelpCircle, 
  BookOpen, 
  Play, 
  Zap, 
  Monitor, 
  Keyboard,
  X,
  ChevronRight,
  Clock
} from 'lucide-react';

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: (tourType: 'welcome' | 'features' | 'advanced') => void;
}

const HELP_TOPICS = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of navigating WebOS',
    icon: <Play className="w-5 h-5" />,
    action: 'tour:welcome',
    estimated: '3 min'
  },
  {
    id: 'features',
    title: 'Features Overview',
    description: 'Discover all the applications and tools available',
    icon: <Zap className="w-5 h-5" />,
    action: 'tour:features',
    estimated: '5 min'
  },
  {
    id: 'advanced',
    title: 'Advanced Usage',
    description: 'Master workspace management and power features',
    icon: <Monitor className="w-5 h-5" />,
    action: 'tour:advanced',
    estimated: '8 min'
  }
];

const QUICK_TIPS = [
  {
    title: 'Quick Launch',
    shortcut: 'Ctrl + Space',
    description: 'Instantly search and launch any application'
  },
  {
    title: 'Drag Icons',
    shortcut: 'Click & Drag',
    description: 'Rearrange desktop icons by dragging them'
  },
  {
    title: 'Right Click',
    shortcut: 'Right Click',
    description: 'Access context menus for additional options'
  },
  {
    title: 'Workspace Switch',
    shortcut: 'Click Numbers',
    description: 'Switch between different desktop workspaces'
  }
];

const FAQ_ITEMS = [
  {
    question: 'How do I install new applications?',
    answer: 'Use the Package Manager app to browse and install new applications. Click on any package and select "Install" to add it to your desktop.'
  },
  {
    question: 'Can I organize my desktop icons?',
    answer: 'Yes! You can drag icons to rearrange them, or use the "Organize Apps" button to create folders and group applications by category.'
  },
  {
    question: 'How do I browse the internet?',
    answer: 'Launch the Web Browser app to access real websites. The browser supports full web browsing with a built-in proxy system.'
  },
  {
    question: 'What are achievements?',
    answer: 'Achievements track your usage patterns and reward you for exploring different features. Check the Achievements app to see your progress.'
  },
  {
    question: 'How do I change my password or settings?',
    answer: 'Use the Account Manager app to update your profile, change passwords, and manage user accounts if you have admin privileges.'
  }
];

export const HelpSystem: FC<HelpSystemProps> = ({ isOpen, onClose, onStartTour }) => {
  const [activeSection, setActiveSection] = useState<'tours' | 'tips' | 'faq'>('tours');

  if (!isOpen) return null;

  const handleActionClick = (action: string) => {
    if (action.startsWith('tour:')) {
      const tourType = action.split(':')[1] as 'welcome' | 'features' | 'advanced';
      onStartTour(tourType);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-4xl max-h-[80vh] m-4 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-muted/30 border-r p-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Help Center</h2>
                <p className="text-xs text-muted-foreground">Learn WebOS</p>
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('tours')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeSection === 'tours' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Interactive Tours</span>
              </button>

              <button
                onClick={() => setActiveSection('tips')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeSection === 'tips' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Keyboard className="w-4 h-4" />
                <span className="text-sm font-medium">Quick Tips</span>
              </button>

              <button
                onClick={() => setActiveSection('faq')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeSection === 'faq' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm font-medium">FAQ</span>
              </button>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold capitalize">{activeSection}</h1>
                <p className="text-muted-foreground">
                  {activeSection === 'tours' && 'Take guided tours to learn WebOS features'}
                  {activeSection === 'tips' && 'Quick keyboard shortcuts and tips'}
                  {activeSection === 'faq' && 'Frequently asked questions and answers'}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Tours Section */}
            {activeSection === 'tours' && (
              <div className="space-y-4">
                {HELP_TOPICS.map((topic) => (
                  <Card key={topic.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          {topic.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{topic.title}</h3>
                          <p className="text-sm text-muted-foreground">{topic.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {topic.estimated}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => handleActionClick(topic.action)}>
                        Start Tour
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                ))}

                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">New to WebOS?</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        We recommend starting with the "Getting Started" tour to learn the basics, 
                        then explore the features tour to discover all available applications.
                      </p>
                      <Button 
                        size="sm" 
                        onClick={() => handleActionClick('tour:welcome')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Start Here
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Tips Section */}
            {activeSection === 'tips' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {QUICK_TIPS.map((tip, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{tip.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {tip.shortcut}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{tip.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Separator />

                <Card className="p-4 bg-green-50 border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">Pro Tip</h4>
                  <p className="text-sm text-green-700">
                    You can access this help system anytime by clicking the help button in the taskbar 
                    or pressing F1 while on the desktop.
                  </p>
                </Card>
              </div>
            )}

            {/* FAQ Section */}
            {activeSection === 'faq' && (
              <div className="space-y-4">
                {FAQ_ITEMS.map((item, index) => (
                  <Card key={index} className="p-4">
                    <h4 className="font-medium mb-2">{item.question}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                  </Card>
                ))}

                <Card className="p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">Need More Help?</h4>
                      <p className="text-sm text-yellow-700">
                        If you can't find what you're looking for, try taking one of our interactive 
                        tours or explore the applications to learn by doing.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};