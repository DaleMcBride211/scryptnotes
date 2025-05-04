import React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from '@/components/ui/button'
// Define an interface for the structure of a single note
interface Note {
  _id: string;       // Assuming _id is a string from MongoDB or similar
  title: string;
  description: string;
}

// Define an interface for the expected API response structure
interface ApiResponse {
    topics: Note[];
}


const getNotes = async (): Promise<ApiResponse> => { // <-- Specify return type
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}` // Prepend https for Vercel deployments
      : 'http://localhost:3000'; // CHANGE PORT if your local dev uses a different one

    // Construct the absolute URL
    const apiUrl = `${baseUrl}/api/topics`;
    
    const res = await fetch(apiUrl, {
      cache: 'no-store',
    });
    console.log('Data fetch attempted from:', apiUrl);

    if (!res.ok) {
      // Provide more context in the error message
      const errorBody = await res.text(); // Attempt to read error body
      throw new Error(`Failed to fetch Topics: ${res.status} ${res.statusText}. Body: ${errorBody}`);
    }

    // Explicitly cast the parsed JSON to your expected API response type
    const data = await res.json() as ApiResponse;

    // Validate the structure slightly more robustly
    if (!data || !Array.isArray(data.topics)) {
        console.warn('API response did not contain a topics array:', data);
        return { topics: [] }; // Return the default structure
    }

    return data; // Return the validated data

  } catch (error) {
    console.error("Error loading Topics: ", error);
    // Ensure the returned object matches the ApiResponse structure, even on error
    return { topics: [] };
  }
};


async function HomePage() {
  const { topics = [] } = await getNotes() || { topics: [] };

  return (
    
      <div className="grid [grid-template-columns:200px_1fr] gap-2 h-screen">
        {/* Sidebar Column */}
        <div className="mt-25">
          Tags
        </div>

        {/* Main Content Column: Make this fill the grid cell's height and handle its own scrolling */}
        <div className="overflow-y-auto p-4 h-full no-scrollbar"> {/* <-- ADD h-full HERE */}

          {/* Container for the masonry-like columns */}
          <div className="columns-5 gap-4 mt-25">

            {topics.length > 0 ? (
              topics.map((note: Note) => (
                // Prevent items from breaking across columns
                <div key={note._id} className="break-inside-avoid mb-4">
                  {/* Individual Card: Limited height, internal content might scroll */}
                  <Card className="flex flex-col max-h-[500px] w-[250px] overflow-hidden">
                    <CardHeader>
                      <CardTitle>{note.title}</CardTitle>
                    </CardHeader>
                    {/* Card Content Area: Grows to fill space, handles its own overflow */}
                    <CardContent className="flex-grow overflow-hidden">
                      {/* Inner div for prose styling and scrolling if description is too long for CardContent */}
                      <div className="prose max-w-none overflow-y-auto h-full">
                        <p>{note.description}</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Delete</Button>
                    </CardFooter>
                  </Card>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No notes found. Test Deployment</p>
            )}

          </div>
        </div>

      </div>

  );
}

export default HomePage;