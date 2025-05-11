// app/api/generate/route.js
import { GoogleGenAI } from "@google/genai"; 
import { NextResponse } from 'next/server';

/**
 * Handles POST requests to the /api/generate endpoint.
 * @param {Request} req 
 * @returns {Promise<NextResponse>} 
 */
export async function POST(req) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set");
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        // Get the data from the request body
        const data = await req.json();
        const promptFromClient = data.body; // Matches {body:prompt} from frontend

        // Check if the prompt is provided
        if (!promptFromClient) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // Construct a more specific prompt for rewording or answering questions
        const fullPrompt = `Please reword the following notes. Just provide a new way to structure and word them. Only give one option. Do not label it just give the new structuce. \n\n${promptFromClient}`;

        
        const generationResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash", 
            contents: fullPrompt 
                                 
        });

        // Extract the text from the response, matching the example's `response.text`
        const output = generationResponse.text;

        // Return the generated output
        return NextResponse.json({ output: output });

    } catch (error) {
        console.error("Error in /api/generate:", error);
        // Determine the error message
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        // Return an error response
        return NextResponse.json({ error: "Failed to generate response", details: errorMessage }, { status: 500 });
    }
}