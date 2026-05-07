import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type WorkspaceRole = "owner" | "admin" | "manager" | "editor" | "viewer" | "client_guest";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function apiError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new ApiError(401, "Unauthorized");
  }
  return { user, supabase };
}

export async function requireMember(
  workspaceId: string,
  userId: string,
  allowedRoles?: WorkspaceRole[]
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, is_active")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data || !data.is_active) {
    throw new ApiError(403, "Not a workspace member");
  }
  if (allowedRoles && !allowedRoles.includes(data.role as WorkspaceRole)) {
    throw new ApiError(403, "Insufficient role");
  }
  return data.role as WorkspaceRole;
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return apiError(error.status, error.message);
  }
  let message = "Internal server error";
  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    message = String((error as Record<string, unknown>).message);
  }
  console.error("[API] Unhandled error:", error);
  return apiError(500, message);
}
