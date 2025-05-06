'use client'
import React, { useState } from 'react' // Added useState
import Link from 'next/link';
import Image from 'next/image';
import { shadow } from '@/styles/utils'; // Assuming this is correctly defined
import DarkModeToggle from './DarkModeToggle'; // Assuming this component exists
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter, // Added for better button placement
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"; // Good for long responses
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For errors
import { Terminal } from "lucide-react"; // Icon for alert

// This function can stay outside the component or be memoized with useCallback if needed
const generateResponse = async (prompt: string): Promise<string | null> => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ body: prompt }) // Ensure this matches API: { body: promptFromClient }
        })
        const data = await response.json()

        if (response.ok) {
            return data.output
        } else {
            console.error("API Error:", data.error || "No data output");
            throw new Error(data.error || "Failed to fetch response from API.");
        }
    } catch (error) {
        console.error("Client-side generateResponse error:", error);
        // Re-throw or return null/error object to be handled by the caller
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unknown error occurred while generating response.");
    }
}


function Header() {
    const [promptText, setPromptText] = useState<string>("");
    const [aiResponse, setAiResponse] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);


    const handleGenerateClick = async () => {
        if (!promptText.trim()) {
            setError("Please enter some text to reword or ask a question.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAiResponse("");
        try {
            const output = await generateResponse(promptText);
            if (output) {
                setAiResponse(output);
            } else {
                setError("Received no output from AI.");
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <header
            className='absolute flex h-24 w-full items-center justify-between bg-popover px-2 z-10 sm:min-w-[400px]' // z-10 to be above other content
            style={{
                boxShadow: shadow, // Make sure 'shadow' is a valid CSS box-shadow string
            }}>
            <Link href="/" className="flex items-end gap-2">
                <Image src="/Slogo.jpg" alt='Scrypt Notes Logo' height={60} width={60} className="rounded-full" priority />
                <h1 className='flex flex-col pb-1 text-2xl font-semibold leading-6'> {/* Corrected font-semibold */}
                    Scrypt <span>Notes</span>
                </h1>
            </Link>

            <div className="flex items-center gap-4"> {/* Grouped Sheet trigger and DarkModeToggle */}
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button onClick={() => setIsSheetOpen(true)}>Ask Gemini</Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-lg w-full flex flex-col"> {/* Added flex flex-col for layout */}
                        <SheetHeader>
                            <SheetTitle>Ask Gemini</SheetTitle>
                            <SheetDescription>
                                Enter your notes below to get them reworded or ask a question about them.
                                Just copy and paste from any Note!
                            </SheetDescription>
                        </SheetHeader>

                        <div className="py-4 flex-grow flex flex-col gap-4 sm: overflow-y-auto"> {/* Added overflow-y-auto HERE */}
                            <Textarea
                                placeholder="Paste your notes here..."
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                                rows={8} // Provides an initial height hint
                                disabled={isLoading}
                                className="resize-none h-[300px]" // Textarea will scroll internally if content > 300px
                                                                // Or, you could remove h-[300px] to let it grow
                                                                // and contribute to overall page scroll.
                            />
                            {error && (
                                <Alert variant="destructive">
                                    <Terminal className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            {aiResponse && !error && (
                                <div className="mt-4 p-3 border rounded-md bg-muted flex-grow">
                                    <h3 className="font-semibold mb-2">Gemini's Response:</h3>
                                    {/* This is the key part for scrolling the AI response: */}
                                    <ScrollArea className="h-[300px]"> {/* Adjust height as needed */}
                                        {aiResponse}
                                    </ScrollArea>
                                </div>
                            )}
                            {isLoading && <p className="text-center text-muted-foreground">Generating response...</p>}
                        </div>

                        <SheetFooter className="mt-auto"> {/* Ensures button is at the bottom */}
                            <Button
                                onClick={handleGenerateClick}
                                disabled={isLoading || !promptText.trim()}
                                className="w-full sm:w-auto" // Responsive width
                            >
                                {isLoading ? 'Generating...' : 'Generate'}
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
                <DarkModeToggle />
            </div>
        </header>
    )
}

export default Header;