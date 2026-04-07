import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { mdxComponents } from "@/components/docs/mdx-components";
import { getAllDocsMeta, getDocBySlug, getDocsByGroup } from "@/lib/docs";

export async function generateStaticParams() {
    const docs = await getAllDocsMeta();
    return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const doc = await getDocBySlug(slug);

    if (doc === null) {
        return {
            title: "Doküman bulunamadı",
        };
    }

    return {
        title: `${doc.meta.title} | Fatura.js dokümantasyonu`,
        description: doc.meta.description,
    };
}

export default async function DocDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const [doc, groupedDocs] = await Promise.all([getDocBySlug(slug), getDocsByGroup()]);

    if (doc === null) {
        notFound();
    }

    const { content } = await compileMDX({
        source: doc.content,
        options: {
            mdxOptions: {
                remarkPlugins: [remarkGfm],
            },
        },
        components: mdxComponents,
    });

    return (
        <div className="docs-layout">
            <DocsSidebar groupedDocs={groupedDocs} activeSlug={doc.meta.slug} />

            <article className="docs-main" style={{ display: "grid", gap: "0.9rem" }}>
                <section className="section-block">
                    <p className="text-muted">{doc.meta.group}</p>
                    <h1
                        className="section-title"
                        style={{ fontSize: "clamp(1.6rem, 4.2vw, 2.5rem)", marginTop: "0.55rem" }}
                    >
                        {doc.meta.title}
                    </h1>
                    {doc.meta.description ? (
                        <p className="text-muted" style={{ marginTop: "0.75rem" }}>
                            {doc.meta.description}
                        </p>
                    ) : null}
                </section>

                <section className="section-block">
                    <div className="mdx-content">{content}</div>
                </section>
            </article>
        </div>
    );
}
