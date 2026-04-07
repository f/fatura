import Link from "next/link";
import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
    h1: (props) => (
        <h1
            className="section-title"
            style={{ fontSize: "clamp(1.6rem, 4.2vw, 2.6rem)", marginTop: "0.3rem" }}
            {...props}
        />
    ),
    h2: (props) => <h2 className="section-title" style={{ fontSize: "1.45rem", marginTop: "1rem" }} {...props} />,
    h3: (props) => <h3 style={{ fontSize: "1.16rem", fontWeight: 700, marginTop: "0.9rem" }} {...props} />,
    p: (props) => <p className="text-muted" style={{ marginTop: "0.55rem" }} {...props} />,
    ul: (props) => (
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1rem", display: "grid", gap: "0.35rem" }} {...props} />
    ),
    ol: (props) => (
        <ol style={{ marginTop: "0.5rem", paddingLeft: "1rem", display: "grid", gap: "0.35rem" }} {...props} />
    ),
    li: (props) => <li className="text-muted" {...props} />,
    blockquote: (props) => (
        <blockquote
            style={{
                borderLeft: "2px solid rgba(14,165,233,0.5)",
                marginTop: "0.8rem",
                paddingLeft: "0.8rem",
                color: "#a8c4d4",
            }}
            {...props}
        />
    ),
    table: (props) => (
        <div className="mdx-table-wrap">
            <table {...props} />
        </div>
    ),
    th: (props) => <th style={{ textAlign: "left" }} {...props} />,
    a: ({ href = "", ...props }) => {
        const isInternal = href.startsWith("/");

        if (isInternal) {
            return <Link href={href} {...props} />;
        }

        return <a href={href} target="_blank" rel="noreferrer" {...props} />;
    },
    pre: (props) => <pre className="mdx-pre" {...props} />,
    code: ({ className, ...props }) => {
        const isInline = typeof className === "undefined";

        if (isInline) {
            return <code className="mdx-inline-code" {...props} />;
        }

        return <code className={className} {...props} />;
    },
};
