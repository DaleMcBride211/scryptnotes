import connectMongoDB from '@/libs/mongodb';
import Topic from '@/models/topic';
import { NextResponse } from 'next/server';


async function ensureDbConnection() {
    
    await connectMongoDB();
}

// export async function POST(request) {
//     try {
//         const { title, description } = await request.json();

//         if (!title || typeof title !== 'string' || title.trim() === "") {
//             return NextResponse.json({ message: "Title is required and cannot be empty." }, { status: 400 });
//         }
        

//         await ensureDbConnection();
//         const newTopic = await Topic.create({ title, description });
//         return NextResponse.json({ message: "Topic Created", topic: newTopic }, { status: 201 });
//     } catch (error) {
//         console.error("Error in POST /api/topics:", error);
//         return NextResponse.json({ message: "Failed to create topic", error: error.message }, { status: 500 });
//     }
// }

export async function GET() {
    try {
        await ensureDbConnection();
        const topics = await Topic.find().sort({ createdAt: -1 }); 
        return NextResponse.json({ topics });
    } catch (error) {
        console.error("Error in GET /api/topics:", error);
        return NextResponse.json({ message: "Failed to fetch topics", error: error.message }, { status: 500 });
    }
}

// export async function DELETE(request) {
//     try {
//         const id = request.nextUrl.searchParams.get('id');

//         if (!id) {
//             return NextResponse.json({ message: "Topic ID is required for deletion." }, { status: 400 });
//         }

//         await ensureDbConnection();
//         const deletedTopic = await Topic.findByIdAndDelete(id);

//         if (!deletedTopic) {
//             return NextResponse.json({ message: "Topic not found." }, { status: 404 });
//         }

//         return NextResponse.json({ message: "Topic Deleted", deletedTopicId: id }, { status: 200 });
//     } catch (error) {
//         console.error("Error in DELETE /api/topics:", error);
        
//         if (error.name === 'CastError') {
//             return NextResponse.json({ message: "Invalid Topic ID format." }, { status: 400 });
//         }
//         return NextResponse.json({ message: "Failed to delete topic", error: error.message }, { status: 500 });
//     }
// }

// New PUT function to update a topic
// export async function PUT(request) {
//     try {
//         const id = request.nextUrl.searchParams.get('id');
//         if (!id) {
//             return NextResponse.json({ message: "Topic ID is required for update." }, { status: 400 });
//         }

//         const { title, description } = await request.json();

//         // Prepare the update data object
//         const updateData = {};
//         if (title !== undefined) {
//             if (typeof title !== 'string' || title.trim() === "") {
//                 return NextResponse.json({ message: "Title, if provided, cannot be empty." }, { status: 400 });
//             }
//             updateData.title = title;
//         }
//         if (description !== undefined) {
//             // Add any validation for description if necessary, e.g., ensuring it's a string
//              if (typeof description !== 'string') {
//                  return NextResponse.json({ message: "Description, if provided, must be a string." }, { status: 400 });
//              }
//             updateData.description = description;
//         }
        
//         // If neither title nor description is provided for update (or only empty values)
//         if (Object.keys(updateData).length === 0) {
//             return NextResponse.json({ message: "No valid update data provided (title or description)." }, { status: 400 });
//         }

//         await ensureDbConnection();

        
//         const updatedTopic = await Topic.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

//         if (!updatedTopic) {
//             return NextResponse.json({ message: "Topic not found." }, { status: 404 });
//         }

//         return NextResponse.json({ message: "Topic Updated", topic: updatedTopic }, { status: 200 });
//     } catch (error) {
//         console.error("Error in PUT /api/topics:", error);
//         if (error.name === 'CastError') {
//             return NextResponse.json({ message: "Invalid Topic ID format." }, { status: 400 });
//         }
//         if (error.name === 'ValidationError') { 
//             return NextResponse.json({ message: "Validation failed", errors: error.errors }, { status: 400 });
//         }
//         return NextResponse.json({ message: "Failed to update topic", error: error.message }, { status: 500 });
//     }
// }