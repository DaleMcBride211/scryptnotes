"use client"
import React, { useState, useRef, useEffect, useMemo } from 'react'; // Added useMemo if you were to use marked, but not strictly needed for react-markdown directly here
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

// Import ReactMarkdown and remarkGfm
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ApiResponse {
    output?: string;
    error?: string;
}

const generateResponse = async (prompt: string): Promise<string | null> => {
    // ... (your existing generateResponse function)
    // Ensure it returns the raw Markdown string from the API
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: prompt })
        });
        const data: ApiResponse = await response.json();
        if (response.ok && data.output) {
            return data.output; // This is expected to be Markdown
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
    getCurrentEditorContent?: () => string | undefined;
}

function GeminiSheet({ initialEditorContent }: GeminiSheetProps) {
    const [aiMarkdownResponse, setAiMarkdownResponse] = useState<string>(""); // Changed state variable name
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
    const [editorHasContent, setEditorHasContent] = useState<boolean>(false);
    const editorRef = useRef<EditorHandle>(null);

    useEffect(() => {
        if (editorRef.current?.setEditorEditable) {
            editorRef.current.setEditorEditable(!isLoading);
        }
    }, [isLoading]);

    useEffect(() => {
        if (isSheetOpen) {
            if (initialEditorContent) {
                const tempElement = document.createElement('div');
                tempElement.innerHTML = initialEditorContent;
                const text = (tempElement.textContent || tempElement.innerText || "").trim();
                setEditorHasContent(text !== '');
            } else {
                setEditorHasContent(false);
            }
        }
    }, [isSheetOpen, initialEditorContent]);


    const handleEditorUpdate = ({ editor }: { editor: Editor }) => {
        setEditorHasContent(!editor.isEmpty && editor.getText().trim() !== '');
    };

    const handleGenerateClick = async () => {
        const currentContentHtml = editorRef.current?.getEditorContent();
        if (!editorHasContent || !currentContentHtml || currentContentHtml.trim() === '<p></p>') {
            setError("Please enter some text in the editor to generate a response.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAiMarkdownResponse(""); // Clear previous Markdown response

        try {
            const output = await generateResponse(currentContentHtml); // output is Markdown
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
            setAiMarkdownResponse(""); // Clear Markdown response when opening
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
                        <div className="flex-shrink-0 h-48 flex flex-col"> {/* Define a height and make it a flex column */}
                            <ScrollArea className="flex-grow min-h-50 border rounded-md"> {/* ScrollArea fills this fixed height */}
                                <RichTextEditor
                                    ref={editorRef}
                                    key={`${isSheetOpen}-${initialEditorContent || 'empty'}`}
                                    initialContent={initialEditorContent || ''}
                                    onUpdate={handleEditorUpdate}
                                    showMenuBar={false}
                                    // Ensure RichTextEditor itself doesn't have conflicting height styles
                                    // that would prevent ScrollArea from working. It should be allowed
                                    // to naturally expand its content.
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

                        {/* Updated AI Response display area */}
                        {aiMarkdownResponse && !error && (
                                // This container already has flex-grow. Make it a flex column.
                                <div className="flex-grow p-3 border rounded-md bg-muted min-h-0 flex flex-col">
                                    <h3 className="font-semibold mb-2 text-sm">Gemini's Response:</h3>
                                    {/* Let ScrollArea grow to fill the remaining space in this flex column */}
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