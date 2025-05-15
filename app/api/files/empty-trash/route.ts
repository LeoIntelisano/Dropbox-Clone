import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import deleteRecursively from "@/utils/deleteRecursively";

export async function DELETE() {
    try {const {userId} = await auth();
        if (!userId) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const trashedFiles = await db
            .select()
            .from(files)
            .where(
                and(
                    eq(files.isTrash, true),
                    eq(files.userId, userId)
                )
            );
        if (trashedFiles.length === 0) {
            return NextResponse.json({message: "No files in trash"}, {status: 200});
        }
        let deleteCount = 0;
        const deleteName: string[] = [];
        for (const file of trashedFiles) {
            const response = await deleteRecursively(file.id, userId);
            if (response.status !== 200) {
                deleteName.push(file.name);
                continue;
            }
            deleteCount++;
        }
        if (deleteName.length) {
            return NextResponse.json({ error: `Removed ${deleteCount} file(s), but failed to delete the follow: ${deleteName.join(", ")}`}, { status: 500 });
        }
        return NextResponse.json({ message: `Trash emptied successfully deleted ${deleteCount} file(s)` }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Error emptying the trash can"}, {status: 500});
    }
}