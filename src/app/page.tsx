'use client'; // <-- Add this directive to make it a Client Component

import React, { useState, useEffect } from 'react'; // <-- Import useState and useEffect
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';

// Define an interface for the structure of a single note
interface Note {
  _id: string;
  title: string;
  description: string;
}

// Define an interface for the expected API response structure
interface ApiResponse {
  topics: Note[];
}

// Keep the getNotes function separate for clarity, but adjust API URL logic
const getNotes = async (): Promise<ApiResponse> => {
  console.log("Attempting to fetch notes from client...");
  try {
    // On the client-side, use a relative path for API routes within the same app.
    // The browser automatically resolves this against the current origin.
    const apiUrl = '/api/topics'; // <-- Use relative path

    const res = await fetch(apiUrl, {
      cache: 'no-store', // Still useful to prevent caching if needed
    });
    console.log('Data fetch attempted from:', apiUrl);

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Failed to fetch Topics: ${res.status} ${res.statusText}. Body: ${errorBody}`);
    }

    const data = await res.json() as ApiResponse;

    if (!data || !Array.isArray(data.topics)) {
      console.warn('API response did not contain a topics array:', data);
      return { topics: [] };
    }

    return data;

  } catch (error) {
    console.error("Error loading Topics: ", error);
    // Re-throw the error so the calling useEffect can catch it
    throw error; // <-- Re-throw
  }
};

// No longer an async Server Component
function HomePage() {
  // State to hold the fetched notes
  const [notesData, setNotesData] = useState<ApiResponse>({ topics: [] });
  // State to track loading status
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State to hold potential errors
  const [error, setError] = useState<string | null>(null);

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Start loading
      setError(null); // Reset error state
      try {
        const data = await getNotes();
        setNotesData(data); // Update state with fetched data
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message); // Set error message
        } else {
          setError("An unknown error occurred.");
        }
        setNotesData({ topics: [] }); // Reset data on error
      } finally {
        setIsLoading(false); // Stop loading regardless of success or failure
      }
    };

    fetchData();
  }, []); // <-- Empty dependency array ensures this runs only once on mount

  // Conditional rendering based on loading and error states
  if (isLoading) {
    return <div className="p-4">Loading notes...</div>; // Or a spinner component
  }

  if (error) {
    return <div className="p-4 text-red-600">Error fetching notes: {error}</div>;
  }

  // Extract topics from state for rendering
  const { topics } = notesData;

  return (
    <div className="grid [grid-template-columns:200px_1fr] gap-2 h-screen">
      {/* Sidebar Column */}
      <div className="mt-25 p-4"> {/* Added padding for visual spacing */}
        Tags
        {/* You might fetch/display tags here similarly */}
      </div>

      {/* Main Content Column */}
      <div className="overflow-y-auto p-4 h-full no-scrollbar">
        {/* Container for the masonry-like columns */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 mt-25"> {/* Responsive columns */}
          {topics.length > 0 ? (
            topics.map((note: Note) => (
              <div key={note._id} className="break-inside-avoid mb-4">
                {/* Individual Card */}
                <Card className="flex flex-col max-h-[500px] w-full overflow-hidden"> {/* Adjusted width */}
                  <CardHeader>
                    <CardTitle>{note.title}</CardTitle>
                  </CardHeader>
                  {/* Card Content Area */}
                  <CardContent className="flex-grow overflow-hidden">
                    {/* Inner div for prose styling and scrolling */}
                    {/* Consider limiting height here too if CardContent isn't enough */}
                    <div className="prose max-w-none overflow-y-auto h-full">
                       {/* Use whitespace-pre-wrap to respect newlines in description */}
                      <p style={{ whiteSpace: 'pre-wrap' }}>{note.description}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {/* Add functionality to the Delete button */}
                    <Button variant="destructive" size="sm">Delete</Button> {/* Adjusted styling */}
                  </CardFooter>
                </Card>
              </div>
            ))
          ) : (
             // Rendered only if not loading, no error, and topics array is empty
            <p className="text-gray-500 col-span-full">No notes found.</p> 
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;