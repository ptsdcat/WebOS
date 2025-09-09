import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Save, FileText, Trash2, Plus } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
}

export const NotePad: FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Load notes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('notepad-notes');
    if (stored) {
      const parsedNotes = JSON.parse(stored).map((note: any) => ({
        ...note,
        lastModified: new Date(note.lastModified)
      }));
      setNotes(parsedNotes);
      if (parsedNotes.length > 0) {
        setActiveNote(parsedNotes[0]);
        setTitle(parsedNotes[0].title);
        setContent(parsedNotes[0].content);
      }
    }
  }, []);

  // Save notes to localStorage
  const saveNotes = (updatedNotes: Note[]) => {
    localStorage.setItem('notepad-notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      lastModified: new Date()
    };
    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);
    setActiveNote(newNote);
    setTitle(newNote.title);
    setContent(newNote.content);
  };

  const saveCurrentNote = () => {
    if (!activeNote) return;

    const updatedNote = {
      ...activeNote,
      title: title || 'Untitled Note',
      content,
      lastModified: new Date()
    };

    const updatedNotes = notes.map(note => 
      note.id === activeNote.id ? updatedNote : note
    );
    
    saveNotes(updatedNotes);
    setActiveNote(updatedNote);
  };

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    saveNotes(updatedNotes);
    
    if (activeNote?.id === noteId) {
      if (updatedNotes.length > 0) {
        setActiveNote(updatedNotes[0]);
        setTitle(updatedNotes[0].title);
        setContent(updatedNotes[0].content);
      } else {
        setActiveNote(null);
        setTitle('');
        setContent('');
      }
    }
  };

  const selectNote = (note: Note) => {
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  return (
    <div className="h-full flex bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-muted/30">
        <div className="p-3 border-b border-border">
          <Button onClick={createNewNote} className="w-full" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
        <div className="overflow-auto h-full">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-3 border-b border-border cursor-pointer hover:bg-accent/50 ${
                activeNote?.id === note.id ? 'bg-accent' : ''
              }`}
              onClick={() => selectNote(note)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{note.title}</h4>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {note.content.slice(0, 50)}...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {note.lastModified.toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="p-6 text-center text-muted-foreground text-sm">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No notes yet. Create your first note!
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {activeNote ? (
          <>
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title..."
                  className="text-lg font-medium"
                />
                <Button onClick={saveCurrentNote} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your note..."
                className="w-full h-full resize-none border-none focus:ring-0 text-base"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Welcome to NotePad</h3>
              <p className="text-sm">Create a new note to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};