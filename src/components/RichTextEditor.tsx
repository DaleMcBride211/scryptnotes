"use client"
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
// Import necessary React hooks and types
import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import MenuBar from './MenuBar'; // Assuming MenuBar component exists
import TextAlign from '@tiptap/extension-text-align';
import Highlight from "@tiptap/extension-highlight";

// 1. Define props interface (optional but good practice)
interface RichTextEditorProps {
  initialContent?: string; // Allow parent to set initial content
}


export interface EditorHandle {
  getEditorContent: () => string | undefined; // Function to get HTML content
  // You could add more methods like getJSON, getText, clearContent etc.
  // getEditorJSON: () => any | undefined;
  // clearEditorContent: () => void;
}

const RichTextEditor = forwardRef<EditorHandle, RichTextEditorProps>(
  ({ initialContent = '' }, ref) => { // Destructure props, receive ref
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    HTMLAttributes: {
                        class: 'list-disc ml-3'
                    },
                },
                orderedList: {
                    HTMLAttributes: {
                        class: 'list-decimal ml-3'
                    },
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Highlight,
        ],
        // 4. Use the initialContent prop
        content: initialContent,
        // immediatelyRender: false, // Consider if needed. Often true is fine.
        editorProps: {
            attributes: {
                // Added outline-none and focus styles for better UX
                class: 'min-h-[200px] border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500',
            },
        }
        // No onUpdate needed for the imperative handle approach
    });

    // 5. Expose the getEditorContent function to the parent via the ref
    useImperativeHandle(ref, () => ({
      getEditorContent: () => {
        // Return HTML content from the editor instance
        return editor?.getHTML();
      },
      // Example: Expose function to get JSON
      // getEditorJSON: () => {
      //   return editor?.getJSON();
      // },
      // Example: Expose function to clear content
      // clearEditorContent: () => {
      //    editor?.commands.clearContent();
      // }
    }), [editor]); // Dependency array ensures the functions use the current editor instance

    // 6. Keep the cleanup logic
    useEffect(() => {
        // Cleanup function: destroy the editor instance when the component unmounts
        return () => {
            editor?.destroy();
        };
    }, [editor]); // Depend on editor instance

    // 7. Conditional rendering of MenuBar and EditorContent handles editor potentially being null initially
    return (
        <div>
            {editor && <MenuBar editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    );
  }
);

// 8. Set display name for React DevTools (good practice with forwardRef)
RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;