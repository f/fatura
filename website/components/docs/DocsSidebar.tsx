import Link from "next/link";
import type { DocMeta } from "@/lib/docs";

interface DocsSidebarProps {
    groupedDocs: Record<string, DocMeta[]>;
    activeSlug?: string;
}

export function DocsSidebar({ groupedDocs, activeSlug }: DocsSidebarProps) {
    return (
        <aside className="section-block docs-sidebar">
            <p className="text-muted" style={{ fontSize: "0.82rem", letterSpacing: "0.08em" }}>
                DOKÜMANTASYON
            </p>

            <nav style={{ marginTop: "0.7rem", display: "grid", gap: "0.8rem" }}>
                <Link
                    href="/dokumantasyon"
                    className={`docs-link ${typeof activeSlug === "undefined" ? "is-active" : ""}`}
                >
                    Genel bakış
                </Link>

                {Object.entries(groupedDocs).map(([group, docs]) => (
                    <section key={group}>
                        <p
                            className="text-muted"
                            style={{ fontSize: "0.76rem", letterSpacing: "0.08em", marginBottom: "0.4rem" }}
                        >
                            {group.toUpperCase()}
                        </p>
                        <div style={{ display: "grid", gap: "0.4rem" }}>
                            {docs.map((doc) => (
                                <Link
                                    key={doc.slug}
                                    href={`/dokumantasyon/${doc.slug}`}
                                    className={`docs-link ${activeSlug === doc.slug ? "is-active" : ""}`}
                                >
                                    {doc.title}
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}
            </nav>

            <div
                style={{
                    marginTop: "1rem",
                    paddingTop: "0.85rem",
                    borderTop: "1px solid var(--line)",
                    display: "grid",
                    gap: "0.4rem",
                }}
            >
                <p className="text-muted" style={{ fontSize: "0.76rem", letterSpacing: "0.06em" }}>
                    DÜZ METİN (LLM)
                </p>
                <Link href="/llms.txt" className="docs-link">
                    llms.txt
                </Link>
                <Link href="/llms-full.txt" className="docs-link">
                    llms-full.txt
                </Link>
            </div>
        </aside>
    );
}
