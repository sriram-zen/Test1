
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";
import { createClient } from "@/utils/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsappOptin, setWhatsappOptin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      setError(error?.message ?? "Sign up failed.");
      setPending(false);
      return;
    }

    // Store WhatsApp opt-in status
    const user_id = data.user.id;
    const { error: optinError } = await supabase
      .from("user_whatsapp_optins")
      .upsert([{ user_id, opted_in: whatsappOptin }], { onConflict: "user_id" });

    if (optinError) {
      setError("Failed to set WhatsApp opt-in status.");
      setPending(false);
      return;
    }

    router.push("/protected");
  }

  return (
    <main className="container max-w-sm py-12">
      <form
        className="space-y-6 bg-card p-6 rounded shadow"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
        {error && <FormMessage variant="error">{error}</FormMessage>}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="whatsappOptin"
            checked={whatsappOptin}
            onCheckedChange={(v) => setWhatsappOptin(Boolean(v))}
            disabled={pending}
          />
          <Label htmlFor="whatsappOptin" className="cursor-pointer">
            I agree to receive event invites and receipts via WhatsApp.
          </Label>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing up..." : "Sign Up"}
        </Button>
      </form>
    </main>
  );
}
