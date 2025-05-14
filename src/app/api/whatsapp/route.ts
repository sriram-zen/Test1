
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

/**
 * POST /api/whatsapp
 * Body: { trust_id, template_id, user_id, message_params }
 * - trust_id: uuid of the trust/org
 * - template_id: uuid of the whatsapp_templates row
 * - user_id: uuid of the target user
 * - message_params: object (for template interpolation)
 */
export async function POST(req: NextRequest) {
  const supabase = createServerClient(cookies());
  try {
    const { trust_id, template_id, user_id, message_params } = await req.json();

    // 1. Get template
    const { data: template, error: templateError } = await supabase
      .from("whatsapp_templates")
      .select("*")
      .eq("id", template_id)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // 2. Get user WhatsApp opt-in
    const { data: optin, error: optinError } = await supabase
      .from("user_whatsapp_optins")
      .select("opted_in")
      .eq("user_id", user_id)
      .single();

    if (optinError || !optin?.opted_in) {
      return NextResponse.json({ error: "User not opted in to WhatsApp messaging" }, { status: 403 });
    }

    // 3. Get user profile (for WhatsApp number)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, whatsapp_number, email")
      .eq("id", user_id)
      .single();

    if (userError || !user?.whatsapp_number) {
      return NextResponse.json({ error: "User WhatsApp number not found" }, { status: 400 });
    }

    // 4. Interpolate template
    let message = template.template_content;
    if (typeof message_params === "object" && message_params !== null) {
      for (const [key, value] of Object.entries(message_params)) {
        message = message.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), String(value));
      }
    }

    // 5. Send WhatsApp message (stub/replace with your provider integration)
    // Example: Call external WhatsApp API (replace with real endpoint!)
    // const apiResponse = await fetch("https://your-whatsapp-api/send", { ... });
    // For now, mock sending
    const message_id = "mock-message-id-" + Date.now();

    // 6. Track delivery
    const { error: trackingError } = await supabase.from("whatsapp_delivery_tracking").insert([{
      message_id,
      user_id,
      delivery_status: "sent",
      error_message: null,
      sent_at: new Date().toISOString()
    }]);

    if (trackingError) {
      return NextResponse.json({ error: "Failed to track delivery" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message_id });
  } catch (err: any) {
    // Log error in delivery tracking if possible
    try {
      const body = await req.json();
      const supabase = createServerClient(cookies());
      await supabase.from("whatsapp_delivery_tracking").insert([{
        message_id: "error-" + Date.now(),
        user_id: body?.user_id ?? null,
        delivery_status: "failed",
        error_message: err.message || "Unknown error",
        sent_at: new Date().toISOString()
      }]);
    } catch {}
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
