"use client"
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import MenuBar from './MenuBar'; 
import TextAlign from '@tiptap/extension-text-align';
import Highlight from "@tiptap/extension-highlight";

interface RichTextEditorProps {
  initialContent?: string;
  onUpdate?: ({ editor }: { editor: Editor }) => void; 
  showMenuBar?: boolean; 
}

export interface EditorHandle {
  getEditorContent: () => string | undefined;
  getEditorJSON: () => Record<string, unknown> | undefined;
  clearEditorContent: () => void;
  isEditorEmpty: () => boolean;
  setEditorEditable: (editable: boolean) => void;
}

const RichTextEditor = forwardRef<EditorHandle, RichTextEditorProps>(
  ({ initialContent = '', onUpdate, showMenuBar = true }, ref) => {
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
      content: initialContent,
      editorProps: {
        attributes: {
          
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
       
      },
      isEditorEmpty: () => {
       
        return !editor || editor.isEmpty || editor.getText().trim() === '';
      },
      setEditorEditable: (editable: boolean) => {
        editor?.setEditable(editable);
      }
    }), [editor]);

    useEffect(() => {
      
      return () => {
        editor?.destroy();
      };
    }, [editor]);

    
    if (!editor) {
      return <div className="min-h-[150px] md:min-h-[200px] border rounded-md py-2 px-3 flex items-center justify-center text-muted-foreground">Loading Editor...</div>;
    }

    return (
      <div className="flex flex-col w-full">
        {showMenuBar && <MenuBar editor={editor} />} 
        <EditorContent editor={editor} className={`mt-1 flex-grow ${!showMenuBar ? 'rounded-md' : ''}`} /> {/* Adjusted class for when MenuBar is hidden */}
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
export default RichTextEditor;