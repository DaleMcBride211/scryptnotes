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
                    <SheetContent
                        side="bottom" // Suggestion: For mobile, a bottom sheet often feels more natural
                        className="w-full h-[90vh] sm:h-auto sm:max-w-lg flex flex-col p-0" // Full width on mobile, allow height to adjust or set max
                    >
                        <SheetHeader className="px-6 pt-6 pb-4 border-b"> {/* Added padding and border */}
                            <SheetTitle>Ask Gemini</SheetTitle>
                            <SheetDescription>
                                Enter your notes below to get them reworded or ask a question about them.
                                Just copy and paste from any Note!
                            </SheetDescription>
                        </SheetHeader>

                        <ScrollArea className="flex-grow overflow-y-auto"> {/* Make the content area scrollable */}
                            <div className="p-6 flex flex-col gap-4"> {/* Inner padding for content */}
                                <Textarea
                                    placeholder="Paste your notes here..."
                                    value={promptText}
                                    onChange={(e) => setPromptText(e.target.value)}
                                    // Consider reducing rows for smaller screens if needed, or let flex handle it
                                    // rows={6} // Slightly reduced for mobile, but dynamic height is better
                                    disabled={isLoading}
                                    className="resize-none min-h-[150px] sm:min-h-[200px] md:min-h-[250px] flex-1" // Responsive min-height & allow flex
                                />
                                {error && (
                                    <Alert variant="destructive">
                                        <Terminal className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                {aiResponse && !error && (
                                    <div className="p-3 border rounded-md bg-muted flex-grow min-h-[150px] sm:min-h-[200px] flex flex-col"> {/* Added flex & flex-col */}
                                        <h3 className="font-semibold mb-2 text-sm sm:text-base">Gemini's Response:</h3>
                                        <ScrollArea className="flex-grow h-[200px] sm:h-[250px] md:h-[300px] whitespace-pre-wrap rounded-md"> {/* Ensure this ScrollArea can grow */}
                                            {aiResponse}
                                        </ScrollArea>
                                    </div>
                                )}
                                {isLoading && <p className="text-center text-muted-foreground py-4">Generating response...</p>}
                            </div>
                        </ScrollArea>

                        <SheetFooter className="px-6 py-4 border-t mt-auto bg-background sm:bg-transparent"> {/* Added padding, border, and sticky feel */}
                            <Button
                                onClick={handleGenerateClick}
                                disabled={isLoading || !promptText.trim()}
                                className="w-full" // Full width on mobile for easier tapping
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