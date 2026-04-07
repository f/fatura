import { DocsLandingClient } from "@/components/docs/DocsLandingClient";
import { getAllDocsMeta, getDocsByGroup } from "@/lib/docs";

export default async function DocsLandingPage() {
  const [docs, groupedDocs] = await Promise.all([getAllDocsMeta(), getDocsByGroup()]);

  return <DocsLandingClient docs={docs} groupedDocs={groupedDocs} />;
}
