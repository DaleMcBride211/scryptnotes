"use client"
import { useEditor, EditorContent, Editor } from '@tiptap/react'; // Added Editor type
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import MenuBar from './MenuBar'; // Ensure MenuBar.tsx exists and is correctly imported
import TextAlign from '@tiptap/extension-text-align';
import Highlight from "@tiptap/extension-highlight";

interface RichTextEditorProps {
  initialContent?: string;
  onUpdate?: ({ editor }: { editor: Editor }) => void; // Changed 'any' to 'Editor' for better type safety
  showMenuBar?: boolean; // <-- New prop added here
}

export interface EditorHandle {
  getEditorContent: () => string | undefined;
  getEditorJSON: () => Record<string, any> | undefined;
  clearEditorContent: () => void;
  isEditorEmpty: () => boolean;
  setEditorEditable: (editable: boolean) => void;
}

const RichTextEditor = forwardRef<EditorHandle, RichTextEditorProps>(
  ({ initialContent = '', onUpdate, showMenuBar = true }, ref) => { // <-- Destructure showMenuBar, default to true
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          bulletList: {
            HTMLAttributes: {
              class: 'list-disc ml-3' // Consider Tailwind's prose classes for lists if not using custom CSS
            },
          },
          orderedList: {
            HTMLAttributes: {
              class: 'list-decimal ml-3' // Same as above
            },
          },
          // Consider other StarterKit options you might need or want to disable
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Highlight,
      ],
      content: initialContent,
      editorProps: {
        attributes: {
          // Using Tailwind prose for better default content styling
          class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none min-h-[150px] md:min-h-[200px] border rounded-md py-2 px-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
        },
      },
      editable: true,
      onUpdate: ({ editor }) => {
        if (onUpdate) {
          onUpdate({ editor });
        }
      },
    });

    useImperativeHandle(ref, () => ({
      getEditorContent: () => {
        return editor?.getHTML();
      },
      getEditorJSON: () => {
        return editor?.getJSON();
      },
      clearEditorContent: () => {
        editor?.commands.clearContent();
        // Optionally focus after clearing
        // editor?.commands.focus();
      },
      isEditorEmpty: () => {
        // Check if editor is null/undefined or if its text content is empty
        return !editor || editor.isEmpty || editor.getText().trim() === '';
      },
      setEditorEditable: (editable: boolean) => {
        editor?.setEditable(editable);
      }
    }), [editor]);

    useEffect(() => {
      // Cleanup: Destroy the editor instance when the component unmounts
      return () => {
        editor?.destroy();
      };
    }, [editor]);

    // It's good practice to handle the case where the editor might not be initialized yet
    if (!editor) {
      return <div className="min-h-[150px] md:min-h-[200px] border rounded-md py-2 px-3 flex items-center justify-center text-muted-foreground">Loading Editor...</div>;
    }

    return (
      <div className="flex flex-col w-full"> {/* Ensure this div allows editor to take width */}
        {showMenuBar && <MenuBar editor={editor} />} {/* <-- Conditionally render MenuBar */}
        <EditorContent editor={editor} className={`mt-1 flex-grow ${!showMenuBar ? 'rounded-md' : ''}`} /> {/* Adjusted class for when MenuBar is hidden */}
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
export default RichTextEditor;