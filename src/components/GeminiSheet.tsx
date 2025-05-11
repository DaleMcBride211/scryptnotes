"use client"
import React, { useState, useRef, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Sparkles } from "lucide-react";
import RichTextEditor, { EditorHandle } from '@/components/RichTextEditor';
import { Editor } from '@tiptap/react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ApiResponse {
    output?: string;
    error?: string;
}

const generateResponseAPI = async (prompt: string): Promise<string | null> => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: prompt })
        });
        const data: ApiResponse = await response.json();
        if (response.ok && data.output) {
            return data.output;
        } else {
            const errorMessage = data.error || `API Error: ${response.status} ${response.statusText}`;
            console.error("API Error:", errorMessage);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error("Client-side generateResponse error:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unknown error occurred while generating response.");
    }
};

interface GeminiSheetProps {
    initialEditorContent?: string;
    getEditorContent?: () => string | undefined; // MODIFIED: Changed prop name here
}

function GeminiSheet({ initialEditorContent, getEditorContent }: GeminiSheetProps) { // MODIFIED: Changed prop name in destructuring
    const [aiMarkdownResponse, setAiMarkdownResponse] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
    const [editorHasContent, setEditorHasContent] = useState<boolean>(false);
    const editorRef = useRef<EditorHandle>(null);
    const [contentForEditor, setContentForEditor] = useState<string>('');

    useEffect(() => {
        if (editorRef.current?.setEditorEditable) {
            editorRef.current.setEditorEditable(!isLoading);
        }
    }, [isLoading]);

    useEffect(() => {
        if (isSheetOpen) {
            let newContent = '';
            // MODIFIED: Use the new prop name 'getEditorContent'
            if (getEditorContent) {
                const liveContent = getEditorContent();
                if (liveContent !== undefined && liveContent.trim() !== '<p></p>' && liveContent.trim() !== '') {
                    newContent = liveContent;
                }
            }

            if (!newContent && initialEditorContent) {
                newContent = initialEditorContent;
            }
            setContentForEditor(newContent);

            const tempElement = document.createElement('div');
            tempElement.innerHTML = newContent;
            const text = (tempElement.textContent || tempElement.innerText || "").trim();
            setEditorHasContent(text !== '');

        }
    }, [isSheetOpen, getEditorContent, initialEditorContent]); // MODIFIED: Dependency array updated

    const handleEditorUpdate = ({ editor }: { editor: Editor }) => {
        const currentContent = editor.getHTML();
        const isEmptyHtml = currentContent.trim() === '<p></p>' || currentContent.trim() === '';
        setEditorHasContent(!editor.isEmpty && !isEmptyHtml && editor.getText().trim() !== '');
    };

    const handleGenerateClick = async () => {
        const currentContentHtml = editorRef.current?.getEditorContent();
        if (!editorHasContent || !currentContentHtml || currentContentHtml.trim() === '<p></p>') {
            setError("Please enter some text in the editor to generate a response.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAiMarkdownResponse("");
        try {
            const output = await generateResponseAPI(currentContentHtml);
            if (output) {
                setAiMarkdownResponse(output);
            } else {
                setError("Received no output from AI, or an unexpected response format.");
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred during generation.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSheetOpenChange = (open: boolean) => {
        setIsSheetOpen(open);
        if (open) {
            setAiMarkdownResponse("");
            setError(null);
        }
    };

    return (
        <div>
            <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
                <SheetTrigger asChild>
                    <Button variant="outline" onClick={() => setIsSheetOpen(true)}>
                        <Sparkles className="mr-2 h-4 w-4" /> Ask Gemini
                    </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-lg w-full flex flex-col h-full">
                    <SheetHeader>
                        <SheetTitle>Ask Gemini</SheetTitle>
                        <SheetDescription>
                            Type or paste your notes below. Gemini can help reword, summarize, or answer questions.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-grow flex flex-col gap-4 py-3 min-h-0">
                        <div className="flex-shrink-0 h-48 flex flex-col">
                            <ScrollArea className="flex-grow min-h-50 border rounded-md">
                                <RichTextEditor
                                    ref={editorRef}
                                    key={`gemini-editor-${isSheetOpen}-${contentForEditor.substring(0, 20)}`}
                                    initialContent={contentForEditor}
                                    onUpdate={handleEditorUpdate}
                                    showMenuBar={false}
                                />
                            </ScrollArea>
                        </div>
                        {error && (
                            <Alert variant="destructive" className="flex-shrink-0">
                                <Terminal className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {aiMarkdownResponse && !error && (
                            <div className="flex-grow p-3 border rounded-md bg-muted min-h-0 flex flex-col">
                                <h3 className="font-semibold mb-2 text-sm">Gemini's Response:</h3>
                                <ScrollArea className="flex-grow min-h-0">
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {aiMarkdownResponse}
                                        </ReactMarkdown>
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                        {isLoading && (
                            <div className="flex-grow flex items-center justify-center text-muted-foreground">
                                <p>Generating response...</p>
                            </div>
                        )}
                        {!isLoading && !aiMarkdownResponse && !error && (
                            <div className="flex-grow flex items-center justify-center text-muted-foreground">
                                <p className="text-sm text-center">AI response will appear here.</p>
                            </div>
                        )}
                    </div>
                    <SheetFooter className="mt-auto pt-4 border-t">
                        <Button
                            onClick={handleGenerateClick}
                            disabled={isLoading || !editorHasContent}
                            className="w-full sm:w-auto"
                        >
                            {isLoading ? 'Generating...' : 'Generate with Gemini'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}

export default GeminiSheet;