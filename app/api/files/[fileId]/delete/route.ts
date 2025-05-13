import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import ImageKit from "imagekit";
import { NextRequest, NextResponse } from "next/server";

//imagekit credentials
const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""
});


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

export async function deleteRecursively(fileId: string, userId: string) {
    try{
        // find file we are trying to delete in db
        const [file] = await db
        .select()
        .from(files)
        .where(
            and(
                eq(files.userId, userId),
                eq(files.id, fileId)
            )
        );
        if (!file) {
            return {error: "File not found", status: 404}
        }

        // if it's a folder, find it's children and recursively delete those
        if (file.isFolder) {
            const folderChildren = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.userId, userId),
                        eq(files.parentId, fileId)
                    )
                );
            for (const child of folderChildren) {
                await deleteRecursively(child.id, userId);
            }
        }
        // let's first delete from imagekit, then from DB
        
        if (!file.isFolder && file.imagekitId) { 
            try {
                const imagekitResponse = await imagekit.deleteFile(file.imagekitId);
            } catch(inner) {
                return {error: "Failed to delete file from imagekit", status: 500};
            }
            console.log(`Deleted ${file.name} with imagekit id ${file.imagekitId} from imagekit`);
        }

        const [deletedFile] = await db
                .delete(files)
                .where(
                    and(
                        eq(files.userId, userId),
                        eq(files.id, fileId)
                    )
                ).returning();
        if (!deletedFile) {
            return {error: "Failed to delete file", status: 500}
        }
        console.log(`Deleted ${file.name} with database id ${file.id} from database`);
        return {error: "", status: 200, deletedFile: deletedFile}
    }
    catch (error){
        return {error: "Failed to delete file", status: 500}
    }
}