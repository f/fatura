import "server-only";

import path from "node:path";
import { promises as fs } from "node:fs";
import matter from "gray-matter";

export interface DocMeta {
    slug: string;
    title: string;
    description?: string;
    order: number;
    group: string;
    draft: boolean;
}

export interface DocEntry {
    meta: DocMeta;
    content: string;
}

const DOCS_DIR = path.join(process.cwd(), "src/content/docs");

function parseDocMeta(slug: string, rawData: Record<string, unknown>): DocMeta {
    const title = rawData.title;
    const description = rawData.description;
    const order = rawData.order;
    const group = rawData.group;
    const draft = rawData.draft;

    if (typeof title !== "string" || title.trim().length === 0) {
        throw new Error(`Invalid frontmatter in ${slug}.mdx: title must be a non-empty string.`);
    }

    if (typeof order !== "number" || Number.isNaN(order)) {
        throw new Error(`Invalid frontmatter in ${slug}.mdx: order must be a number.`);
    }

    if (typeof description !== "undefined" && typeof description !== "string") {
        throw new Error(`Invalid frontmatter in ${slug}.mdx: description must be a string.`);
    }

    if (typeof group !== "undefined" && typeof group !== "string") {
        throw new Error(`Invalid frontmatter in ${slug}.mdx: group must be a string.`);
    }

    if (typeof draft !== "undefined" && typeof draft !== "boolean") {
        throw new Error(`Invalid frontmatter in ${slug}.mdx: draft must be a boolean.`);
    }

    return {
        slug,
        title,
        description,
        order,
        group: group ?? "Genel",
        draft: draft ?? false,
    };
}

async function readDocFileBySlug(slug: string): Promise<DocEntry | null> {
    const filePath = path.join(DOCS_DIR, `${slug}.mdx`);

    try {
        const raw = await fs.readFile(filePath, "utf8");
        const parsed = matter(raw);
        const meta = parseDocMeta(slug, parsed.data);
        return { meta, content: parsed.content.trim() };
    } catch (cause) {
        if ((cause as NodeJS.ErrnoException).code === "ENOENT") {
            return null;
        }

        throw cause;
    }
}

export async function getAllDocsMeta(): Promise<DocMeta[]> {
    const entries = await fs.readdir(DOCS_DIR, { withFileTypes: true });

    const mdxFiles = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
        .map((entry) => entry.name);

    const docs = await Promise.all(
        mdxFiles.map(async (fileName) => {
            const slug = fileName.slice(0, -4);
            const doc = await readDocFileBySlug(slug);

            if (doc === null) {
                throw new Error(`Unable to read doc file: ${fileName}`);
            }

            return doc.meta;
        }),
    );

    return docs
        .filter((doc) => !doc.draft)
        .sort((left, right) =>
            left.order === right.order ? left.title.localeCompare(right.title) : left.order - right.order,
        );
}

export async function getDocBySlug(slug: string): Promise<DocEntry | null> {
    const doc = await readDocFileBySlug(slug);

    if (doc === null || doc.meta.draft) {
        return null;
    }

    return doc;
}

export async function getDocsByGroup(): Promise<Record<string, DocMeta[]>> {
    const docs = await getAllDocsMeta();
    const groups: Record<string, DocMeta[]> = {};

    docs.forEach((doc) => {
        if (!groups[doc.group]) {
            groups[doc.group] = [];
        }

        groups[doc.group].push(doc);
    });

    return groups;
}

/** Sıra ve taslak filtresi `getAllDocsMeta` ile aynı; gövde içeriği dahil. */
export async function getAllDocEntriesOrdered(): Promise<DocEntry[]> {
    const metas = await getAllDocsMeta();
    const entries = await Promise.all(metas.map((meta) => readDocFileBySlug(meta.slug)));
    return entries.filter((entry): entry is DocEntry => entry !== null);
}
