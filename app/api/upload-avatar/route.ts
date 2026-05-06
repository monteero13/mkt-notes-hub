import { NextResponse } from "next/server";
import { requireUser, handleApiError } from "@/lib/auth/api-guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(request: Request) {
  try {
    const { user } = await requireUser();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });
    }
    if (userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File exceeds 2 MB limit." }, { status: 400 });
    }

    const ext = file.type.split("/")[1] ?? "jpg";
    const fileName = `${userId}/avatar.${ext}`;
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true, contentType: file.type });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    return handleApiError(error);
  }
}
