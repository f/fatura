"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DocMeta } from "@/lib/docs";
import { DocsSidebar } from "@/components/docs/DocsSidebar";

interface DocsLandingClientProps {
    docs: DocMeta[];
    groupedDocs: Record<string, DocMeta[]>;
}

function filterGroupedDocs(docs: DocMeta[], query: string): Record<string, DocMeta[]> {
    const normalized = query.trim().toLowerCase();

    const filtered =
        normalized.length === 0
            ? docs
            : docs.filter((doc) => {
                  const haystack = [doc.title, doc.description, doc.group].filter(Boolean).join(" ").toLowerCase();
                  return haystack.includes(normalized);
              });

    return filtered.reduce<Record<string, DocMeta[]>>((groups, doc) => {
        if (!groups[doc.group]) {
            groups[doc.group] = [];
        }

        groups[doc.group].push(doc);
        return groups;
    }, {});
}

export function DocsLandingClient({ docs, groupedDocs }: DocsLandingClientProps) {
    const [query, setQuery] = useState("");

    const filteredGroups = useMemo(() => filterGroupedDocs(docs, query), [docs, query]);
    const filteredDocs = useMemo(() => Object.values(filteredGroups).flat(), [filteredGroups]);

    return (
        <div className="docs-layout">
            <DocsSidebar groupedDocs={query.trim().length > 0 ? filteredGroups : groupedDocs} />

            <div className="docs-main" style={{ display: "grid", gap: "0.9rem" }}>
                <section className="section-block">
                    <p className="text-muted">Fatura.js — Dokümantasyon</p>
                    <h1
                        className="section-title"
                        style={{
                            fontSize: "clamp(1.6rem, 4.2vw, 2.5rem)",
                            marginTop: "0.6rem",
                        }}
                    >
                        Kurulumdan API kullanımına: adım adım rehber ve örnekler.
                    </h1>
                    <p className="text-muted" style={{ marginTop: "0.8rem" }}>
                        Aşağıdaki listeden konu seçebilir veya arama kutusuyla başlık ve açıklamalarda arama
                        yapabilirsiniz.
                    </p>
                    <p className="text-muted" style={{ marginTop: "0.55rem", fontSize: "0.88rem" }}>
                        Yapay zeka ve agent'lar için düz metin:{" "}
                        <Link
                            href="/llms.txt"
                            style={{
                                color: "var(--accent-soft)",
                                textDecoration: "underline",
                                textUnderlineOffset: "3px",
                            }}
                        >
                            llms.txt
                        </Link>
                        {" · "}
                        <Link
                            href="/llms-full.txt"
                            style={{
                                color: "var(--accent-soft)",
                                textDecoration: "underline",
                                textUnderlineOffset: "3px",
                            }}
                        >
                            llms-full.txt
                        </Link>
                    </p>

                    <label
                        style={{
                            marginTop: "0.9rem",
                            display: "grid",
                            gap: "0.35rem",
                        }}
                    >
                        <span className="text-muted" style={{ fontSize: "0.84rem" }}>
                            Doküman ara
                        </span>
                        <input
                            className="field"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Örn. getToken, fatura, TypeScript"
                        />
                    </label>
                </section>

                <section className="section-block">
                    <h2 className="section-title" style={{ fontSize: "1.35rem" }}>
                        Tüm konular
                    </h2>

                    {filteredDocs.length === 0 ? (
                        <p className="text-muted" style={{ marginTop: "0.8rem" }}>
                            Aramanıza uygun doküman bulunamadı.
                        </p>
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                gap: "0.65rem",
                                marginTop: "0.8rem",
                            }}
                        >
                            {Object.entries(filteredGroups).map(([group, groupDocs]) => (
                                <section key={group}>
                                    <p
                                        className="text-muted"
                                        style={{
                                            fontSize: "0.78rem",
                                            letterSpacing: "0.08em",
                                            marginBottom: "0.45rem",
                                        }}
                                    >
                                        {group.toUpperCase()}
                                    </p>
                                    <div
                                        style={{
                                            display: "grid",
                                            gap: "0.55rem",
                                        }}
                                    >
                                        {groupDocs.map((doc) => (
                                            <Link
                                                key={doc.slug}
                                                href={`/dokumantasyon/${doc.slug}`}
                                                className="docs-card"
                                            >
                                                <strong>{doc.title}</strong>
                                                {doc.description ? (
                                                    <span
                                                        className="text-muted"
                                                        style={{
                                                            fontSize: "0.9rem",
                                                        }}
                                                    >
                                                        {doc.description}
                                                    </span>
                                                ) : null}
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
