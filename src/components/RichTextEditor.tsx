import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'
import MenuBar from './MenuBar'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from "@tiptap/extension-highlight";

export default function RichTextEditor() {
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
        content: '',
        editorProps: {
            attributes: {
                class: 'min-h-[200px] border rounded-md py-2 px-3',
            },
        },
        onUpdate: ({ editor }) => {
            console.log(editor.getHTML());
        }
      })
    
      return (
        <div>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
      )
}