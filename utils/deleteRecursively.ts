import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""
});

export default async function deleteRecursively(fileId: string, userId: string) {
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
                await imagekit.deleteFile(file.imagekitId);
            } catch(inner) {
                console.error(inner);
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
        console.error(error);
        return {error: "Failed to delete file", status: 500}
    }
}