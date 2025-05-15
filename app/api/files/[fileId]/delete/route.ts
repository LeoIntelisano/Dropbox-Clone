import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import deleteRecursively from "@/utils/deleteRecursively";

export async function DELETE(
    request: NextRequest,
    props: {params: Promise<{fileId: string}>} 
) {
    try {
        const {userId} = await auth();

        if (!userId) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const {fileId} = await props.params;

        if (!fileId) {
            return NextResponse.json({error: "File id is required"}, {status: 401});
        }

        const result = await deleteRecursively(fileId, userId);

        if (!result) {
            return NextResponse.json({error: "Something went horribly wrong with deletion"}, {status: 500});
        }

        if (result.status !== 200) {
            return NextResponse.json({error: result.error}, {status: result.status});
        }

        if (!result.deletedFile) {
            return NextResponse.json({error: "Cannot return deleted file. But file(s) were deleted"}, {status: 500});
        }
        return NextResponse.json(result.deletedFile);

    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
