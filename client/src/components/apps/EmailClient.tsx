import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Mail, Send, Inbox, Edit, Search } from 'lucide-react';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
  read: boolean;
}

export const EmailClient: FC = () => {
  const [emails, setEmails] = useState<Email[]>(() => {
    const stored = localStorage.getItem('email-messages');
    return stored ? JSON.parse(stored).map((e: any) => ({
      ...e,
      timestamp: new Date(e.timestamp)
    })) : [
      {
        id: '1',
        from: 'team@webos.dev',
        to: 'user@webos.local',
        subject: 'Welcome to WebOS Email',
        body: 'Thank you for installing the email client. This is a sample email to demonstrate functionality.',
        timestamp: new Date(),
        read: false
      }
    ];
  });

  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: ''
  });

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmailSelect = (email: Email) => {
    if (!email.read) {
      const updatedEmails = emails.map(e =>
        e.id === email.id ? { ...e, read: true } : e
      );
      setEmails(updatedEmails);
      localStorage.setItem('email-messages', JSON.stringify(updatedEmails));
    }
    setSelectedEmail(email);
    setShowCompose(false);
  };

  const handleSendEmail = () => {
    if (composeData.to && composeData.subject) {
      const newEmail: Email = {
        id: Date.now().toString(),
        from: 'user@webos.local',
        to: composeData.to,
        subject: composeData.subject,
        body: composeData.body,
        timestamp: new Date(),
        read: true
      };

      const updatedEmails = [newEmail, ...emails];
      setEmails(updatedEmails);
      localStorage.setItem('email-messages', JSON.stringify(updatedEmails));
      
      setComposeData({ to: '', subject: '', body: '' });
      setShowCompose(false);
      setSelectedEmail(newEmail);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-border bg-muted/30">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <span className="font-semibold">Email</span>
          </div>
          
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button 
            onClick={() => { setShowCompose(true); setSelectedEmail(null); }}
            className="w-full"
          >
            <Edit className="w-4 h-4 mr-2" />
            Compose
          </Button>
        </div>

        <div className="overflow-auto">
          {filteredEmails.map(email => (
            <div
              key={email.id}
              onClick={() => handleEmailSelect(email)}
              className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 ${
                selectedEmail?.id === email.id ? 'bg-primary/10' : ''
              } ${!email.read ? 'font-semibold' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-medium truncate">{email.from}</span>
                <span className="text-xs text-muted-foreground">{formatDate(email.timestamp)}</span>
              </div>
              <div className="text-sm truncate mb-1">{email.subject}</div>
              <div className="text-xs text-muted-foreground truncate">{email.body}</div>
              {!email.read && (
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {showCompose ? (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Compose Email</h2>
            <div className="space-y-4">
              <Input
                placeholder="To:"
                value={composeData.to}
                onChange={(e) => setComposeData({...composeData, to: e.target.value})}
              />
              <Input
                placeholder="Subject:"
                value={composeData.subject}
                onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
              />
              <Textarea
                placeholder="Message:"
                value={composeData.body}
                onChange={(e) => setComposeData({...composeData, body: e.target.value})}
                className="min-h-64"
              />
              <div className="flex gap-2">
                <Button onClick={handleSendEmail}>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
                <Button variant="outline" onClick={() => setShowCompose(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : selectedEmail ? (
          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{selectedEmail.subject}</h2>
              <div className="text-sm text-muted-foreground mt-1">
                From: {selectedEmail.from} | To: {selectedEmail.to}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDate(selectedEmail.timestamp)}
              </div>
            </div>
            <div className="prose prose-sm">
              {selectedEmail.body.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Inbox className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select an email to read or compose a new message</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};