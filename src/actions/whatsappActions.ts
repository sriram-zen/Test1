
"use server";

import { createServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Send WhatsApp message and track delivery
export async function sendMessage({
  trust_id,
  template_id,
  user_id,
  message_params,
}: {
  trust_id: string;
  template_id: string;
  user_id: string;
  message_params: Record<string, string>;
}) {
  // Call the internal API route
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/whatsapp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trust_id, template_id, user_id, message_params }),
    }
  );
  return await res.json();
}

// Get templates for a trust
export async function getTemplates(trust_id: string) {
  const supabase = createServerClient(cookies());
  const { data, error } = await supabase
    .from("whatsapp_templates")
    .select("*")
    .eq("trust_id", trust_id)
    .order("created_at", { ascending: false });
  return { templates: data ?? [], error };
}

// Track delivery (fetch delivery status for a user)
export async function trackDelivery(user_id: string) {
  const supabase = createServerClient(cookies());
  const { data, error } = await supabase
    .from("whatsapp_delivery_tracking")
    .select("*")
    .eq("user_id", user_id)
    .order("sent_at", { ascending: false });
  return { deliveries: data ?? [], error };
}

// Create a new WhatsApp template
export async function createTemplate({
  trust_id,
  template_name,
  template_content,
}: {
  trust_id: string;
  template_name: string;
  template_content: string;
}) {
  const supabase = createServerClient(cookies());
  const { data, error } = await supabase
    .from("whatsapp_templates")
    .insert([{ trust_id, template_name, template_content }])
    .select("*")
    .single();
  return { template: data, error };
}
