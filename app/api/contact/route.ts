import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(150),
  message: z.string().min(10, "Message must be at least 10 characters").max(3000),
  category: z.string().optional().default("general"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = ContactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, email, subject, message, category } = result.data;
    const adminDb = getAdminSupabaseClient();

    const { data, error } = await adminDb
      .from("contact_submissions")
      .insert({
        name,
        email,
        subject,
        message,
        category,
        status: "open",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[API:contact] Insert failed:", error);
      return NextResponse.json({ error: "Failed to submit message." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      message: "Thank you for reaching out! The NexaAI team will get back to you shortly.",
    });
  } catch (err: any) {
    console.error("[API:contact] Unhandled error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
