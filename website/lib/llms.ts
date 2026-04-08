import "server-only";

import { getAllDocEntriesOrdered } from "@/lib/docs";

const SITE_TITLE = "fatura.js";
const NPM_PACKAGE = "fatura";
const GITHUB_URL = "https://github.com/f/fatura";

/**
 * Kod blokları (```) dokunulmadan; import ve PascalCase JSX kullanımlarını MDX gövdesinden temizler.
 */
export function stripJsx(content: string): string {
    const lines = content.split("\n");
    const result: string[] = [];
    let inCodeFence = false;
    let inJsxBlock = false;

    for (const line of lines) {
        if (/^```/.test(line)) {
            inCodeFence = !inCodeFence;
            result.push(line);
            continue;
        }

        if (inCodeFence) {
            result.push(line);
            continue;
        }

        if (inJsxBlock) {
            if (/^\s*\/>/.test(line)) {
                inJsxBlock = false;
            }
            continue;
        }

        if (/^import\s+.+from\s+['"]/.test(line)) {
            continue;
        }

        if (/^<[A-Z]/.test(line)) {
            if (/\/>$/.test(line.trimEnd())) {
                continue;
            }
            inJsxBlock = true;
            continue;
        }

        result.push(line);
    }

    return result.join("\n");
}

function baseUrl(): string {
    const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
    return raw.replace(/\/$/, "");
}

function absPath(path: string): string {
    const base = baseUrl();
    if (!base) {
        return path;
    }
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Tek dosyada birleştirilmiş dokümantasyon (kod blokları korunur). */
export async function buildLlmsFullContent(): Promise<string> {
    const sections: string[] = [];

    sections.push(`# ${SITE_TITLE} — Tam dokümantasyon\n\n`);
    sections.push(
        `Kaynak: ${absPath("/")} | npm: ${NPM_PACKAGE} | GitHub: ${GITHUB_URL} | Özet dizin: ${absPath("/llms.txt")}\n`,
    );

    const entries = await getAllDocEntriesOrdered();

    for (const entry of entries) {
        const cleaned = stripJsx(entry.content).trim();
        const title = entry.meta.title;
        sections.push(`\n---\n\n## ${title}\n\n${cleaned}`);
    }

    return `${sections.join("")}\n`;
}

/** Kısa dizin: proje özeti, tam metin bağlantısı ve doküman listesi. */
export async function buildLlmsIndexContent(): Promise<string> {
    const lines: string[] = [];

    lines.push(`# ${SITE_TITLE} — LLM / doküman dizini\n`);
    lines.push("");
    lines.push(
        "Bu site, GİB e-Arşiv portal entegrasyonu için `fatura` npm paketinin Türkçe dokümantasyonunu ve canlı deneme arayüzünü sunar.",
    );
    lines.push("");
    lines.push(`- npm: \`${NPM_PACKAGE}\``);
    lines.push(`- GitHub: ${GITHUB_URL}`);
    if (baseUrl()) {
        lines.push(`- Site: ${baseUrl()}`);
    }
    lines.push("");
    lines.push("## Tam içerik (tek dosya)");
    lines.push("");
    lines.push(`Tüm MDX dokümanlarının birleşik düz metni: ${absPath("/llms-full.txt")}`);
    lines.push("");
    lines.push("## Dokümantasyon sayfaları");
    lines.push("");

    const entries = await getAllDocEntriesOrdered();
    entries.forEach((entry, index) => {
        const href = absPath(`/dokumantasyon/${entry.meta.slug}`);
        const desc = entry.meta.description ? ` — ${entry.meta.description}` : "";
        lines.push(`${index + 1}. [${entry.meta.title}](${href})${desc}`);
    });

    lines.push("");
    lines.push(`## Canlı demo`);
    lines.push("");
    lines.push(`- ${absPath("/demo")}`);
    lines.push("");

    return lines.join("\n");
}
