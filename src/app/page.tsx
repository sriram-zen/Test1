import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {/* Need to remove this section once application generation Begins  ----START SECTION----*/}
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by prompting{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              Alchemi will help to build your app
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Scope the features, Brainstorm the implementation plan, Generate the code and Deploy it.
          </li>
          <li className="tracking-[-.01em]">
            Alchemi uses supabase as a backend. Vercel for deployment.
          </li>
        </ol>
        {/* Need to remove this section once application generation Begins  ----START SECTION----*/}  
        
      </main>
      
    </div>
  );
}
