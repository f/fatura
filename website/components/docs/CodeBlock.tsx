import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  lang?: string;
  title?: string;
}

export async function CodeBlock({ code, lang = "ts", title }: CodeBlockProps) {
  const rawHtml = await codeToHtml(code, {
    lang,
    theme: "github-dark",
  });
  const html = rawHtml.replace(
    /<pre class="([^"]*shiki[^"]*)" style="/,
    '<pre class="$1" style="white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; max-width: 100%; '
  );

  return (
    <div className="code-shell">
      {title ? <div className="code-shell__title">{title}</div> : null}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
