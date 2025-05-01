import React from 'react';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    Italic,
    List,
    ListOrdered,
    Strikethrough,
  } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Editor } from "@tiptap/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"



function MenuBar({ editor }: {editor: Editor | null}) {
    if (!editor) {
        return null
      }

      const Options = [
        {
          label: "Heading 1",
          icon: <Heading1 className="size-4" />,
          onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          preesed: editor.isActive("heading", { level: 1 }),
        },
        {
          label: "Heading 2",
          icon: <Heading2 className="size-4" />,
          onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          preesed: editor.isActive("heading", { level: 2 }),
        },
        {
          label: "Heading 3",
          icon: <Heading3 className="size-4" />,
          onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          preesed: editor.isActive("heading", { level: 3 }),
        },
        {
          label: "Bold",
          icon: <Bold className="size-4" />,
          onClick: () => editor.chain().focus().toggleBold().run(),
          preesed: editor.isActive("bold"),
        },
        {
          label: "Italic",
          icon: <Italic className="size-4" />,
          onClick: () => editor.chain().focus().toggleItalic().run(),
          preesed: editor.isActive("italic"),
        },
        {
          label: "Strike",
          icon: <Strikethrough className="size-4" />,
          onClick: () => editor.chain().focus().toggleStrike().run(),
          preesed: editor.isActive("strike"),
        },
        {
          label: "Align Left",
          icon: <AlignLeft className="size-4" />,
          onClick: () => editor.chain().focus().setTextAlign("left").run(),
          preesed: editor.isActive({ textAlign: "left" }),
        },
        {
          label: "Align Center",
          icon: <AlignCenter className="size-4" />,
          onClick: () => editor.chain().focus().setTextAlign("center").run(),
          preesed: editor.isActive({ textAlign: "center" }),
        },
        {
          label: "Align Right",
          icon: <AlignRight className="size-4" />,
          onClick: () => editor.chain().focus().setTextAlign("right").run(),
          preesed: editor.isActive({ textAlign: "right" }),
        },
        {
          label: "Bullet List",
          icon: <List className="size-4" />,
          onClick: () => editor.chain().focus().toggleBulletList().run(),
          preesed: editor.isActive("bulletList"),
        },
        {
          label: "Numbered List",
          icon: <ListOrdered className="size-4" />,
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
          preesed: editor.isActive("orderedList"),
        },
        {
          label: "Highlight",
          icon: <Highlighter className="size-4" />,
          onClick: () => editor.chain().focus().toggleHighlight().run(),
          preesed: editor.isActive("highlight"),
        },
      ];
    
      return (
          <div className='border rounded-md p-1 mb-1 space-x-2 z-50'>
            {Options.map((option, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Toggle key={index} pressed={option.preesed} onClick={option.onClick}>
                      {option.icon}
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p className='text-sm'>{option.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
    )
        
      
  
}

export default MenuBar