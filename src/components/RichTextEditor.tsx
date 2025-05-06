"use client"
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import MenuBar from './MenuBar'; 
import TextAlign from '@tiptap/extension-text-align';
import Highlight from "@tiptap/extension-highlight";


interface RichTextEditorProps {
  initialContent?: string; 
}


export interface EditorHandle {
  getEditorContent: () => string | undefined; 
  
  clearEditorContent: () => void;
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
        
        content: initialContent,
        editorProps: {
            attributes: {
                
                class: 'min-h-[200px] border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500',
            },
        }
        
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
      }
    }), [editor]); 

    
    useEffect(() => {
        
        return () => {
            editor?.destroy();
        };
    }, [editor]);


    return (
        <div>
            {editor && <MenuBar editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    );
  }
);


RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;