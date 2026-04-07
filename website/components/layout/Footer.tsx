import Link from "next/link";

const llmsLinkStyle = {
    color: "var(--accent-soft)",
    textDecoration: "underline" as const,
    textUnderlineOffset: "3px",
};

export function Footer() {
    return (
        <footer className="site-footer">
            <div className="site-footer__inner">
                <p>fatura.js, GİB e-Arşiv portal entegrasyonu için açık kaynak bir kütüphanedir.</p>
                <p className="text-muted">
                    Uyarı: Gerçek faturalar mali kayıt oluşturur. İşlem yapmadan önce test ortamında doğrulama yapın.
                </p>
                <p className="text-muted" style={{ marginTop: "0.35rem" }}>
                    LLM:{" "}
                    <Link href="/llms.txt" style={llmsLinkStyle}>
                        llms.txt
                    </Link>
                    {" · "}
                    <Link href="/llms-full.txt" style={llmsLinkStyle}>
                        llms-full.txt
                    </Link>
                </p>
            </div>
        </footer>
    );
}
