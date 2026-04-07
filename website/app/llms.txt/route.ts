import { buildLlmsIndexContent } from "@/lib/llms";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET(): Promise<Response> {
  const body = await buildLlmsIndexContent();
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
