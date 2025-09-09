import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileSpreadsheet, Monitor, FileText, BarChart3, Calculator, FileImage } from 'lucide-react';
import { Spreadsheet } from './Spreadsheet';
import { PresentationApp } from './Presentation';

type AppType = 'home' | 'spreadsheet' | 'presentation';

export const OfficeSuite: FC = () => {
  const [activeApp, setActiveApp] = useState<AppType>('home');

  const apps = [
    {
      id: 'spreadsheet',
      name: 'Excel',
      description: 'Create and edit spreadsheets with formulas, charts, and data analysis',
      icon: FileSpreadsheet,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      component: Spreadsheet
    },
    {
      id: 'presentation',
      name: 'PowerPoint',
      description: 'Design stunning presentations with slides, animations, and multimedia',
      icon: Monitor,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      component: PresentationApp
    }
  ];

  if (activeApp !== 'home') {
    const app = apps.find(a => a.id === activeApp);
    if (app) {
      const Component = app.component;
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-2 p-2 border-b bg-muted/20">
            <Button variant="outline" size="sm" onClick={() => setActiveApp('home')}>
              ← Back to Office
            </Button>
            <div className="flex items-center gap-2">
              <app.icon className={`w-5 h-5 ${app.color}`} />
              <span className="font-medium">Microsoft {app.name}</span>
            </div>
          </div>
          <div className="flex-1">
            <Component />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="p-6 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Microsoft Office</h1>
            <p className="text-gray-600">Professional productivity suite</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Choose an application</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {apps.map(app => (
              <Card 
                key={app.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 hover:border-blue-200 ${app.bgColor}`}
                onClick={() => setActiveApp(app.id as AppType)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${app.bgColor}`}>
                      <app.icon className={`w-8 h-8 ${app.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Microsoft {app.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {app.description}
                      </p>
                      <Button className="w-full">
                        Open {app.name}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Files Section */}
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Files</h3>
            <div className="grid gap-3">
              {[
                { name: 'Quarterly Report.xlsx', app: 'Excel', time: '2 hours ago', icon: FileSpreadsheet },
                { name: 'Project Presentation.pptx', app: 'PowerPoint', time: '5 hours ago', icon: Monitor },
                { name: 'Budget Analysis.xlsx', app: 'Excel', time: '1 day ago', icon: FileSpreadsheet }
              ].map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/50 cursor-pointer transition-colors">
                  <file.icon className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{file.name}</div>
                    <div className="text-sm text-gray-600">{file.app} • {file.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-white/80 backdrop-blur-sm">
        <div className="text-center text-sm text-gray-600">
          Microsoft Office Suite for WebOS • Version 2024
        </div>
      </div>
    </div>
  );
};