import { NextResponse } from "next/server";
import { requireUser, handleApiError } from "@/lib/auth/api-guard";

export const dynamic = "force-dynamic";

// In-memory rate limiting map: userId -> last submission timestamp (ms)
const submissionTracker = new Map<string, number>();
const LIMIT_COOLDOWN_MS = 60 * 1000; // 1 minute cooldown per user

export async function POST(request: Request) {
  try {
    // 1. Authenticate user securely on the server
    const { user } = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Client and User Server-Side Cooldown Check
    const now = Date.now();
    const lastSubmit = submissionTracker.get(user.id);
    if (lastSubmit && now - lastSubmit < LIMIT_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((LIMIT_COOLDOWN_MS - (now - lastSubmit)) / 1000);
      return NextResponse.json(
        { 
          error: "Too Many Requests", 
          message: `Please wait ${remainingSeconds} seconds before submitting again.` 
        }, 
        { status: 429 }
      );
    }

    // 3. Parse input body
    const { category, subject, message, honeypot } = await request.json();

    // 4. Honeypot check (anti-spam bot control)
    if (honeypot && honeypot.trim() !== "") {
      console.warn(`[Contact API] Honeypot triggered by user: ${user.id}`);
      // Silently succeed to trick spam-bots without consuming system/mail resources
      return NextResponse.json({ success: true, status: "processed_silently" });
    }

    // 5. Strict input validation
    if (!category || (category !== "ayuda" && category !== "mejoras y correccion")) {
      return NextResponse.json({ error: "Validation Error", message: "Invalid category selected." }, { status: 400 });
    }

    if (!subject || typeof subject !== "string" || subject.trim().length < 3 || subject.length > 100) {
      return NextResponse.json({ error: "Validation Error", message: "Subject must be between 3 and 100 characters." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim().length < 10 || message.length > 1000) {
      return NextResponse.json({ error: "Validation Error", message: "Message must be between 10 and 1000 characters." }, { status: 400 });
    }

    // 6. Sanitization: Strip basic HTML and escape unsafe characters to prevent injection
    const sanitizedSubject = subject
      .replace(/<[^>]*>/g, "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .trim();

    const sanitizedMessage = message
      .replace(/<[^>]*>/g, "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .trim();

    // 7. Track the submission to prevent mailbox saturation
    submissionTracker.set(user.id, now);

    // 8. Log the safe/sanitized contact request
    // In production, this can be hooked into Resend, SendGrid, Nodemailer, or saved to a DB table
    console.log("=== SECURE CONTACT FORM SUBMISSION ===");
    console.log(`User ID: ${user.id}`);
    console.log(`User Email: ${user.email}`);
    console.log(`Category: ${category}`);
    console.log(`Subject: ${sanitizedSubject}`);
    console.log(`Message Length: ${sanitizedMessage.length} characters`);
    console.log("=======================================");

    return NextResponse.json({ 
      success: true, 
      message: "Your message has been safely received. We will contact you soon." 
    });

  } catch (error) {
    return handleApiError(error);
  }
}
