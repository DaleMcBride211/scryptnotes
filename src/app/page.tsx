'use client'; // <-- Add this directive to make it a Client Component

// Import necessary React hooks and components
import React, { useState, useEffect, useRef } from 'react'; // <-- Added useRef
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import RichTextEditor, { EditorHandle } from '@/components/RichTextEditor'; // Adjust path if needed



interface Note {
  _id: string;
  title: string;
  description: string; 
}


interface GetApiResponse {
  topics: Note[];
}


interface CreateApiResponse {
    message: string;
   
}





const createNote = async (title: string, description: string): Promise<CreateApiResponse> => { 
  const apiUrl = '/api/topics';

  
  if (!title.trim()) {
    throw new Error("Title cannot be empty.");
  }
   if (!description || description === '<p></p>') { 
     console.warn("Description is empty, submitting anyway.");
    
   }


  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
     
      body: JSON.stringify({ title, description }),
    });

    const result = await res.json();

    if (!res.ok) {
        
        const errorMsg = result?.message || res.statusText;
        throw new Error(`Failed to create note: ${res.status} ${errorMsg}`);
    }

    console.log('Create API Response:', result); 
    return result as CreateApiResponse;

  } catch (error) {
    console.error("Error creating note:", error);
    
    throw error;
  }
};


const getNotes = async (): Promise<GetApiResponse> => {
  console.log("Attempting to fetch notes from client...");
  try {
    const apiUrl = '/api/topics';

    const res = await fetch(apiUrl, {
      cache: 'no-store',
    });
    console.log('Data fetch attempted from:', apiUrl);

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Failed to fetch Topics: ${res.status} ${res.statusText}. Body: ${errorBody}`);
    }

    const data = await res.json(); 

    
     if (typeof data !== 'object' || data === null || !Array.isArray(data.topics)) {
        console.warn('API response did not contain a topics array:', data);
        return { topics: [] }; 
     }

   
    return data as GetApiResponse;

  } catch (error) {
    console.error("Error loading Topics: ", error);
    throw error; 
  }
};

// --- HomePage Component ---

function HomePage() {
  // State for notes data, loading, and errors
  const [notesData, setNotesData] = useState<GetApiResponse>({ topics: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for the New Note Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false); // Loading state for creation
  const [createError, setCreateError] = useState<string | null>(null); // Error state for creation

  // Ref for the RichTextEditor
  const editorRef = useRef<EditorHandle>(null);

  // Function to fetch notes and update state
  const fetchAndSetNotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNotes();
      setNotesData(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching notes.");
      }
      setNotesData({ topics: [] });
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect hook to fetch data initially when the component mounts
  useEffect(() => {
    fetchAndSetNotes();
  }, []); // Runs once on mount

  // Handler for Dialog's open state changes
  const handleDialogOpenChange = async (open: boolean) => {
    setIsDialogOpen(open);
    setCreateError(null); // Clear previous creation errors when opening/closing

    if (!open && !isCreatingNote) {
        // DIALOG IS CLOSING (and not already in the process of creating)
        // If we wanted to save on *any* close (even clicking outside), we'd do it here.
        // However, it's often better UX to have an explicit "Save" button.
        // For now, we'll trigger save from a button, or automatically if needed.
        console.log("Dialog closed without explicit save action.");
        // Reset fields only if needed when closing without saving
        // setNoteTitle(''); // Reset title if desired

    } else if (open) {
        // DIALOG IS OPENING
        // Reset fields for a new note entry
        setNoteTitle('');
        // Optionally reset editor content if needed (might require an imperative handle method)
        // editorRef.current?.clearEditorContent?.(); // Example if you added clearEditorContent
        setCreateError(null); // Clear creation error messages
    }
  };

  // Handler for submitting the new note
  const handleCreateNote = async () => {
    setIsCreatingNote(true);
    setCreateError(null); // Clear previous errors

    const title = noteTitle;
    const description = editorRef.current?.getEditorContent() || ''; // Get content from editor ref

    try {
        // Call the modified createNote API function
        await createNote(title, description);

        // Success!
        setIsCreatingNote(false);
        setIsDialogOpen(false); // Close the dialog
        await fetchAndSetNotes(); // Refresh the notes list

    } catch (err) {
        console.error("Failed to create note:", err);
        if (err instanceof Error) {
            setCreateError(err.message); // Display creation error in the dialog
        } else {
            setCreateError("An unknown error occurred while saving.");
        }
        setIsCreatingNote(false); // Stop loading indicator
    }
  };


  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center text-2xl font-medium">
          Loading notes
          <Loader2 className="ml-3 h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="mt-25 p-4 text-red-600">Error fetching notes: {error}</div>;
  }

  const { topics } = notesData;

  return (
    <div className="grid [grid-template-columns:200px_1fr] gap-2 h-screen">
      {/* Sidebar Column */}
      <div className="mt-25 p-4 justify-items-center">
        <div className="mb-5">
            {/* --- New Note Dialog --- */}
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button className="text-xl w-full" onClick={() => setIsDialogOpen(true)}>New Note</Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] md:max-w-[750px]"> {/* Removed [&>button]:hidden to allow close button */}
              <DialogHeader>
                <DialogTitle>Create a New Note</DialogTitle>
                 {/* Display creation errors */}
                 {createError && (
                    <p className="text-sm text-red-600 mt-2">{createError}</p>
                 )}
              </DialogHeader>
              <div className="grid gap-4 py-4">
                 <Input
                    id="noteTitle"
                    type='text' // Corrected type
                    placeholder='Note Title'
                    value={noteTitle ? noteTitle : 'Untitled'}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="text-lg"
                    disabled={isCreatingNote} // Disable input while saving
                 />
                 <div className='max-w-3xl'> 
                    
                    <RichTextEditor
                        key={String(isDialogOpen)} // Force re-render/reset based on open state (optional)
                        ref={editorRef}
                    />
                 </div>
              </div>
              {/* --- Dialog Footer with Save/Cancel --- */}
              <div className="flex justify-end gap-2 mt-4">
                 <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)} // Simple close action
                    disabled={isCreatingNote}
                 >
                    Cancel
                 </Button>
                 <Button
                    onClick={handleCreateNote}
                    disabled={isCreatingNote || !noteTitle.trim()} // Disable if saving or title is empty
                 >
                    {isCreatingNote ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                    ) : (
                        'Save Note'
                    )}
                 </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        Tags (Placeholder)
      </div>

      {/* Main Content Column */}
      <div className="overflow-y-auto p-4 h-full no-scrollbar">
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-[15rem] gap-4 mt-25">
          {topics.length > 0 ? (
            topics.map((note: Note) => (
              <div key={note._id} className="break-inside-avoid mb-4">
                <Card className="flex flex-col max-h-[500px] w-full overflow-hidden">
                  <CardHeader>
                    <CardTitle>{note.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-hidden">
                    <div
                        className="prose max-w-none overflow-y-auto h-full"
                        dangerouslySetInnerHTML={{ __html: note.description || '<p></p>' }} // Handle potentially null/empty description
                    />
                  </CardContent>
                  <CardFooter>
                    <Button variant="destructive" size="sm">Delete</Button> {/* Add delete functionality later */}
                    
                  </CardFooter>
                </Card>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full">No notes found. Create one!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;