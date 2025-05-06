'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import RichTextEditor, { EditorHandle } from '@/components/RichTextEditor'; 

interface Note {
  _id: string;
  title: string;
  description: string;
  createdAt?: string;
}

interface GetApiResponse {
  topics: Note[];
}

interface ApiMessageResponse {
  message: string;
  topic?: Note;
  deletedTopicId?: string;
  error?: string;
}

// --- API Call Functions ---

const createNoteAPI = async (title: string, description: string): Promise<ApiMessageResponse> => {
  const apiUrl = '/api/topics';
  if (!title.trim()) throw new Error("Title cannot be empty.");

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    const result: ApiMessageResponse = await res.json();
    if (!res.ok) {
      throw new Error(result.message || `Failed to create note: ${res.status} ${res.statusText}`);
    }
    return result;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

const getNotesAPI = async (): Promise<GetApiResponse> => {
  const apiUrl = '/api/topics';
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Failed to fetch Topics: ${res.status} ${res.statusText}. Body: ${errorBody}`);
    }
    const data: GetApiResponse = await res.json();
    if (!Array.isArray(data.topics)) {
      console.warn('API response.topics was not an array:', data);
      return { topics: [] };
    }
    return data;
  } catch (error) {
    console.error("Error loading Topics: ", error);
    throw error;
  }
};

const deleteNoteAPI = async (noteId: string): Promise<ApiMessageResponse> => {
  const apiUrl = `/api/topics?id=${encodeURIComponent(noteId)}`;
  try {
    const res = await fetch(apiUrl, { method: 'DELETE' });
    const result: ApiMessageResponse = await res.json();
    if (!res.ok) {
      throw new Error(result.message || `Failed to delete note. Server responded with ${res.status}`);
    }
    return result;
  } catch (error) {
    console.error(`An error occurred during the delete request for note ${noteId}:`, error);
    throw error;
  }
};

const updateNoteAPI = async (noteId: string, title: string, description: string): Promise<ApiMessageResponse> => {
  const apiUrl = `/api/topics?id=${encodeURIComponent(noteId)}`;
  if (!title.trim()) throw new Error("Title cannot be empty.");

  try {
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    const result: ApiMessageResponse = await res.json();
    if (!res.ok) {
      throw new Error(result.message || `Failed to update note: ${res.status} ${res.statusText}`);
    }
    // The backend now returns the updated topic in result.topic
    return result;
  } catch (error) {
    console.error(`Error updating note ${noteId}:`, error);
    throw error;
  }
};



// --- HomePage Component ---
function HomePage() {
  const [notesData, setNotesData] = useState<GetApiResponse>({ topics: [] });
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const createEditorRef = useRef<EditorHandle>(null); 

  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [deleteErrors, setDeleteErrors] = useState<{ [key: string]: string | null }>({});

  // States for Edit Dialog
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editNoteTitle, setEditNoteTitle] = useState('');
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const editEditorRef = useRef<EditorHandle>(null);

  const fetchAndSetNotes = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoadingInitial(true);
    else setIsRefreshing(true);
    setFetchError(null);
    try {
      const data = await getNotesAPI();
      setNotesData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setFetchError(errorMessage);
      setNotesData({ topics: [] });
    } finally {
      if (isInitialLoad) setIsLoadingInitial(false);
      else setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSetNotes(true);
  }, [fetchAndSetNotes]);

  // --- Create Note Logic ---
  const handleCreateDialogTitleInvalid = () => !newNoteTitle.trim();

  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (open) {
      setNewNoteTitle('');
      createEditorRef.current?.clearEditorContent();
      setCreateError(null);
    }
  };

  const handleCreateNote = async () => {
    if (handleCreateDialogTitleInvalid()) {
      setCreateError("Title cannot be empty.");
      return;
    }
    setIsCreatingNote(true);
    setCreateError(null);
    const description = createEditorRef.current?.getEditorContent() || '<p></p>';

    try {
      await createNoteAPI(newNoteTitle, description);
      setIsCreatingNote(false);
      setIsCreateDialogOpen(false);
      await fetchAndSetNotes();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "An unknown error occurred while saving.");
      setIsCreatingNote(false);
    }
  };

  // --- Edit Note Logic ---
  const handleEditDialogTitleInvalid = () => !editNoteTitle.trim();

  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingNote(null);
      setEditError(null); 
    }
  };

  const openEditDialog = (note: Note) => {
    setEditingNote(note);
    setEditNoteTitle(note.title);
    setEditError(null); 
    
    setIsEditDialogOpen(true);
  };

  const handleUpdateNote = async () => {
    if (!editingNote) {
      setEditError("No note selected for editing.");
      return;
    }
    if (handleEditDialogTitleInvalid()) {
      setEditError("Title cannot be empty.");
      return;
    }

    setIsUpdatingNote(true);
    setEditError(null);
    const description = editEditorRef.current?.getEditorContent() || '<p></p>';

    try {
      await updateNoteAPI(editingNote._id, editNoteTitle, description);
      setIsUpdatingNote(false);
      setIsEditDialogOpen(false);
      setEditingNote(null);
      await fetchAndSetNotes();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "An unknown error occurred while updating.");
      setIsUpdatingNote(false);
    }
  };

  // --- Delete Note Logic ---
  const handleDeleteNote = async (noteId: string) => {
    setDeletingNoteId(noteId);
    setDeleteErrors(prev => ({ ...prev, [noteId]: null }));

    try {
      await deleteNoteAPI(noteId);
      await fetchAndSetNotes();
    } catch (err) {
      setDeleteErrors(prev => ({
        ...prev,
        [noteId]: err instanceof Error ? err.message : "An unknown error occurred while deleting."
      }));
    } finally {
      setDeletingNoteId(null);
    }
  };

  if (isLoadingInitial) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center text-2xl font-medium">
          Loading notes <Loader2 className="ml-3 h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (fetchError && notesData.topics.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-red-600 text-xl">
        Error fetching notes: {fetchError}
      </div>
    );
  }

  const { topics } = notesData;

  return (
    <div className="grid [grid-template-columns:200px_1fr] gap-2 h-screen">
      {/* Sidebar Column */}
      <div className="mt-25 p-4 border-r">
        <div className="mb-5">
          <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="text-xl w-full">New Note</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] md:max-w-[750px] [&>button]:hidden">
              <DialogHeader>
                <DialogTitle>Create a New Note</DialogTitle>
                {createError && (
                  <p className="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded">{createError}</p>
                )}
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  id="newNoteTitle"
                  type='text'
                  placeholder='Note Title'
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="text-lg"
                  disabled={isCreatingNote}
                />
                <div className='max-w-3xl min-h-[200px] border rounded-md overflow-hidden'>
                  <RichTextEditor
                    key={`create-editor-${isCreateDialogOpen}`}
                    ref={createEditorRef}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <DialogClose asChild>
                  <Button variant="outline" disabled={isCreatingNote}>Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleCreateNote}
                  disabled={isCreatingNote || handleCreateDialogTitleInvalid()}
                >
                  {isCreatingNote ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : ('Save Note')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="text-sm text-gray-500">Tags (Placeholder)</div>
      </div>

      {/* Main Content Column */}
      <div className="overflow-y-auto p-4 h-full no-scrollbar">
        {isRefreshing && (
          <div className="text-center p-4 text-gray-600">
            Refreshing notes... <Loader2 className="inline-block ml-2 h-5 w-5 animate-spin" />
          </div>
        )}
        {fetchError && topics.length > 0 && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            <span className="font-medium">Update Error:</span> {fetchError}
          </div>
        )}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-[15rem] gap-4 mt-25">
          {topics.length > 0 ? (
            topics.map((note: Note) => (
              <div key={note._id} className="break-inside-avoid mb-4">
                <Card className="flex flex-col w-full overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="truncate text-lg">{note.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow"> 
                    <div
                      className="prose max-w-none text-sm" 
                      dangerouslySetInnerHTML={{ __html: note.description || '<p><em>No content.</em></p>' }}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between items-center pt-3 border-t">
                    <div className="text-xs text-gray-400">Tag Placeholder</div>
                    <div className="flex gap-2">
                      
                      <Dialog
                          open={isEditDialogOpen && editingNote?._id === note._id}
                          onOpenChange={(open) => {
                              if (editingNote?._id === note._id) {
                                  handleEditDialogOpenChange(open);
                              }
                          }}
                      >
                          <DialogTrigger asChild>
                              <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 border-blue-500 cursor-pointer hover:bg-blue-50"
                                  onClick={() => openEditDialog(note)}
                                  disabled={isUpdatingNote && editingNote?._id === note._id}
                              >
                                  Edit
                              </Button>
                          </DialogTrigger>
                          {/* Conditionally render DialogContent to ensure correct ref and initialContent application */}
                          {editingNote && editingNote._id === note._id && (
                              <DialogContent className="sm:max-w-[600px] md:max-w-[750px] [&>button]:hidden">
                                  <DialogHeader>
                                      <DialogTitle>Edit Note</DialogTitle>
                                      <DialogDescription>
                                          Make changes to your note titled "{editingNote.title}".
                                      </DialogDescription>
                                      {editError && (
                                          <p className="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded">{editError}</p>
                                      )}
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                      <Input
                                          id={`editNoteTitle-${editingNote._id}`}
                                          type='text'
                                          placeholder='Note Title'
                                          value={editNoteTitle}
                                          onChange={(e) => setEditNoteTitle(e.target.value)}
                                          className="text-lg"
                                          disabled={isUpdatingNote}
                                      />
                                      {/* MODIFIED DIV WRAPPER FOR RichTextEditor */}
                                      <div className='max-w-3xl min-h-[200px] max-h-[450px] border rounded-md overflow-y-auto'> {/* Example: max-h-[450px] */}
                                          <RichTextEditor
                                              key={`edit-editor-${editingNote._id}`}
                                              ref={editEditorRef}
                                              initialContent={editingNote.description}
                                          />
                                      </div>
                                  </div>
                                  <div className="flex justify-end gap-2 mt-4">
                                      <DialogClose asChild>
                                          <Button variant="outline" disabled={isUpdatingNote} className="cursor-pointer">Cancel</Button>
                                      </DialogClose>
                                      <Button
                                          onClick={handleUpdateNote}
                                          disabled={isUpdatingNote || handleEditDialogTitleInvalid()}
                                          className="cursor-pointer"
                                      >
                                          {isUpdatingNote ? (
                                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...</>
                                          ) : ('Save Changes')}
                                      </Button>
                                  </div>
                              </DialogContent>
                          )}
                      </Dialog>
                      <Dialog> 
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingNoteId === note._id}
                            className="cursor-pointer">
                            {deletingNoteId === note._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : ('Delete')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="[&>button]:hidden">
                          <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will permanently delete the note titled "{note.title}".
                            </DialogDescription>
                          </DialogHeader>
                          {deleteErrors[note._id] && (
                            <p className="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded">{deleteErrors[note._id]}</p>
                          )}
                          <div className="flex justify-end gap-2 mt-4">
                            <DialogClose asChild>
                              <Button variant="outline" disabled={deletingNoteId === note._id} className="cursor-pointer">Cancel</Button>
                            </DialogClose>
                            <Button
                              variant='destructive'
                              onClick={() => handleDeleteNote(note._id)}
                              disabled={deletingNoteId === note._id}
                              className="cursor-pointer">
                              {deletingNoteId === note._id ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                              ) : ('Confirm Delete')}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ))
          ) : (
            !isLoadingInitial && !isRefreshing && (
              <div className="text-center text-gray-500 col-span-full py-10">
                <p className="text-xl">No notes found.</p>
                
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;