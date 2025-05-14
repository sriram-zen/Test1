
import { getTemplates, createTemplate } from "@/actions/whatsappActions";
import { cookies } from "next/headers";
import { createServerClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import Image from "next/image";

export const metadata = {
  title: "WhatsApp Template Management",
};

export default async function WhatsappTemplateManagementPage() {
  // Get the admin's trust ID (assume first trust for now)
  const supabase = createServerClient(cookies());
  const {
    data: adminTrusts = [],
  } = await supabase
    .from("trust_admins")
    .select("trust_id")
    .eq("user_id", supabase.auth.getUser().then((u) => u?.user?.id));

  const trust_id = adminTrusts?.[0]?.trust_id ?? "";

  const { templates } = await getTemplates(trust_id);

  async function handleCreate(formData: FormData) {
    "use server";
    const name = formData.get("template_name") as string;
    const content = formData.get("template_content") as string;
    await createTemplate({
      trust_id,
      template_name: name,
      template_content: content,
    });
    revalidatePath("/admin/whatsapp-template-management");
  }

  return (
    <main className="container max-w-2xl py-12 space-y-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold mb-2 flex gap-2 items-center">
            <Image
              src="https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&w=80"
              width={24}
              height={24}
              alt="WhatsApp"
              className="rounded"
              unoptimized
            />
            WhatsApp Template Management
          </h1>
          <p className="text-muted-foreground">
            Manage your WhatsApp message templates for event invitations and receipts.
          </p>
        </CardHeader>
        <CardContent>
          <form action={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="template_name">Template Name</Label>
              <Input
                id="template_name"
                name="template_name"
                required
                placeholder="e.g. Event Invite"
                maxLength={64}
              />
            </div>
            <div>
              <Label htmlFor="template_content">Template Content</Label>
              <Textarea
                id="template_content"
                name="template_content"
                required
                placeholder="Hello {{name}}, you are invited to our event on {{date}} at {{venue}}."
                maxLength={512}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Use <span className="font-mono bg-muted px-1 rounded">{"{{variable}}"}</span> for dynamic placeholders.
              </p>
            </div>
            <Button type="submit" className="w-full">
              Add Template
            </Button>
          </form>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-xl font-semibold mb-4">Existing Templates</h2>
        <div className="space-y-4">
          {templates.length === 0 && (
            <div className="text-muted-foreground">No templates found.</div>
          )}
          {templates.map((tpl: any) => (
            <Card key={tpl.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{tpl.template_name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(tpl.created_at).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap break-all text-sm rounded p-2 bg-muted">{tpl.template_content}</pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
